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

router.use(authenticate);

// Get all tables for the restaurant
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { tableNumber: 'asc' },
      include: {
        orders: {
          where: { status: { notIn: ['PAID', 'COMPLETED'] } },
          include: { items: { include: { menuItem: true } } }
        }
      }
    });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Create a new table
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { tableNumber } = req.body;

    if (!tableNumber) return res.status(400).json({ error: 'Table number is required' });

    // Check if table number already exists
    const existingTable = await prisma.table.findFirst({
      where: { restaurantId, tableNumber: Number(tableNumber) }
    });

    if (existingTable) {
      return res.status(400).json({ error: 'Table number already exists' });
    }

    const newTable = await prisma.table.create({
      data: {
        tableNumber: Number(tableNumber),
        restaurantId,
        status: 'AVAILABLE'
      }
    });

    res.status(201).json(newTable);
  } catch (err) {
    console.error('Error creating table:', err);
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// Delete a table
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;

    const table = await prisma.table.findUnique({ where: { id } });
    if (!table || table.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Table not found' });
    }

    await prisma.table.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting table:', err);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

// Update a table status
router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { id } = req.params;
    const { status } = req.body;

    const table = await prisma.table.findUnique({ where: { id } });
    if (!table || table.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: { status }
    });

    res.json(updatedTable);
  } catch (err) {
    console.error('Error updating table:', err);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// Initialize tables (if none exist, create 20 tables) and mock menu items
router.post('/init', async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const existingTables = await prisma.table.count({ where: { restaurantId } });
    
    if (existingTables === 0) {
      const tablesToCreate = Array.from({ length: 20 }, (_, i) => ({
        tableNumber: i + 1,
        restaurantId,
        status: 'AVAILABLE'
      }));
      await prisma.table.createMany({ data: tablesToCreate });
    }

    const existingMenu = await prisma.menuItem.count({ where: { restaurantId } });
    if (existingMenu === 0) {
      await prisma.menuItem.createMany({
        data: [
          { name: 'Paneer Butter Masala', price: 250, category: 'Main Course', restaurantId },
          { name: 'Butter Naan', price: 40, category: 'Breads', restaurantId },
          { name: 'Veg Fried Rice', price: 180, category: 'Rice', restaurantId },
          { name: 'Chicken Biryani', price: 320, category: 'Main Course', restaurantId },
          { name: 'Raita', price: 60, category: 'Sides', restaurantId },
          { name: 'Salad', price: 50, category: 'Sides', restaurantId }
        ]
      });
    }

    res.json({ message: 'Initialized tables and mock menu items' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initialize' });
  }
});

export default router;
