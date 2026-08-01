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
// ========================
// MENU CATEGORIES
// ========================
router.get('/categories', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const categories = await prisma.menuCategory.findMany({
            where: { restaurantId },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
router.post('/categories', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Name is required' });
        const category = await prisma.menuCategory.create({
            data: { name, restaurantId }
        });
        res.json(category);
    }
    catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Failed to create category' });
    }
});
router.put('/categories/:id', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const { id } = req.params;
        const { name } = req.body;
        const category = await prisma.menuCategory.findUnique({ where: { id } });
        if (!category || category.restaurantId !== restaurantId) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const updated = await prisma.menuCategory.update({
            where: { id },
            data: { name }
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});
router.delete('/categories/:id', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const { id } = req.params;
        const deleted = await prisma.menuCategory.deleteMany({
            where: { id, restaurantId }
        });
        if (deleted.count === 0)
            return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete category (Ensure no menu items are using it)' });
    }
});
// ========================
// MENU ITEMS
// ========================
router.get('/', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const menuItems = await prisma.menuItem.findMany({
            where: { restaurantId },
            include: { category: true }, // Include category details
        });
        res.json(menuItems);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});
router.post('/', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const { name, price, description, categoryId, img, available } = req.body;
        if (!name || !price || !categoryId) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }
        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                categoryId,
                img,
                available: available ?? true,
                restaurantId
            },
            include: { category: true }
        });
        res.json(menuItem);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const { id } = req.params;
        const { name, price, description, categoryId, img, available } = req.body;
        const existing = await prisma.menuItem.findUnique({ where: { id } });
        if (!existing || existing.restaurantId !== restaurantId) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        const updated = await prisma.menuItem.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(description !== undefined && { description }),
                ...(categoryId && { categoryId }),
                ...(img !== undefined && { img }),
                ...(available !== undefined && { available })
            },
            include: { category: true }
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId;
        const { id } = req.params;
        const deleted = await prisma.menuItem.deleteMany({
            where: { id, restaurantId }
        });
        if (deleted.count === 0)
            return res.status(404).json({ error: 'Menu item not found' });
        res.json({ message: 'Menu item deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});
exports.default = router;
//# sourceMappingURL=menu.js.map