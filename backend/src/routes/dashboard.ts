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
  const restaurantId = (req as any).user.restaurantId;

  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. TOP METRICS
    // Sales (only count PAID bills)
    const thisMonthOrders = await prisma.order.findMany({
      where: { restaurantId, status: 'PAID', createdAt: { gte: startOfThisMonth } }
    });
    const lastMonthOrders = await prisma.order.findMany({
      where: { restaurantId, status: 'PAID', createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    
    const thisMonthSales = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const salesTrend = lastMonthSales ? ((thisMonthSales - lastMonthSales) / lastMonthSales * 100) : 100;

    // Purchases
    const thisMonthPurchases = await prisma.purchaseOrder.findMany({
      where: { restaurantId, date: { gte: startOfThisMonth } }
    });
    const lastMonthPurchases = await prisma.purchaseOrder.findMany({
      where: { restaurantId, date: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const thisMonthPurchaseTotal = thisMonthPurchases.reduce((sum, p) => sum + p.total, 0);
    const lastMonthPurchaseTotal = lastMonthPurchases.reduce((sum, p) => sum + p.total, 0);
    const purchaseTrend = lastMonthPurchaseTotal ? ((thisMonthPurchaseTotal - lastMonthPurchaseTotal) / lastMonthPurchaseTotal * 100) : 100;

    // Expenses
    const thisMonthExpenses = await prisma.expense.findMany({
      where: { restaurantId, date: { gte: startOfThisMonth } }
    });
    const lastMonthExpenses = await prisma.expense.findMany({
      where: { restaurantId, date: { gte: startOfLastMonth, lt: startOfThisMonth } }
    });
    const thisMonthExpenseTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthExpenseTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const expenseTrend = lastMonthExpenseTotal ? ((thisMonthExpenseTotal - lastMonthExpenseTotal) / lastMonthExpenseTotal * 100) : -10;

    // Profit
    const thisMonthProfit = thisMonthSales - thisMonthPurchaseTotal - thisMonthExpenseTotal;
    const lastMonthProfit = lastMonthSales - lastMonthPurchaseTotal - lastMonthExpenseTotal;
    const profitTrend = lastMonthProfit ? ((thisMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit) * 100) : 100;

    // 2. SPARKLINE DATA (Last 7 days)
    const sparklineSales = [];
    const sparklinePurchases = [];
    const sparklineExpenses = [];
    const sparklineProfit = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));

      const dOrders = await prisma.order.findMany({ where: { restaurantId, status: 'PAID', createdAt: { gte: startOfDay, lte: endOfDay } }});
      const dSales = dOrders.reduce((s, o) => s + o.total, 0);
      sparklineSales.push({ v: dSales });

      const dPurchases = await prisma.purchaseOrder.findMany({ where: { restaurantId, date: { gte: startOfDay, lte: endOfDay } }});
      const dPurch = dPurchases.reduce((s, p) => s + p.total, 0);
      sparklinePurchases.push({ v: dPurch });

      const dExp = await prisma.expense.findMany({ where: { restaurantId, date: { gte: startOfDay, lte: endOfDay } }});
      const dExpense = dExp.reduce((s, e) => s + e.amount, 0);
      sparklineExpenses.push({ v: dExpense });

      sparklineProfit.push({ v: dSales - dPurch - dExpense });
    }

    // 3. OVERVIEW
    const totalOrders = thisMonthOrders.length;
    const avgOrderValue = totalOrders ? thisMonthSales / totalOrders : 0;
    
    const activeOrders = await prisma.order.count({
      where: { restaurantId, status: { in: ['NEW', 'PREPARING', 'READY', 'SERVED', 'BILLED'] } }
    });
    
    const completedOrders = await prisma.order.count({
      where: { restaurantId, status: 'PAID', createdAt: { gte: startOfThisMonth } }
    });
    
    // 4. PENDING APPROVALS (Purchase Requests from Staff)
    const pendingApprovals = await prisma.purchaseRequest.findMany({
      where: { restaurantId, status: 'OWNER_APPROVAL' },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });

    // 5. RECENT ACTIVITIES
    const recentActivities = await prisma.activityLog.findMany({
      where: { restaurantId },
      orderBy: { time: 'desc' },
      take: 5
    });

    // 6. SALES TREND (7 days for main chart)
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const name = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      salesData.push({
        name,
        value: sparklineSales[6 - i].v
      });
    }

    // 7. TOP MENU ITEMS
    const orderItems = await prisma.orderItem.findMany({
      where: { order: { restaurantId, createdAt: { gte: startOfThisMonth } } },
      include: { menuItem: true }
    });
    
    const menuStats: Record<string, { name: string, sold: number, revenue: number, img: string }> = {};
    for (const item of orderItems) {
      if (!menuStats[item.menuItemId]) {
        menuStats[item.menuItemId] = { 
          name: item.menuItem.name, 
          sold: 0, 
          revenue: 0, 
          img: item.menuItem.img || '🍽️' 
        };
      }
      menuStats[item.menuItemId].sold += item.quantity;
      menuStats[item.menuItemId].revenue += item.price * item.quantity;
    }
    
    const topMenuItems = Object.values(menuStats)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map(item => ({
        ...item,
        revenue: `₹ ${item.revenue.toLocaleString()}`
      }));

    res.json({
      metrics: {
        sales: { value: thisMonthSales, trend: salesTrend },
        purchases: { value: thisMonthPurchaseTotal, trend: purchaseTrend },
        expenses: { value: thisMonthExpenseTotal, trend: expenseTrend },
        profit: { value: thisMonthProfit, trend: profitTrend }
      },
      sparklines: {
        sales: sparklineSales,
        purchases: sparklinePurchases,
        expenses: sparklineExpenses,
        profit: sparklineProfit
      },
      overview: {
        totalOrders,
        avgOrderValue,
        activeOrders,
        completedOrders
      },
      pendingApprovals,
      recentActivities,
      salesData,
      topMenuItems
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

router.get('/activities', authenticate, async (req: Request, res: Response) => {
  const restaurantId = (req as any).user.restaurantId;
  try {
    const logs = await prisma.activityLog.findMany({
      where: { restaurantId },
      orderBy: { time: 'desc' },
      take: 20
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;

