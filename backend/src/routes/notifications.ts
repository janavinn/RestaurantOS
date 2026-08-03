import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

// Get all notifications for the restaurant
router.get('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const notifications = await prisma.notification.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to latest 50
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all as read
router.put('/mark-read', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    await prisma.notification.updateMany({
      where: { restaurantId, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'Marked all as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

export default router;
