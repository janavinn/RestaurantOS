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
// GET all inventory items (ingredients) for the restaurant
router.get('/', authenticate, async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const inventory = await prisma.ingredient.findMany({
            where: { restaurantId },
            orderBy: { name: 'asc' }
        });
        res.json(inventory);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});
// PUT /api/inventory/:id - Update stock level manually
router.put('/:id', authenticate, async (req, res) => {
    const restaurantId = req.user.restaurantId;
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update ingredient stock' });
    }
});
exports.default = router;
//# sourceMappingURL=inventory.js.map