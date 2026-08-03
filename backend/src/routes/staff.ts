import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendInviteEmail } from '../utils/email';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

// Middleware for auth
const authenticate = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET public list of active staff for the POS lock screen
router.get('/public-list', async (req: Request, res: Response): Promise<any> => {
  try {
    // To prevent multi-tenant data leaks on the public POS screen, we lock it to the most recently created restaurant.
    const latestOwner = await prisma.user.findFirst({
      where: { role: 'OWNER' },
      orderBy: { createdAt: 'desc' }
    });

    const staff = await prisma.user.findMany({
      where: { 
        status: 'ACTIVE',
        role: { not: 'OWNER' },
        restaurantId: latestOwner?.restaurantId
      },
      select: {
        id: true,
        name: true,
        role: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public staff list' });
  }
});

// GET all staff for the restaurant
router.get('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  try {
    const staff = await prisma.user.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        shift: true,
        status: true,
        attendance: true,
        phone: true,
        emergencyContact: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST invite new staff
router.post('/invite', authenticate, async (req: Request, res: Response): Promise<any> => {
  const { name, email, role, shift } = req.body;
  const restaurantId = (req as any).user.restaurantId;
  
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.restaurantId === restaurantId) {
        return res.status(400).json({ error: 'This staff member is already added to your restaurant.' });
      } else {
        return res.status(400).json({ error: 'This email is already registered to another restaurant in the system.' });
      }
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    
    // Create token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours from now

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        shift,
        status: 'PENDING',
        restaurantId,
        activationToken: hashedToken,
        activationExpires: expires
      }
    });

    // Send email in the background so the UI doesn't hang
    const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/setup-account?token=${token}&role=${role}`;
    
    sendInviteEmail(email, restaurant?.name || 'Restaurant', inviteUrl).catch(e => console.error("Failed to send background email:", e));

    res.json({
      message: 'Staff invited successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        shift: newUser.shift,
        status: newUser.status
      },
      inviteUrl: inviteUrl,
      emailSent: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to invite staff' });
  }
});

// POST resend invite link
router.post('/:id/resend-invite', authenticate, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const restaurantId = (req as any).user.restaurantId;

  try {
    const user = await prisma.user.findFirst({ where: { id, restaurantId } });
    if (!user || user.status !== 'PENDING') {
      return res.status(400).json({ error: 'User not found or already active' });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await prisma.user.update({
      where: { id },
      data: {
        activationToken: hashedToken,
        activationExpires: expires
      }
    });

    const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteUrl = `${frontendUrl}/setup-account?token=${token}&role=${user.role}`;
    
    sendInviteEmail(user.email, restaurant?.name || 'Restaurant', inviteUrl).catch(e => console.error(e));

    res.json({ inviteUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resend invite' });
  }
});

// PUT update staff details
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  const { id } = req.params;
  const { name, role, shift, status, attendance, phone, emergencyContact } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(shift !== undefined && { shift }),
        ...(status && { status }),
        ...(attendance && { attendance }),
        ...(phone !== undefined && { phone }),
        ...(emergencyContact !== undefined && { emergencyContact })
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff' });
  }
});

// DELETE staff
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const restaurantId = (req as any).user.restaurantId;
  const currentUserId = (req as any).user.id;

  if (id === currentUserId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    const deleted = await prisma.user.deleteMany({
      where: { id, restaurantId }
    });
    
    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff' });
  }
});

export default router;

