import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key_for_now');

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

router.post('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const restaurantId = (req as any).user.restaurantId;
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Gather Live Metrics for Context
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthOrders = await prisma.order.findMany({
      where: { restaurantId, status: 'PAID', createdAt: { gte: startOfThisMonth } }
    });
    const thisMonthSales = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);

    const thisMonthPurchases = await prisma.purchaseOrder.findMany({
      where: { restaurantId, date: { gte: startOfThisMonth } }
    });
    const thisMonthPurchaseTotal = thisMonthPurchases.reduce((sum, p) => sum + p.total, 0);

    const thisMonthExpenses = await prisma.expense.findMany({
      where: { restaurantId, date: { gte: startOfThisMonth } }
    });
    const thisMonthExpenseTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const thisMonthProfit = thisMonthSales - thisMonthPurchaseTotal - thisMonthExpenseTotal;

    const systemInstruction = `You are "Aarunya AI", a helpful, professional, and friendly virtual assistant built into the RestaurantOS management dashboard.
You are helping the restaurant owner/manager analyze their business.
Keep your answers relatively concise (2-3 short paragraphs max) unless asked for a detailed breakdown. Use Markdown formatting.
If the user asks about their business performance, use the following real-time data for the current month:
- Total Sales: ₹${thisMonthSales.toLocaleString()}
- Total Purchases (Inventory): ₹${thisMonthPurchaseTotal.toLocaleString()}
- Total Expenses: ₹${thisMonthExpenseTotal.toLocaleString()}
- Net Profit: ₹${thisMonthProfit.toLocaleString()}

Do not mention that you were just given this data in the prompt. Act naturally as if you have access to their dashboard.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\nUser: " + prompt }] }]
    });

    const responseText = result.response.text();
    
    res.json({ response: responseText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
