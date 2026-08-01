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

// GET /api/manager/dashboard
router.get('/dashboard', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;

  try {
    // 1. Active Orders (Not Completed/Cancelled)
    const activeOrders = await prisma.order.count({
      where: {
        restaurantId,
        status: { notIn: ['COMPLETED', 'CANCELLED', 'PAID'] } // Adjust based on schema definitions
      }
    });

    // 2. Avg Wait Time calculation (Mock based on volume)
    const avgWaitTimeStr = activeOrders > 0 ? `${12 + (activeOrders * 2)} mins` : '0 mins';

    // 3. Staff Present (Based on attendance)
    const staffPresent = await prisma.user.count({
      where: { restaurantId, attendance: 'Present' }
    });
    const staffTotal = await prisma.user.count({
      where: { restaurantId, role: { not: 'OWNER' } }
    });

    // 4. Tables Occupied
    const tablesOccupied = await prisma.table.count({
      where: { restaurantId, status: 'OCCUPIED' }
    });
    const tablesTotal = await prisma.table.count({
      where: { restaurantId }
    });

    // 5. Low Stock Items & Alerts
    const ingredients = await prisma.ingredient.findMany({
      where: { restaurantId }
    });
    
    let lowStockCount = 0;
    const alerts: any[] = [];
    
    ingredients.forEach(ing => {
      if (ing.stockLevel <= ing.minStock) {
        lowStockCount++;
        alerts.push({
          type: 'LOW_STOCK',
          title: `Low Stock: ${ing.name}`,
          description: `Only ${ing.stockLevel} ${ing.unit} left in inventory.`,
          actionLink: '/inventory',
          actionText: 'View Inventory'
        });
      }
    });

    // 6. Recent Staff
    const staffListRaw = await prisma.user.findMany({
      where: { restaurantId, role: { not: 'OWNER' } },
      take: 5
    });

    const staffList = staffListRaw.map(s => {
      let color = 'gray';
      if (s.attendance === 'Present') color = 'green';
      else if (s.attendance === 'Absent') color = 'red';
      else if (s.attendance === 'Leave') color = 'yellow';
      
      return {
        name: s.name,
        role: s.role,
        status: s.attendance,
        statusColor: color
      };
    });

    res.json({
      activeOrders,
      avgWaitTime: avgWaitTimeStr,
      staffPresent,
      staffTotal,
      tablesOccupied,
      tablesTotal,
      lowStockItems: lowStockCount,
      staffList,
      alerts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load manager dashboard metrics' });
  }
});

// GET /api/manager/daily-reports
router.get('/daily-reports', authenticate, async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  const period = req.query.period as string || 'today';

  try {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
    } else if (period === 'month') {
      startDate.setDate(1);
    }

    // 1. & 2. Sales & Orders
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate }
      },
      include: {
        items: { include: { menuItem: true } }
      }
    });

    let totalSales = 0;
    let completedOrders = 0;
    let preparingOrders = 0;
    let cancelledOrders = 0;

    const itemCounts: { [key: string]: number } = {};

    orders.forEach(order => {
      if (order.status === 'CANCELLED') cancelledOrders++;
      else if (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'SERVED') {
        completedOrders++;
        totalSales += order.total;
        
        // Count for best selling
        order.items.forEach(item => {
          if (item.menuItem) {
            itemCounts[item.menuItem.name] = (itemCounts[item.menuItem.name] || 0) + item.quantity;
          }
        });
      } else {
        preparingOrders++;
      }
    });

    // 3. Staff Attendance
    const allStaff = await prisma.user.findMany({ where: { restaurantId, role: { not: 'OWNER' } } });
    const staff = {
      total: allStaff.length,
      present: allStaff.filter(s => s.status === 'ACTIVE').length,
      absent: allStaff.filter(s => s.status === 'DISABLED').length,
      leave: allStaff.filter(s => s.status === 'INACTIVE').length
    };

    // 4. Table Occupancy
    const allTables = await prisma.table.findMany({ where: { restaurantId } });
    const tables = {
      total: allTables.length,
      occupied: allTables.filter(t => t.status === 'OCCUPIED').length,
      available: allTables.filter(t => t.status === 'AVAILABLE').length,
      reserved: allTables.filter(t => t.status === 'BOOKED').length
    };

    // 5. Inventory Alerts
    const ingredients = await prisma.ingredient.findMany({ where: { restaurantId } });
    const inventoryAlerts = ingredients
      .filter(i => i.stockLevel <= i.minStock)
      .map(i => ({ name: i.name, stockLevel: i.stockLevel, unit: i.unit }));

    // 6. Best Selling Items
    const bestSelling = Object.keys(itemCounts)
      .map(name => ({ name, orderCount: itemCounts[name] }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 3);

    res.json({
      sales: { total: totalSales, orderCount: orders.length },
      orders: { total: orders.length, completed: completedOrders, preparing: preparingOrders, cancelled: cancelledOrders },
      staff,
      tables,
      inventoryAlerts,
      bestSelling
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load daily reports' });
  }
});

export default router;
