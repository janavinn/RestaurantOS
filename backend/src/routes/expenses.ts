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

// GET all expenses
router.get('/', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  try {
    const expenses = await prisma.expense.findMany({
      where: { restaurantId },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST new expense
router.post('/', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  const { category, description, amount, status, date } = req.body;
  
  try {
    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: Number(amount),
        status: status || 'APPROVED',
        date: date ? new Date(date) : new Date(),
        restaurantId
      }
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// DELETE expense
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  const { id } = req.params;
  
  try {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Not found' });
    }

    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// PUT update expense status (e.g., from PENDING to APPROVED)
router.put('/:id/status', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

export default router;
