import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Clock, Utensils, ClipboardList, CheckCircle, Flame, AlertCircle, AlertTriangle, ArrowRight, BookOpen, PenTool, Calendar, BarChart2, Users, X, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChefDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('NEW');
  const [confirmReadyOrderId, setConfirmReadyOrderId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [orders, setOrders] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const previousOrdersCount = useRef(0);

  const fetchOrders = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/active', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
      
      const resStats = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/transactions', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setCompletedCount(dataStats.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Voice Announcement Effect
  useEffect(() => {
    if (orders.length > 0 && orders.length > previousOrdersCount.current) {
      // New orders arrived
      const newOrders = orders.filter(o => o.status === 'NEW');
      if (newOrders.length > 0 && voiceEnabled && 'speechSynthesis' in window) {
        const latestOrder = newOrders[newOrders.length - 1];
        const text = `New order received for Table ${latestOrder.table?.tableNumber || 'Takeaway'}. Please check the dashboard.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    }
    previousOrdersCount.current = orders.length;
  }, [orders, voiceEnabled]);

  useEffect(() => {
    fetchOrders();
    const poll = setInterval(fetchOrders, 5000);
    const clock = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status })
      });
      if (status === 'READY') {
        setConfirmReadyOrderId(null);
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const calculateWaitTime = (createdAt: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);
    return diff <= 0 ? 'Just now' : `${diff} min ago`;
  };

  const getPriority = (createdAt: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 60000);
    if (diff > 15) return { label: 'High Priority', color: '#ef4444' };
    if (diff > 5) return { label: 'Medium', color: '#f59e0b' };
    return { label: 'Low', color: '#22c55e' };
  };

  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  const prepOrdersCount = orders.filter(o => o.status === 'PREPARING').length;
  const readyOrdersCount = orders.filter(o => o.status === 'READY').length;

  const filteredOrders = orders.filter(o => o.status === activeTab);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#f8fafc', paddingRight: '16px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 600, color: '#f8fafc' }}>Chef Dashboard</h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Welcome back, Chef! Here's what's cooking in the kitchen.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.85rem' }}>
            <Calendar size={16} />
            <span>{formatDate(currentTime)}, {formatTime(currentTime)}</span>
          </div>
          
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: voiceEnabled ? '#22c55e20' : '#1f2330', 
              color: voiceEnabled ? '#22c55e' : '#9ca3af', 
              border: `1px solid ${voiceEnabled ? '#22c55e40' : '#1f2330'}`, 
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {voiceEnabled ? 'Voice Alerts On' : 'Voice Alerts Off'}
          </button>

          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="#9ca3af" />
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#f97316', color: 'white', fontSize: '0.6rem', fontWeight: 'bold', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
          </div>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#161922', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #1f2330' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={28} color="#f97316" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{newOrdersCount}</div>
            <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500, marginBottom: '4px' }}>New Orders</div>
            <div style={{ fontSize: '0.75rem', color: '#f97316' }}>Need to be prepared</div>
          </div>
        </div>

        <div style={{ background: '#161922', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #1f2330' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={28} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{prepOrdersCount}</div>
            <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500, marginBottom: '4px' }}>In Progress</div>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Being prepared</div>
          </div>
        </div>

        <div style={{ background: '#161922', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #1f2330' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Utensils size={28} color="#22c55e" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{readyOrdersCount}</div>
            <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500, marginBottom: '4px' }}>Ready to Serve</div>
            <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>Waiting for pickup</div>
          </div>
        </div>

        <div style={{ background: '#161922', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #1f2330' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={28} color="#a855f7" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{completedCount}</div>
            <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500, marginBottom: '4px' }}>Completed Today</div>
            <div style={{ fontSize: '0.75rem', color: '#a855f7' }}>Till now</div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Kitchen Orders */}
          <div style={{ background: '#161922', borderRadius: '12px', border: '1px solid #1f2330', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2330', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Kitchen Orders</h2>
              <button onClick={fetchOrders} style={{ background: 'transparent', border: '1px solid #f97316', color: '#f97316', borderRadius: '20px', padding: '6px 16px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Refresh Now <ArrowRight size={14} />
              </button>
            </div>
            
            <div style={{ padding: '0 24px', borderBottom: '1px solid #1f2330', display: 'flex', gap: '32px' }}>
              {[
                { id: 'NEW', label: `New (${newOrdersCount})` },
                { id: 'PREPARING', label: `In Progress (${prepOrdersCount})` },
                { id: 'READY', label: `Ready (${readyOrdersCount})` }
              ].map(tab => (
                <div 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                    padding: '16px 0', 
                    cursor: 'pointer', 
                    fontWeight: activeTab === tab.id ? 600 : 500, 
                    color: activeTab === tab.id ? '#f97316' : '#9ca3af',
                    borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
                    fontSize: '0.9rem'
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 24px', minHeight: '300px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No orders in this category.</div>
              ) : (
                filteredOrders.map((order, i) => {
                  const priority = getPriority(order.createdAt);
                  const itemsSummary = order.items.map((it: any) => `${it.quantity} x ${it.menuItem?.name || 'Item'}`).join(', ');
                  
                  return (
                    <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '16px 0', borderBottom: i === filteredOrders.length - 1 ? 'none' : '1px solid #1f2330', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>#{order.id.substring(0, 8)}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Table {order.table?.tableNumber || 'Takeaway'}</div>
                      </div>
                      <div>
                        <div style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '4px' }}>{itemsSummary}</div>
                      </div>
                      <div>
                        <div style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '4px' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{calculateWaitTime(order.createdAt)}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ background: `${priority.color}15`, color: priority.color, padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${priority.color}30` }}>
                          {priority.label}
                        </span>
                        
                        {/* ACTION BUTTONS */}
                        {order.status === 'NEW' && (
                          <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} style={{ background: '#f97316', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button onClick={() => setConfirmReadyOrderId(order.id)} style={{ background: '#22c55e', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            Mark as Ready
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Kitchen Heatmap */}
          <div style={{ background: '#161922', borderRadius: '12px', border: '1px solid #1f2330', padding: '24px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#ef4444" /> Station Heatmap
            </h2>
            
            {(() => {
              // Calculate rough station load based on active order items
              let grillLoad = 0, saladLoad = 0, fryerLoad = 0;
              const activeOrders = orders.filter(o => o.status === 'NEW' || o.status === 'PREPARING');
              
              activeOrders.forEach(o => {
                o.items.forEach((it: any) => {
                  const name = (it.menuItem?.name || '').toLowerCase();
                  if (name.includes('burger') || name.includes('steak') || name.includes('chicken')) grillLoad += it.quantity;
                  else if (name.includes('salad') || name.includes('wrap') || name.includes('cold')) saladLoad += it.quantity;
                  else fryerLoad += it.quantity; // Default to fryer/other
                });
              });

              const maxLoad = Math.max(grillLoad, saladLoad, fryerLoad, 1);
              const getLoadColor = (val: number) => val > 10 ? '#ef4444' : val > 5 ? '#f59e0b' : '#22c55e';
              const getPercent = (val: number) => Math.min(100, Math.round((val / (maxLoad * 1.5)) * 100)) + '%';

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Grill Station */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                      <span style={{ color: '#d1d5db' }}>Grill & Oven</span>
                      <span style={{ color: getLoadColor(grillLoad) }}>{grillLoad} items</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#0f1219', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: getPercent(grillLoad), height: '100%', background: getLoadColor(grillLoad), transition: 'all 0.5s' }} />
                    </div>
                  </div>

                  {/* Fryer Station */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                      <span style={{ color: '#d1d5db' }}>Fryer & Wok</span>
                      <span style={{ color: getLoadColor(fryerLoad) }}>{fryerLoad} items</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#0f1219', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: getPercent(fryerLoad), height: '100%', background: getLoadColor(fryerLoad), transition: 'all 0.5s' }} />
                    </div>
                  </div>

                  {/* Salad Station */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                      <span style={{ color: '#d1d5db' }}>Cold Station & Salad</span>
                      <span style={{ color: getLoadColor(saladLoad) }}>{saladLoad} items</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#0f1219', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: getPercent(saladLoad), height: '100%', background: getLoadColor(saladLoad), transition: 'all 0.5s' }} />
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>

          {/* Today's Summary */}
          <div style={{ background: '#161922', borderRadius: '12px', border: '1px solid #1f2330', padding: '24px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 600 }}>Today's Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Total Active</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Completed Orders</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#161922', borderRadius: '12px', border: '1px solid #1f2330', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>Quick Actions</h2>
            <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => navigate('/ingredients')} style={{ background: '#1f2330', border: 'none', padding: '12px', borderRadius: '8px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <Utensils size={16} color="#22c55e" /> Ingredients
              </button>
              <button onClick={() => navigate('/recipes')} style={{ background: '#1f2330', border: 'none', padding: '12px', borderRadius: '8px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                <BookOpen size={16} color="#a855f7" /> Recipes
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {confirmReadyOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#161922', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90%', border: '1px solid #1f2330', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#22c55e20', padding: '12px', borderRadius: '50%' }}>
                  <Bell size={24} color="#22c55e" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>Notify Waiter?</h2>
              </div>
              <button onClick={() => setConfirmReadyOrderId(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '32px' }}>
              Are you sure you want to mark Order <strong>#{confirmReadyOrderId.substring(0, 8)}</strong> as ready? This will immediately send a notification to the waiter to pick it up.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmReadyOrderId(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1f2330', background: 'transparent', color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => updateOrderStatus(confirmReadyOrderId, 'READY')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
