import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

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

// GET all purchase requests for the restaurant
router.get('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  try {
    const requests = await prisma.purchaseRequest.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase requests' });
  }
});

// POST create a new purchase request
router.post('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  // Get user info to record who requested it
  const userId = (req as any).user.id;
  const { itemName, quantity } = req.body;

  if (!itemName || !quantity) {
    return res.status(400).json({ error: 'Item name and quantity are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const newRequest = await prisma.purchaseRequest.create({
      data: {
        itemName,
        quantity: String(quantity),
        requestedBy: user.name, // Record the name of the staff requesting
        status: 'PENDING',
        restaurantId
      }
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create purchase request' });
  }
});

// PUT update status of a purchase request
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pr = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!pr || pr.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Purchase request not found' });
    }

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update purchase request' });
  }
});

export default router;
