import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi there! I am Aarunya AI. I have access to your live dashboard metrics. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: userMessage })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
          cursor: 'pointer',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          height: '600px',
          maxHeight: '80vh',
          backgroundColor: '#1e1e2d',
          borderRadius: '16px',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
          border: '1px solid #2a2b3d',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif"
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Aarunya AI</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#e0e7ff' }}>Your Restaurant Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#13141f'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: msg.role === 'user' ? '#3a2810' : '#4f46e5',
                  color: msg.role === 'user' ? '#f59e0b' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div style={{
                  backgroundColor: msg.role === 'user' ? '#3a2810' : '#2a2b3d',
                  color: msg.role === 'user' ? '#f59e0b' : '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                  maxWidth: '75%',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                  border: msg.role === 'user' ? '1px solid #b48600' : '1px solid #3f3f46'
                }}>
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.replace(/\*\*/g, '')}
                      {i !== msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '14px', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} />
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px',
            backgroundColor: '#1e1e2d',
            borderTop: '1px solid #2a2b3d',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: '1px solid #3f3f46',
                backgroundColor: '#13141f',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '22px',
                backgroundColor: (isLoading || !input.trim()) ? '#3f3f46' : '#4f46e5',
                color: 'white',
                border: 'none',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
