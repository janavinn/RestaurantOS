import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, ChefHat, LayoutDashboard, ChevronDown, Trash2, X, Plus, Bell } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function TableManagement() {
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<{menuItem: any, qty: number}[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [notifications, setNotifications] = useState<{id: number, message: string}[]>([]);
  const notifiedOrderIds = React.useRef<Set<string>>(new Set());
  const firstLoad = React.useRef(true);

  const { urlUsername } = useParams();
  const rawUserName = urlUsername ? urlUsername.replace(/-/g, ' ') : 'Waiter';
  const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tRes, mRes, oRes] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || '') + '/api/tables', { headers: { Authorization: `Bearer ${token}` } }),
        fetch((import.meta.env.VITE_API_URL || '') + '/api/menu', { headers: { Authorization: `Bearer ${token}` } }),
        fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/active', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (tRes.ok) setTables(await tRes.json());
      if (mRes.ok) setMenuItems(await mRes.json());
      if (oRes.ok) {
        const data = await oRes.json();
        setOrders(data);
        
        if (firstLoad.current) {
          data.forEach((o: any) => {
            if (o.status === 'READY') notifiedOrderIds.current.add(o.id);
          });
          firstLoad.current = false;
        } else {
          const newReadyOrders = data.filter((o: any) => o.status === 'READY' && !notifiedOrderIds.current.has(o.id));
          if (newReadyOrders.length > 0) {
            newReadyOrders.forEach((o: any) => {
              notifiedOrderIds.current.add(o.id);
              const msg = `Food ready for Table ${o.table?.tableNumber || '?'}! (Order #${o.orderNumber || o.id.substring(0,4)})`;
              const notifId = Date.now() + Math.random();
              setNotifications(prev => [...prev, { id: notifId, message: msg }]);
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== notifId));
              }, 5000);
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    const p = setInterval(fetchData, 5000);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);

  const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = e.target.value;
    if (!itemId) return;
    const item = menuItems.find(m => m.id === itemId);
    if (!item) return;

    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { menuItem: item, qty: 1 }];
    });
    e.target.value = ''; // Reset select
  };

  const submitOrder = async () => {
    if (orderItems.length === 0 || !selectedTableId) return;
    setSubmitting(true);
    try {
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tableId: selectedTableId,
          notes: orderNotes,
          items: orderItems.map(i => ({ menuItemId: i.menuItem.id, quantity: i.qty, price: i.menuItem.price }))
        })
      });
      setOrderItems([]);
      setOrderNotes('');
      setSelectedTableId('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTable = async () => {
    const tableNumber = prompt('Enter new table number (e.g. 13):');
    if (!tableNumber) return;
    try {
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ tableNumber: parseInt(tableNumber), capacity: 4, status: 'AVAILABLE' })
      });
      fetchData();
    } catch(e) {}
  };

  const handleUpdateTableStatus = async (e: React.MouseEvent, id: string, status: string) => {
    e.stopPropagation();
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if(status === 'AVAILABLE' && selectedTableId === id) setSelectedTableId('');
      fetchData();
    } catch(e) {}
  };

  const removeOrderItem = (menuItemId: string) => {
    setOrderItems(prev => prev.filter(i => i.menuItem.id !== menuItemId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.qty), 0);
  };
  
  const subtotal = calculateTotal();
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  // Stats logic
  const availableTables = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED').length;
  const myActiveOrders = orders.filter(o => o.status !== 'PAID').length;
  const ordersSent = orders.filter(o => o.status === 'PREPARING' || o.status === 'NEW').length;

  const formatDate = (d: Date) => {
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return { time, date };
  };
  const { time, date } = formatDate(currentTime);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return { border: '#10b981', bg: '#10b98120', text: '#10b981' };
      case 'OCCUPIED': return { border: '#f59e0b', bg: '#f59e0b20', text: '#f59e0b' };
      case 'RESERVED': return { border: '#3b82f6', bg: '#3b82f620', text: '#3b82f6' };
      case 'CLEANING': return { border: '#64748b', bg: '#64748b20', text: '#64748b' };
      default: return { border: '#64748b', bg: '#64748b20', text: '#64748b' };
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc', height: '100%', overflowY: 'auto' }}>
      
      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, border: '1px solid #059669' }}>
            <Bell size={20} />
            {n.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 8px 0', color: '#f8fafc' }}>
            Welcome back, {userName}! 👋
          </h1>
          <p style={{ margin: 0, color: '#9ca3af' }}>Take orders, manage tables and keep the service going.</p>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>{time}</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{date}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1f2330', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{userName.substring(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{userName}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>Waiter <ChevronDown size={12}/></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: '#161922', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#3b82f620', padding: '16px', borderRadius: '50%' }}>
            <LayoutDashboard size={28} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>{availableTables}</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Available Tables</div>
            <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px' }}>Ready to sit</div>
          </div>
        </div>
        
        <div style={{ background: '#161922', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#f59e0b20', padding: '16px', borderRadius: '50%' }}>
            <Users size={28} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>{occupiedTables}</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Occupied Tables</div>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>Currently dining</div>
          </div>
        </div>

        <div style={{ background: '#161922', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#10b98120', padding: '16px', borderRadius: '50%' }}>
            <ClipboardList size={28} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>{myActiveOrders}</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>My Active Orders</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>In progress</div>
          </div>
        </div>

        <div style={{ background: '#161922', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#a855f720', padding: '16px', borderRadius: '50%' }}>
            <ChefHat size={28} color="#a855f7" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>{ordersSent}</div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Orders Sent</div>
            <div style={{ fontSize: '0.75rem', color: '#a855f7', marginTop: '4px' }}>To Kitchen</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Col: Table Grid */}
        <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Table Management</h2>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ color: '#f97316', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>View Floor Plan <LayoutDashboard size={14}/></div>
              <div onClick={handleAddTable} style={{ color: '#10b981', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={14}/> Add Table</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div> Occupied
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div> Reserved
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#9ca3af' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b' }}></div> Cleaning
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading floor plan...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', gridAutoRows: 'max-content' }}>
              {tables.map(t => {
                const colors = getStatusColor(t.status);
                return (
                  <div key={t.id} style={{ 
                    border: `1px solid ${colors.border}`, 
                    borderRadius: '12px', 
                    padding: '16px', 
                    display: 'flex', alignItems: 'center', gap: '16px',
                    cursor: t.status === 'AVAILABLE' ? 'pointer' : 'default',
                    background: selectedTableId === t.id ? '#1f2330' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => { if(t.status === 'AVAILABLE') setSelectedTableId(t.id); }}
                  >
                    <div style={{ color: colors.text }}>
                      <LayoutDashboard size={28} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>T{t.tableNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: colors.text }}>
                        {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        {t.status === 'AVAILABLE' && (
                          <button onClick={(e) => handleUpdateTableStatus(e, t.id, 'OCCUPIED')} style={{ padding: '4px 8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Seat</button>
                        )}
                        {t.status === 'OCCUPIED' && (
                          <button onClick={(e) => handleUpdateTableStatus(e, t.id, 'AVAILABLE')} style={{ padding: '4px 8px', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.text, borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Clear</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutDashboard size={14}/> Tap on any available table to start order
          </div>

          {/* Recent Orders section at bottom of Table Grid */}
          <div style={{ marginTop: '40px', borderTop: '1px solid #1f2330', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Recent Orders</h2>
              <div style={{ color: '#f97316', fontSize: '0.9rem', cursor: 'pointer' }}>View All</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.slice(0,3).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#0f1219', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <div style={{ color: '#f59e0b', fontWeight: 600 }}>#ORD-{o.orderNumber || o.id.substring(0,4)}</div>
                  <div style={{ color: '#d1d5db' }}>Table {o.table?.tableNumber}</div>
                  <div style={{ color: '#9ca3af' }}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div style={{ color: '#d1d5db' }}>{o.items?.length || 0} items</div>
                  <div style={{ color: o.status === 'READY' ? '#10b981' : '#3b82f6', background: o.status === 'READY' ? '#10b98120' : '#3b82f620', padding: '2px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                    {o.status === 'READY' ? 'Ready to Serve' : o.status === 'NEW' ? 'Sent to Kitchen' : 'In Progress'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Cart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', padding: '24px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 600 }}>Take Order</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#9ca3af' }}>Select table to start taking order</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px' }}>Select Table</label>
              <select 
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                style={{ width: '100%', background: '#0f1219', border: '1px solid #1f2330', color: '#f8fafc', padding: '12px', borderRadius: '8px', outline: 'none' }}
              >
                <option value="">Choose an available table</option>
                {tables.filter(t => t.status === 'AVAILABLE').map(t => (
                  <option key={t.id} value={t.id}>Table {t.tableNumber}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={() => document.getElementById('menu-select')?.focus()}
              disabled={!selectedTableId}
              style={{ width: '100%', padding: '12px', background: selectedTableId ? '#f97316' : '#f9731650', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: selectedTableId ? 'pointer' : 'not-allowed' }}
            >
              <ClipboardList size={18} /> Start Taking Order
            </button>
          </div>

          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>My Active Order</h2>
              {selectedTableId && <div style={{ color: '#f97316', fontSize: '0.9rem' }}>Table {tables.find(t=>t.id===selectedTableId)?.tableNumber}</div>}
            </div>

            {/* Menu Item Adder (Only visible if table selected) */}
            {selectedTableId && (
              <div style={{ marginBottom: '20px' }}>
                <select 
                  id="menu-select"
                  onChange={handleAddItem}
                  defaultValue=""
                  style={{ width: '100%', background: '#0f1219', border: '1px dashed #3b82f6', color: '#3b82f6', padding: '12px', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="" disabled>+ Add Menu Item</option>
                  {menuItems.map(m => (
                    <option key={m.id} value={m.id}>{m.name} - ₹{m.price}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {orderItems.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>No items added yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                      <div style={{ color: '#d1d5db', display: 'flex', gap: '12px' }}>
                        <span>{item.qty}</span>
                        <span>{item.menuItem.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span>₹{item.menuItem.price * item.qty}</span>
                        <X size={16} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => removeOrderItem(item.menuItem.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1f2330' }}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Special Instructions / Allergies"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  style={{ width: '100%', background: '#0f1219', border: '1px solid #1f2330', color: '#f8fafc', padding: '10px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#9ca3af', fontSize: '0.9rem' }}>
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 600 }}>
                <span>Total</span>
                <span style={{ color: '#f97316' }}>₹{total}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setOrderItems([])}
                  style={{ flex: 1, background: 'transparent', border: '1px solid #1f2330', color: '#d1d5db', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Trash2 size={16} /> Cancel Order
                </button>
                <button 
                  onClick={submitOrder}
                  disabled={orderItems.length === 0 || submitting}
                  style={{ flex: 1, background: orderItems.length > 0 ? '#10b981' : '#10b98150', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: orderItems.length > 0 ? 'pointer' : 'not-allowed' }}
                >
                  {submitting ? 'Sending...' : 'Send to Kitchen'}
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <ChefHat size={12} /> Order will be sent to chef
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
