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
router.use(authenticate);
// Get active orders (For Chef KDS)
router.get('/active', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const orders = await prisma.order.findMany({
            where: {
                restaurantId,
                status: { in: ['NEW', 'PREPARING', 'READY', 'SERVED', 'BILLED'] }
            },
            include: {
                table: true,
                items: { include: { menuItem: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// Get cashier stats
router.get('/cashier-stats', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const orders = await prisma.order.findMany({
            where: {
                restaurantId,
                createdAt: { gte: startOfDay }
            }
        });
        const stats = {
            todayBills: orders.filter(o => o.status === 'PAID').length,
            todayRevenue: orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + (o.finalTotal || o.total), 0),
            pendingPayments: orders.filter(o => o.status === 'BILLED').length,
            completedPayments: orders.filter(o => o.status === 'PAID').length
        };
        res.json(stats);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch cashier stats' });
    }
});
// Get transactions (PAID orders)
router.get('/transactions', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const transactions = await prisma.order.findMany({
            where: {
                restaurantId,
                status: 'PAID',
                createdAt: { gte: startOfDay }
            },
            include: {
                table: true,
                items: { include: { menuItem: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});
// Get active orders (For Chef KDS and Waiter and Cashier)
router.post('/', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const { tableId, items } = req.body;
        // items should be [{ menuItemId, quantity, price }]
        if (!tableId || !items || items.length === 0) {
            return res.status(400).json({ error: 'Missing tableId or items' });
        }
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const order = await prisma.$transaction(async (tx) => {
            // Mark table as occupied
            await tx.table.update({
                where: { id: tableId },
                data: { status: 'OCCUPIED' }
            });
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    restaurantId,
                    tableId,
                    total,
                    status: 'NEW',
                    items: {
                        create: items.map((i) => ({
                            menuItemId: i.menuItemId,
                            quantity: i.quantity,
                            price: i.price
                        }))
                    }
                },
                include: { items: true, table: true }
            });
            return newOrder;
        });
        res.json(order);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});
// Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentMethod, tax, discount, finalTotal } = req.body;
        const validStatuses = ['NEW', 'PREPARING', 'READY', 'SERVED', 'BILLED', 'PAID'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const order = await prisma.$transaction(async (tx) => {
            const dataToUpdate = { status };
            if (paymentMethod !== undefined)
                dataToUpdate.paymentMethod = paymentMethod;
            if (tax !== undefined)
                dataToUpdate.tax = tax;
            if (discount !== undefined)
                dataToUpdate.discount = discount;
            if (finalTotal !== undefined)
                dataToUpdate.finalTotal = finalTotal;
            const updatedOrder = await tx.order.update({
                where: { id },
                data: dataToUpdate,
                include: { table: true }
            });
            // If marked as PAID, free the table
            if (status === 'PAID' && updatedOrder.tableId) {
                await tx.table.update({
                    where: { id: updatedOrder.tableId },
                    data: { status: 'AVAILABLE' }
                });
            }
            return updatedOrder;
        });
        res.json(order);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map