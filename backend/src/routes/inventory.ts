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

// GET all inventory items (ingredients) for the restaurant
router.get('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const inventory = await prisma.ingredient.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' }
    });
    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// PUT /api/inventory/:id - Update stock level manually
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  const { id } = req.params;
  const { stockLevel } = req.body;

  if (stockLevel === undefined) {
    return res.status(400).json({ error: 'stockLevel is required' });
  }

  try {
    const item = await prisma.ingredient.findUnique({ where: { id } });
    if (!item || item.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    const updated = await prisma.ingredient.update({
      where: { id },
      data: { stockLevel: Number(stockLevel) }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update ingredient stock' });
  }
});

export default router;
