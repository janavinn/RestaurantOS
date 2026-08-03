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

router.get('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  const q = req.query.q as string;
  if (!q) return res.json({ menuItems: [], staff: [], orders: [], suppliers: [] });

  const restaurantId = (req as any).user.restaurantId;
  const searchTerm = `%${q.toLowerCase()}%`;

  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        name: { contains: q, mode: 'insensitive' }
      },
      take: 5
    });

    const staff = await prisma.user.findMany({
      where: {
        restaurantId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    // Orders usually search by ID, but since ID is UUID, let's search by status if it matches or exact ID
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        OR: [
          { id: { equals: q } },
          { status: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    const suppliers = await prisma.supplier.findMany({
      where: {
        restaurantId,
        name: { contains: q, mode: 'insensitive' }
      },
      take: 5
    });

    res.json({ menuItems, staff, orders, suppliers });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
