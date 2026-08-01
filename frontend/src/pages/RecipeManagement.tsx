import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, BookOpen, Clock, Users, Flame, ChefHat, Sparkles } from 'lucide-react';

interface Recipe {
  name: string;
  category: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  image: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const FALLBACK_RECIPES: Recipe[] = [
  {
    name: 'Veg Biryani',
    category: 'Vegetarian',
    prepTime: '20 mins',
    cookTime: '40 mins',
    servings: 4,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
    ingredients: [
      { name: 'Basmati Rice', quantity: '2 cups' },
      { name: 'Mixed Vegetables (Carrot, Peas, Beans)', quantity: '2 cups' },
      { name: 'Onions', quantity: '2 large, sliced' },
      { name: 'Tomatoes', quantity: '2 medium' },
      { name: 'Ginger Garlic Paste', quantity: '2 tbsp' },
      { name: 'Biryani Masala', quantity: '2 tbsp' },
      { name: 'Yogurt', quantity: '1/2 cup' },
      { name: 'Ghee', quantity: '3 tbsp' },
      { name: 'Mint and Coriander leaves', quantity: '1/2 cup' },
      { name: 'Whole Spices (Cardamom, Cloves, Bay leaf)', quantity: 'Assorted' }
    ],
    instructions: [
      'Wash and soak basmati rice for 30 minutes. Parboil the rice with whole spices and salt until 70% cooked. Drain and set aside.',
      'Heat ghee in a heavy-bottomed pan. Sauté sliced onions until golden brown. Remove half for garnish.',
      'In the same pan, add ginger garlic paste and tomatoes. Cook until tomatoes soften.',
      'Add the mixed vegetables, biryani masala, salt, and yogurt. Cook for 10 minutes until vegetables are tender.',
      'Layer the parboiled rice over the vegetable gravy. Sprinkle fried onions, mint, and coriander leaves on top.',
      'Cover tightly with a lid and cook on very low heat (dum) for 15-20 minutes.',
      'Gently fluff the biryani before serving hot with raita.'
    ]
  },
  {
    name: 'Paneer Tikka',
    category: 'Vegetarian',
    prepTime: '15 mins',
    cookTime: '20 mins',
    servings: 3,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80',
    ingredients: [
      { name: 'Paneer (Cottage Cheese)', quantity: '300g, cubed' },
      { name: 'Bell Peppers and Onions', quantity: '1 cup, cubed' },
      { name: 'Hung Curd', quantity: '1/2 cup' },
      { name: 'Ginger Garlic Paste', quantity: '1 tbsp' },
      { name: 'Tikka Masala', quantity: '1.5 tbsp' },
      { name: 'Mustard Oil', quantity: '1 tbsp' },
      { name: 'Lemon Juice', quantity: '1 tbsp' }
    ],
    instructions: [
      'In a large bowl, whisk hung curd, ginger garlic paste, tikka masala, mustard oil, lemon juice, and salt to make the marinade.',
      'Add paneer cubes, bell peppers, and onions. Toss gently to coat. Marinate for at least 30 minutes.',
      'Thread the marinated paneer and veggies onto skewers.',
      'Preheat the oven or a grill pan. Grill the skewers for 10-15 minutes, turning occasionally until charred on the edges.',
      'Serve hot with mint chutney and lemon wedges.'
    ]
  },
  {
    name: 'Truffle Mushroom Pasta',
    category: 'Mains',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 2,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80',
    ingredients: [
      { name: 'Fettuccine', quantity: '250g' },
      { name: 'Mixed Mushrooms', quantity: '200g' },
      { name: 'Heavy Cream', quantity: '150ml' },
      { name: 'Truffle Oil', quantity: '1 tbsp' },
      { name: 'Parmesan', quantity: '50g' },
      { name: 'Garlic', quantity: '2 cloves' }
    ],
    instructions: [
      'Boil pasta in salted water until al dente.',
      'Sauté garlic and mushrooms in butter until golden.',
      'Add heavy cream and parmesan, simmer until slightly thickened.',
      'Toss pasta in sauce, drizzle with truffle oil, and serve.'
    ]
  }
];

export default function RecipeManagement() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'Hello Chef! I am Aarunya AI. What recipe are you looking for today? (e.g., "Biryani", "Pasta", "Butter Chicken")' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const searchRecipeAPI = async (query: string) => {
    try {
      // Clean up the query a bit to help the API
      const cleanQuery = query.replace(/how to make/i, '').replace(/recipe for/i, '').replace(/give me/i, '').trim().toLowerCase();
      
      // 1. Check local fallback first (for custom/Indian dishes like Veg Biryani)
      const localMatch = FALLBACK_RECIPES.find(r => r.name.toLowerCase().includes(cleanQuery) || cleanQuery.includes(r.name.toLowerCase()));
      if (localMatch) {
        setActiveRecipe(localMatch);
        return `I found a great recipe for **${localMatch.name}**! I have loaded the exact ingredients and step-by-step instructions for you on the right. Happy cooking!`;
      }

      // 2. Try the public API
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();
      
      if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];
        
        // Extract ingredients dynamically (API provides up to 20)
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ing = meal[`strIngredient${i}`];
          const meas = meal[`strMeasure${i}`];
          if (ing && ing.trim() !== '') {
            ingredients.push({ name: ing.trim(), quantity: meas ? meas.trim() : 'To taste' });
          }
        }

