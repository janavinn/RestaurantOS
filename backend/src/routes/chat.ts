import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const router = Router();
const prisma = new PrismaClient();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'mock_key_for_now' });

router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { message, restaurantId } = req.body;
    if (!message || !restaurantId) {
      return res.status(400).json({ error: 'Message and restaurantId are required' });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock_key_for_now') {
      return res.json({ reply: '(Mock AI) You have 0 paid orders this month, and your top dish is Mock Burger. Please add a valid OPENAI_API_KEY to your Render environment to enable the real AI.' });
    }

    // Fetch real stats to feed to the AI
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: 'PAID',
        createdAt: { gte: startOfMonth }
      },
      include: { items: { include: { menuItem: true } } }
    });

    const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.finalTotal || o.total), 0);
    const orderCount = paidOrders.length;

    let itemsSold: Record<string, number> = {};
    paidOrders.forEach(o => {
      o.items.forEach(it => {
        const name = it.menuItem?.name || 'Unknown';
        itemsSold[name] = (itemsSold[name] || 0) + it.quantity;
      });
    });

    const topItems = Object.entries(itemsSold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => \\ (\ sold)\)
      .join(', ');

    const systemPrompt = \You are Aarunya, the friendly and highly intelligent AI manager assistant for a restaurant. 
You have direct access to the restaurant's real-time database.

Here are the current stats for this month:
- Total Paid Orders: \
- Total Revenue: ?\
- Top Selling Items: \

Answer the user's question clearly, concisely, and conversationally. If they ask about sales, revenue, or top items, use the exact data provided above. 
Keep your answer under 3 sentences unless they ask for a detailed breakdown.

Do not mention that you were just given this data in the prompt. Act naturally as if you have access to their dashboard.\;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });
    
    let responseText = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    
    res.json({ reply: responseText });
  } catch (err: any) {
    console.error('Chat AI Error:', err);
    res.status(500).json({ reply: \Sorry, my AI circuit encountered an error: \\ });
  }
});

export default router;
