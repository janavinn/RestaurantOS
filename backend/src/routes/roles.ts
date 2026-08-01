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

const DEFAULT_PERMISSIONS = {
  view_staff: true, add_staff: false, edit_staff: false, remove_staff: false,
  view_orders: true, create_orders: true, void_orders: false, apply_discounts: false,
  view_reports: false, export_reports: false
};

const SYSTEM_ROLES = [
  { roleName: 'Owner', type: 'System', permissions: { ...DEFAULT_PERMISSIONS, view_staff: true, add_staff: true, edit_staff: true, remove_staff: true, void_orders: true, apply_discounts: true, view_reports: true, export_reports: true } },
  { roleName: 'Manager', type: 'System', permissions: { ...DEFAULT_PERMISSIONS, add_staff: true, edit_staff: true, void_orders: true, view_reports: true } },
  { roleName: 'Chef', type: 'System', permissions: { ...DEFAULT_PERMISSIONS, view_orders: true, create_orders: false } },
  { roleName: 'Waiter', type: 'System', permissions: { ...DEFAULT_PERMISSIONS, view_orders: true, create_orders: true } },
  { roleName: 'Cashier', type: 'System', permissions: { ...DEFAULT_PERMISSIONS, view_orders: true, apply_discounts: true } },
  { roleName: 'Store Keeper', type: 'System', permissions: { ...DEFAULT_PERMISSIONS, view_orders: false, create_orders: false } }
];

async function ensureSystemRoles(restaurantId: string) {
  const existing = await prisma.roleConfig.count({ where: { restaurantId } });
  if (existing === 0) {
    await prisma.roleConfig.createMany({
      data: SYSTEM_ROLES.map(r => ({
        ...r,
        restaurantId
      }))
    });
  }
}

// GET all roles
router.get('/', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  try {
    await ensureSystemRoles(restaurantId);
    const roles = await prisma.roleConfig.findMany({
      where: { restaurantId },
      orderBy: { roleName: 'asc' }
    });

    // Count users for each role
    const users = await prisma.user.findMany({
      where: { restaurantId },
      select: { role: true }
    });

    const roleCounts = users.reduce((acc: any, user: any) => {
      // Normalize role names for matching
      const r = user.role.toLowerCase();
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});

    const enrichedRoles = roles.map((r: any) => ({
      ...r,
      users: roleCounts[r.roleName.toLowerCase()] || 0
    }));

    res.json(enrichedRoles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST create custom role
router.post('/', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  const { roleName, permissions } = req.body;
  try {
    const existing = await prisma.roleConfig.findUnique({
      where: { roleName_restaurantId: { roleName, restaurantId } }
    });
    if (existing) {
      return res.status(400).json({ error: 'Role already exists' });
    }

    const newRole = await prisma.roleConfig.create({
      data: {
        roleName,
        type: 'Custom',
        permissions: permissions || DEFAULT_PERMISSIONS,
        restaurantId
      }
    });
    res.json({ ...newRole, users: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// PUT update permissions
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  const { id } = req.params;
  const { permissions } = req.body;
  
  try {
    const role = await prisma.roleConfig.findUnique({ where: { id } });
    if (!role || role.restaurantId !== restaurantId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updated = await prisma.roleConfig.update({
      where: { id },
      data: { permissions }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

export default router;
