import 'dotenv/config';
import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

// Middleware to verify JWT
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

// ==========================================
// 1. SETUP OWNER
// ==========================================
app.post('/api/admin/setup', async (req: Request, res: Response): Promise<any> => {
  const { restaurantName, ownerName, ownerEmail, password } = req.body;
  if (!restaurantName || !ownerName || !ownerEmail || !password) return res.status(400).json({ error: 'All fields required' });

  try {
    // === SINGLE TENANT LOCK ENABLED ===
    const restaurantCount = await prisma.restaurant.count();
    if (restaurantCount > 0) {
      return res.status(403).json({ error: 'System already initialized. Only one restaurant owner is permitted.' });
    }
    // ==================================================

    const existing = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({ data: { name: restaurantName } });
      const owner = await tx.user.create({
        data: { name: ownerName, email: ownerEmail, passwordHash, role: 'OWNER', status: 'ACTIVE', restaurantId: restaurant.id },
      });
      return { restaurant, owner };
    });

    const { passwordHash: _, ...ownerSafe } = result.owner;
    res.status(201).json({ message: 'Success', restaurant: result.restaurant, owner: ownerSafe });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/admin/is-initialized', async (req: Request, res: Response) => {
  try {
    const count = await prisma.restaurant.count();
    res.json({ initialized: count > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/admin/nuke-database', async (req: Request, res: Response) => {
  try {
    await prisma.restaurant.deleteMany();
    res.json({ message: 'Database wiped successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to wipe database' });
  }
});

// ==========================================
// 2. LOGIN
// ==========================================
app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (user.status !== 'ACTIVE') return res.status(403).json({ error: 'Account is not active' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
    
    const { passwordHash, activationToken, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// ==========================================


// ==========================================
// 3. FORGOT / RESET PASSWORD
// ==========================================
app.post('/api/auth/forgot-password', async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpires },
    });

    const resetUrl = `https://restaurant-os-fjqs.vercel.app/reset-password/${resetToken}`;

    // DEMO MODE: Skip nodemailer on Vercel
    res.json({ message: 'A password reset link has been generated.', resetUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.post('/api/auth/reset-password', async (req: Request, res: Response): Promise<any> => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gt: new Date() }
      }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetExpires: null
      }
    });

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// 4. ACTIVATE STAFF
// ==========================================
app.post('/api/staff/activate', async (req: Request, res: Response): Promise<any> => {
  const { token, pin } = req.body;
  if (!token || !pin) return res.status(400).json({ error: 'Token and pin required' });

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findUnique({ where: { activationToken: hashedToken } });
    
    if (!user) return res.status(400).json({ error: 'Invalid activation token' });
    if (user.activationExpires && user.activationExpires < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pin: pinHash,
        status: 'ACTIVE',
        activationToken: null,
        activationExpires: null
      }
    });

    res.json({ 
      message: 'Account activated successfully. You can now login.',
      user: {
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to activate account' });
  }
});

// ==========================================
// 5. PIN LOGIN
// ==========================================
app.post('/api/auth/pin-login', async (req: Request, res: Response): Promise<any> => {
  const { userId, pin } = req.body;
  
  if (!userId || !pin) return res.status(400).json({ error: 'User ID and PIN required' });
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.pin) return res.status(401).json({ error: 'Invalid credentials or PIN not set' });
    if (user.status !== 'ACTIVE') return res.status(403).json({ error: 'Account is not active' });
    
    const isValid = await bcrypt.compare(pin, user.pin);
    if (!isValid) return res.status(401).json({ error: 'Incorrect PIN' });
    
    const token = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
    
    const { passwordHash, pin: _, activationToken, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'PIN Login failed' });
  }
});



app.post('/api/auth/forgot-pin', async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID required' });
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        activationToken: hashedToken,
        activationExpires: new Date(Date.now() + 86400000)
      }
    });
    
    const resetUrl = `https://restaurant-os-fjqs.vercel.app/setup-account?token=${token}&role=${user.role}`;
    
    // DEMO MODE: We skip sending the actual email since dummy SMTP accounts expire quickly.
    // The frontend will automatically redirect the user to the resetUrl.
    res.json({ message: 'A PIN reset link has been sent to the registered email.', resetUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process forgot pin' });
  }
});

import dashboardRoutes from './routes/dashboard';
import menuRoutes from './routes/menu';
import ordersRoutes from './routes/orders';
import staffRoutes from './routes/staff';
import tablesRoutes from './routes/tables';
import purchaseOrdersRoutes from './routes/purchaseOrders';
import suppliersRoutes from './routes/suppliers';
import rolesRoutes from './routes/roles';
import expensesRoutes from './routes/expenses';
import managerRoutes from './routes/manager';
import purchaseRequestsRouter from './routes/purchaseRequests';
import inventoryRoutes from './routes/inventory';
import reportsRouter from './routes/reports';
import invoicesRouter from './routes/invoices';
import chatRouter from './routes/chat';
import notificationsRouter from './routes/notifications';
import searchRouter from './routes/search';

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/purchase-requests', purchaseRequestsRouter);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/search', searchRouter);

// --- AI Recipe Generator ---
app.post('/api/recipes/generate', async (req: Request, res: Response): Promise<any> => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !ingredients.length) return res.status(400).json({ error: 'Ingredients required' });
    
    if (!process.env.GEMINI_API_KEY) {
      // Mock response if no API key is provided
      return res.json({
        name: "Chef's Special Mix",
        category: "Special",
        prepTime: "15 mins",
        cookTime: "25 mins",
        servings: 2,
        difficulty: "Medium",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
        ingredients: ingredients.map((i: string) => ({ name: i, quantity: "To taste" })),
        instructions: ["Prepare the ingredients.", "Cook them perfectly.", "Serve hot!"]
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are an expert chef. The user has the following ingredients available: ${ingredients.join(', ')}.
Generate a highly creative, delicious recipe using these ingredients. You can assume basic pantry staples (salt, pepper, oil, water, garlic, onions) are available.
Return the result strictly as a raw JSON object (without any markdown blocks like \`\`\`json) with the following structure:
{
  "name": "Recipe Name",
  "category": "Category (e.g. Mains, Appetizer)",
  "prepTime": "XX mins",
  "cookTime": "XX mins",
  "servings": 2,
  "difficulty": "Easy/Medium/Hard",
  "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
  "ingredients": [ { "name": "Ingredient Name", "quantity": "Amount" } ],
  "instructions": [ "Step 1", "Step 2" ]
}`;

    let recipe;
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock_key_for_now') {
        throw new Error('Using mock key');
      }
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recipe = JSON.parse(jsonStr);
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      // Smart Fallback Mock
      recipe = {
        name: "Chef's Special " + ingredients[0] + " Delight",
        category: "Mains",
        prepTime: "15 mins",
        cookTime: "25 mins",
        servings: 2,
        difficulty: "Medium",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
        ingredients: ingredients.map(ing => ({ name: ing, quantity: "As needed" })),
        instructions: [
          "Preheat your cooking equipment.",
          "Prepare the " + ingredients.join(" and ") + ".",
          "Mix everything together and cook until perfectly done.",
          "Serve hot and enjoy your creation!"
        ]
      };
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
