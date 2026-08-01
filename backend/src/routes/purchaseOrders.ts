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

// GET all purchase orders for the restaurant
router.get('/', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: { restaurantId },
      orderBy: { date: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// POST create a new purchase order
router.post('/', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  const { supplier, total } = req.body;
  try {
    const newOrder = await prisma.purchaseOrder.create({
      data: {
        supplier,
        total,
        status: 'PENDING',
        restaurantId
      }
    });
    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'purchase',
        title: `Purchase request created for ${supplier}`,
        restaurantId
      }
    });
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// PUT update status (Accept/Reject)
router.put('/:id/status', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  const { id } = req.params;
  const { status } = req.body; // 'APPROVED' or 'REJECTED'
  
  try {
    const order = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!order || order.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });

    await prisma.activityLog.create({
      data: {
        type: 'purchase',
        title: `Purchase request for ${order.supplier} marked as ${status}`,
        restaurantId
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
