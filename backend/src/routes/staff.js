"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const email_1 = require("../utils/email");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';
// Middleware for auth
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
// GET public list of active staff for the POS lock screen
router.get('/public-list', async (req, res) => {
    try {
        // In a multi-tenant app, we'd filter by restaurantId. Since this is a single restaurant demo, we fetch all active staff.
        const staff = await prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                role: { not: 'OWNER' } // Exclude owner from the PIN lock screen
            },
            select: {
                id: true,
                name: true,
                role: true
            },
            orderBy: { name: 'asc' }
        });
        res.json(staff);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch public staff list' });
    }
});
// GET all staff for the restaurant
router.get('/', authenticate, async (req, res) => {
    const restaurantId = req.user.restaurantId;
    try {
        const staff = await prisma.user.findMany({
            where: { restaurantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                shift: true,
                status: true,
                attendance: true,
                phone: true,
                emergencyContact: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(staff);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});
// POST invite new staff
router.post('/invite', authenticate, async (req, res) => {
    const { name, email, role, shift } = req.body;
    const restaurantId = req.user.restaurantId;
    if (!name || !email || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        // Create token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // 24 hours from now
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role,
                shift,
                status: 'PENDING',
                restaurantId,
                activationToken: hashedToken,
                activationExpires: expires
            }
        });
        // Send email
        // Link format: http://localhost:5173/setup-account?token=...&role=...
        const inviteUrl = `http://localhost:5173/setup-account?token=${token}&role=${role}`;
        const emailSent = await (0, email_1.sendInviteEmail)(email, restaurant?.name || 'Restaurant', inviteUrl);
        res.json({
            message: 'Staff invited successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                shift: newUser.shift,
                status: newUser.status
            },
            inviteUrl: inviteUrl,
            emailSent
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to invite staff' });
    }
});
// PUT update staff details
router.put('/:id', authenticate, async (req, res) => {
    const restaurantId = req.user.restaurantId;
    const { id } = req.params;
    const { name, role, shift, status, attendance, phone, emergencyContact } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.restaurantId !== restaurantId) {
            return res.status(404).json({ error: 'Not found' });
        }
        const updated = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(role && { role }),
                ...(shift !== undefined && { shift }),
                ...(status && { status }),
                ...(attendance && { attendance }),
                ...(phone !== undefined && { phone }),
                ...(emergencyContact !== undefined && { emergencyContact })
            }
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update staff' });
    }
});
// DELETE staff
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const restaurantId = req.user.restaurantId;
    const currentUserId = req.user.id;
    if (id === currentUserId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    try {
        const deleted = await prisma.user.deleteMany({
            where: { id, restaurantId }
        });
        if (deleted.count === 0) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        res.json({ message: 'Staff deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete staff' });
    }
});
exports.default = router;
//# sourceMappingURL=staff.js.map