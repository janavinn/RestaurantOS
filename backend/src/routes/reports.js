"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
router.get('/analytics', authenticate, async (req, res) => {
    const restaurantId = req.user.restaurantId;
    try {
        const now = new Date();
        // Fetch all orders for category sales and gross revenue
        const allOrders = await prisma.order.findMany({
            where: { restaurantId, status: 'PAID' },
            include: { items: { include: { menuItem: { include: { category: true } } } } }
        });
        const allExpenses = await prisma.expense.findMany({
            where: { restaurantId, status: 'APPROVED' }
        });
        const allPurchases = await prisma.purchaseOrder.findMany({
            where: { restaurantId, status: { in: ['PENDING', 'APPROVED', 'RECEIVED'] } }
        });
        // 1. Gross Revenue
        const grossRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
        // 2. Net Profit
        const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPurchases = allPurchases.reduce((sum, p) => sum + p.total, 0);
        const netProfit = grossRevenue - totalExpenses - totalPurchases;
        const netProfitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
        // 3. Food Cost & Labor Cost (estimation based on categories if not explicitly tracked)
        // We'll consider Purchases as Food Cost roughly, and some expenses as Labor Cost.
        const laborExpenses = allExpenses.filter(e => e.category.toLowerCase().includes('labor') || e.category.toLowerCase().includes('salary') || e.category.toLowerCase().includes('payroll')).reduce((sum, e) => sum + e.amount, 0);
        const laborCostMargin = grossRevenue > 0 ? (laborExpenses / grossRevenue) * 100 : 0;
        const foodCostMargin = grossRevenue > 0 ? (totalPurchases / grossRevenue) * 100 : 0;
        // 4. Monthly Aggregation (Last 6 Months)
        const revenueProfitDataMap = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStr = d.toLocaleString('default', { month: 'short' });
            revenueProfitDataMap[mStr] = { month: mStr, revenue: 0, profit: 0 };
        }
        allOrders.forEach(o => {
            const mStr = o.createdAt.toLocaleString('default', { month: 'short' });
            if (revenueProfitDataMap[mStr]) {
                revenueProfitDataMap[mStr].revenue += o.total;
                revenueProfitDataMap[mStr].profit += o.total; // Start with revenue
            }
        });
        allExpenses.forEach(e => {
            const mStr = e.date.toLocaleString('default', { month: 'short' });
            if (revenueProfitDataMap[mStr])
                revenueProfitDataMap[mStr].profit -= e.amount;
        });
        allPurchases.forEach(p => {
            const mStr = p.date.toLocaleString('default', { month: 'short' });
            if (revenueProfitDataMap[mStr])
                revenueProfitDataMap[mStr].profit -= p.total;
        });
        const revenueProfitData = Object.values(revenueProfitDataMap);
        // 5. Category Sales
        const categorySalesMap = {};
        allOrders.forEach(o => {
            o.items.forEach(item => {
                const catName = item.menuItem?.category?.name || 'Uncategorized';
                categorySalesMap[catName] = (categorySalesMap[catName] || 0) + (item.price * item.quantity);
            });
        });
        const categorySalesData = Object.entries(categorySalesMap)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 4); // Top 4 categories
        res.json({
            metrics: {
                grossRevenue,
                netProfitMargin,
                foodCost: foodCostMargin,
                laborCost: laborCostMargin
            },
            revenueProfitData,
            categorySalesData
        });
    }
    catch (err) {
        console.error('Error fetching analytics:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map