        // Split instructions by newlines and filter out empty ones
        const instructions = meal.strInstructions
          .split(/\r?\n/)
          .filter((step: string) => step.trim() !== '');

        const recipe: Recipe = {
          name: meal.strMeal,
          category: meal.strCategory,
          prepTime: '15 mins', // API doesn't provide this, so we mock it realistically
          cookTime: '30 mins',
          servings: 4,
          difficulty: 'Medium',
          image: meal.strMealThumb,
          ingredients,
          instructions
        };

        setActiveRecipe(recipe);
        return `I found a great recipe for **${meal.strMeal}**! I have loaded the exact ingredients and step-by-step instructions for you on the right. Happy cooking!`;
      } else {
        return `I'm sorry Chef, I couldn't find a recipe for "${cleanQuery}". Could you try asking for something else? (e.g., "Chicken", "Beef", "Pasta", "Curry")`;
      }
    } catch (error) {
      return "Oops, my recipe database connection is down right now. Please try again in a moment!";
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate network delay for AI realism
    setTimeout(async () => {
      const aiResponseContent = await searchRecipeAPI(currentQuery);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: aiResponseContent };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div style={{ padding: '32px', background: '#0f1219', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#f8fafc' }}>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ background: '#43210b', color: '#f97316', padding: '12px', borderRadius: '12px' }}>
          <Sparkles size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Chef AI Assistant</h1>
          <p style={{ margin: 0, color: '#9ca3af' }}>Ask for any recipe in the world, and I will generate it for you.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', height: 'calc(100vh - 150px)' }}>
        
        {/* LEFT PANE: AI Chatbot */}
        <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ padding: '20px', borderBottom: '1px solid #1f2330', background: '#1a1d27' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} color="#f97316" /> Aarunya Recipe AI
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? '#1f2330' : '#43210b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {msg.role === 'user' ? <User size={18} color="#9ca3af" /> : <Bot size={18} color="#f97316" />}
                </div>
                <div style={{ 
                  background: msg.role === 'user' ? '#1f2330' : 'transparent',
                  border: msg.role === 'user' ? 'none' : '1px solid #1f2330',
                  padding: '16px', 
                  borderRadius: '12px',
                  borderTopLeftRadius: msg.role === 'ai' ? '0' : '12px',
                  borderTopRightRadius: msg.role === 'user' ? '0' : '12px',
                  maxWidth: '80%',
                  lineHeight: 1.5,
                  fontSize: '0.95rem',
                  color: msg.role === 'user' ? '#f8fafc' : '#d1d5db'
                }}>
                  {/* Basic markdown bold parser */}
                  {msg.content.split('**').map((text, i) => (i % 2 === 1 ? <strong key={i} style={{ color: '#f8fafc' }}>{text}</strong> : text))}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#43210b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} color="#f97316" />
                </div>
                <div style={{ display: 'flex', gap: '6px', padding: '12px' }}>
                  <div className="typing-dot" style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                  <div className="typing-dot" style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
                  <div className="typing-dot" style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #1f2330', background: '#1a1d27' }}>
            <form onSubmit={handleSendMessage} style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Ask for a recipe... (e.g. 'Biryani')" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '16px 56px 16px 20px', 
                  borderRadius: '12px', 
                  border: '1px solid #1f2330', 
                  background: '#0f1219',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="submit" 
                disabled={isTyping || !inputValue.trim()}
                style={{ 
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: inputValue.trim() ? '#f97316' : '#1f2330',
                  border: 'none', borderRadius: '8px', padding: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: inputValue.trim() ? 'pointer' : 'default', transition: 'all 0.2s'
                }}
              >
                <Send size={18} color="white" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANE: Recipe Details */}
        {activeRecipe ? (
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Cover Image & Header */}
            <div style={{ position: 'relative', height: '240px', width: '100%' }}>
              <img src={activeRecipe.image} alt={activeRecipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #161922, transparent)' }}></div>
              <div style={{ position: 'absolute', bottom: '24px', left: '32px' }}>
                <span style={{ background: '#f97316', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '12px', display: 'inline-block' }}>
                  {activeRecipe.category}
                </span>
                <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {activeRecipe.name}
                </h2>
              </div>
            </div>

            {/* Recipe Meta Info */}
            <div style={{ display: 'flex', gap: '32px', padding: '24px 32px', borderBottom: '1px solid #1f2330', background: '#1a1d27' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#0f1219', padding: '10px', borderRadius: '50%' }}><Clock size={20} color="#f97316" /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Prep Time</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{activeRecipe.prepTime}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#0f1219', padding: '10px', borderRadius: '50%' }}><Flame size={20} color="#ef4444" /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Cook Time</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{activeRecipe.cookTime}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#0f1219', padding: '10px', borderRadius: '50%' }}><Users size={20} color="#3b82f6" /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Servings</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{activeRecipe.servings} people</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#0f1219', padding: '10px', borderRadius: '50%' }}><ChefHat size={20} color="#a855f7" /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Difficulty</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{activeRecipe.difficulty}</div>
                </div>
              </div>
            </div>

            {/* Ingredients & Instructions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', flex: 1, overflowY: 'hidden' }}>
              
              {/* Ingredients List */}
              <div style={{ padding: '32px', borderRight: '1px solid #1f2330', overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: '#f8fafc' }}>Ingredients</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeRecipe.ingredients.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #2a2f3e' }}>
                      <span style={{ color: '#d1d5db' }}>{ing.name}</span>
                      <span style={{ fontWeight: 600, color: '#f97316' }}>{ing.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div style={{ padding: '32px', overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: '#f8fafc' }}>Instructions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {activeRecipe.instructions.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#43210b', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ color: '#d1d5db', lineHeight: 1.6, paddingTop: '2px' }}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', textAlign: 'center' }}>
            <div style={{ background: '#43210b', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
              <Bot size={48} color="#f97316" />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '12px' }}>Aarunya AI is Ready</h2>
            <p style={{ color: '#9ca3af', maxWidth: '400px', lineHeight: 1.6 }}>
              I am connected to a global database of culinary knowledge. Ask me for any recipe, and I will generate the exact ingredients and step-by-step instructions for you!
            </p>
          </div>
        )}

      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
