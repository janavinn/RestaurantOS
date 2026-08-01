import { useState, useEffect } from 'react';
import { ChefHat, CheckCircle2, Clock, CheckCircle, FileText } from 'lucide-react';

export default function WaiterOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 5 seconds for updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkServed = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'SERVED' }) // Or keep it simple and just mark the order as SERVED
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to mark served', err);
    }
  };

  const handleGenerateBill = async (orderId: string, total: number) => {
    try {
      const taxAmount = total * 0.05; // 5% GST
      const finalTotal = total + taxAmount;
      
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: 'BILLED',
          tax: taxAmount,
          discount: 0,
          finalTotal: finalTotal
        })
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to generate bill', err);
    }
  };

  // Filter out BILLED and PAID orders from view
  const activeOrders = orders.filter(o => ['NEW', 'PREPARING', 'READY', 'SERVED'].includes(o.status));

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>My Orders</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>Track orders in the kitchen and serve when ready.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '64px' }}>Loading orders...</div>
      ) : activeOrders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '64px', background: 'white', borderRadius: '16px' }}>
          No active orders. Head to the Tables tab to take a new order!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {activeOrders.map(order => (
            <div 
              key={order.id} 
              style={{ 
                background: 'white', 
                borderRadius: '24px', 
                padding: '24px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: `2px solid ${order.status === 'READY' ? '#34d399' : 'transparent'}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {order.status === 'READY' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#10b981', color: 'white', textAlign: 'center', padding: '6px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>
                  READY TO SERVE!
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', marginTop: order.status === 'READY' ? '16px' : '0' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Table</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{order.table?.tableNumber || 'Unknown'}</div>
                </div>
                
                {order.status === 'NEW' && (
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> New
                  </span>
                )}
                {order.status === 'PREPARING' && (
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChefHat size={14} /> Cooking
                  </span>
                )}
                {order.status === 'SERVED' && (
                  <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Served
                  </span>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '16px 0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.quantity}x {item.menuItem.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {order.status === 'READY' ? (
                <button 
                  onClick={() => handleMarkServed(order.id)}
                  style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  Mark as Served <CheckCircle2 size={18} />
                </button>
              ) : order.status === 'SERVED' ? (
                <button 
                  onClick={() => handleGenerateBill(order.id, order.total)}
                  style={{ width: '100%', padding: '14px', background: '#4f46e5', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  Generate Bill <FileText size={18} />
                </button>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                  Waiting for kitchen...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
