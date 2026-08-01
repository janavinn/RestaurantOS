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
// GET all suppliers
router.get('/', authenticate, async (req, res) => {
    const restaurantId = req.user.restaurantId;
    try {
        const suppliers = await prisma.supplier.findMany({
            where: { restaurantId },
            orderBy: { name: 'asc' }
        });
        res.json(suppliers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});
// POST new supplier
router.post('/', authenticate, async (req, res) => {
    const restaurantId = req.user.restaurantId;
    const { name, type, contact, phone, email, status, purchases, payables } = req.body;
    try {
        const supplier = await prisma.supplier.create({
            data: {
                name,
                type: type || 'General',
                contact,
                phone,
                email,
                status: status || 'Active',
                purchases: Number(purchases) || 0,
                payables: Number(payables) || 0,
                restaurantId
            }
        });
        res.json(supplier);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create supplier' });
    }
});
// PUT update status
router.put('/:id/status', authenticate, async (req, res) => {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { status } = req.body;
    try {
        const supplier = await prisma.supplier.findUnique({ where: { id } });
        if (!supplier || supplier.restaurantId !== restaurantId) {
            return res.status(404).json({ error: 'Not found' });
        }
        const updated = await prisma.supplier.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update supplier status' });
    }
});
exports.default = router;
//# sourceMappingURL=suppliers.js.map