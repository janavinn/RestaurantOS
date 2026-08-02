import React, { useState, useEffect } from 'react';
import { Search, Receipt, CheckCircle, LayoutDashboard, CreditCard, Banknote, Loader2 } from 'lucide-react';

export default function BillingDashboard() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/tables', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter for occupied tables that have active orders
  const activeTables = tables.filter(t => t.status === 'OCCUPIED' && t.orders && t.orders.length > 0);

  const handleTableClick = (table: any) => {
    setSelectedTable(table);
    setIsBillingModalOpen(true);
  };

  const handleCheckout = async () => {
    if (!selectedTable || !selectedTable.orders || selectedTable.orders.length === 0) return;
    setIsProcessing(true);
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${selectedTable.orders[0].id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'PAID' })
      });
      setIsBillingModalOpen(false);
      setSelectedTable(null);
      fetchTables();
    } catch (err) {
      console.error(err);
      alert('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'SERVED': return { bg: '#dcfce7', text: '#166534' };
      case 'READY': return { bg: '#fef3c7', text: '#b45309' };
      case 'PREPARING': return { bg: '#ffedd5', text: '#c2410c' };
      case 'NEW': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} className="animate-spin" color="#6366f1" />
        <p style={{ color: '#64748b' }}>Loading active tables...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: '#fafafa', minHeight: '100vh' }}>
      <div style={{ fontSize: '0.875rem', color: '#6366f1', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#475569' }}>Billing & Checkout</span>
      </div>

      <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '12px', borderRadius: '12px' }}>
            <Receipt size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 'bold' }}>Billing Dashboard</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Process payments for occupied tables.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {activeTables.length === 0 ? (
          <div style={{ width: '100%', background: 'white', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Receipt size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#334155', margin: '0 0 8px 0' }}>No active orders to bill</h3>
            <p style={{ color: '#94a3b8', margin: 0 }}>All occupied tables have been paid for or there are no occupied tables.</p>
          </div>
        ) : (
          activeTables.map(table => {
            const order = table.orders[0];
            const colors = getOrderStatusColor(order.status);
            
            return (
              <div 
                key={table.id}
                onClick={() => handleTableClick(table)}
                style={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '16px', 
                  width: '280px', 
                  padding: '24px', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Table {table.tableNumber}</div>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: colors.bg, color: colors.text }}>
                    {order.status}
                  </span>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                    <span>Items Ordered</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{order.items.reduce((acc: any, curr: any) => acc + curr.quantity, 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '4px' }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>Total</span>
                    <span style={{ color: '#4f46e5', fontSize: '1.25rem', fontWeight: 700 }}>₹{order.total}</span>
                  </div>
                </div>
                
                <div style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>
                  Started at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isBillingModalOpen && selectedTable && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1.25rem' }}>Checkout - Table {selectedTable.tableNumber}</h2>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Order #{selectedTable.orders[0].id.substring(0,8)}</div>
              </div>
              <button onClick={() => setIsBillingModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ padding: '24px', maxHeight: '50vh', overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#334155' }}>Order Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedTable.orders[0].items.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', color: '#334155' }}>
                      <span style={{ fontWeight: 600, color: '#64748b', width: '24px' }}>{item.quantity}x</span>
                      <span>{item.menuItem.name}</span>
                    </div>
                    <span style={{ fontWeight: 500, color: '#0f172a' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#64748b' }}>
                  <span>Subtotal</span>
                  <span>₹{selectedTable.orders[0].total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b' }}>
                  <span>Tax (5%)</span>
                  <span>₹{(selectedTable.orders[0].total * 0.05).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', fontWeight: 700, fontSize: '1.25rem' }}>
                  <span style={{ color: '#0f172a' }}>Grand Total</span>
                  <span style={{ color: '#4f46e5' }}>₹{(selectedTable.orders[0].total * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>Payment Method</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setPaymentMethod('CASH')}
                    style={{ flex: 1, padding: '12px', border: `2px solid ${paymentMethod === 'CASH' ? '#4f46e5' : '#e2e8f0'}`, background: paymentMethod === 'CASH' ? '#eef2ff' : 'white', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: paymentMethod === 'CASH' ? '#4f46e5' : '#64748b', fontWeight: 600 }}
                  >
                    <Banknote size={24} /> Cash
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('CARD')}
                    style={{ flex: 1, padding: '12px', border: `2px solid ${paymentMethod === 'CARD' ? '#4f46e5' : '#e2e8f0'}`, background: paymentMethod === 'CARD' ? '#eef2ff' : 'white', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: paymentMethod === 'CARD' ? '#4f46e5' : '#64748b', fontWeight: 600 }}
                  >
                    <CreditCard size={24} /> Card
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                style={{ width: '100%', padding: '16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', transition: 'background 0.2s' }}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                {isProcessing ? 'Processing...' : 'Complete Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
