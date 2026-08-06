import { useState, useEffect } from 'react';
import { Receipt, Percent, FileText, ChevronRight, CheckCircle2, X } from 'lucide-react';

export default function CashierBilling() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Billing Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [gst, setGst] = useState<number>(5); // Default 5% GST
  const [discount, setDiscount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      // Only show orders that are ready to be billed (SERVED or NEW/PREPARING/READY if they just want to checkout early, but let's just show all active for flexibility)
      // Actually, wait, Cashier only generates bill when Customer Finishes. 
      // The current TableManagement sets 'PAID' to clear. Waiter doesn't set SERVED right now. 
      // Let's just show all orders that are NOT PAID and NOT BILLED.
      setOrders(data.filter((o: any) => o.status !== 'PAID' && o.status !== 'BILLED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateTotals = () => {
    if (!selectedOrder) return { subtotal: 0, taxAmount: 0, discountAmount: 0, final: 0 };
    const subtotal = selectedOrder.total;
    const discountAmount = discount;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableAmount * gst) / 100;
    const final = taxableAmount + taxAmount;
    return { subtotal, taxAmount, discountAmount, final };
  };

  const handleGenerateBill = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    const { taxAmount, discountAmount, final } = calculateTotals();
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: 'BILLED',
          tax: taxAmount,
          discount: discountAmount,
          finalTotal: final
        })
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '40px', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#1e1b4b', color: '#818cf8', padding: '12px', borderRadius: '12px' }}>
            <Receipt size={28} />
          </div>
          Generate Bill
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>View completed orders and generate final bills.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '64px' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', background: '#131313', padding: '64px', borderRadius: '16px', color: '#64748b' }}>
          No active orders waiting for billing.
        </div>
      ) : (
        <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {orders.map(order => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              style={{ background: '#131313', borderRadius: '16px', padding: '24px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #1f2330', transition: 'transform 0.1s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Table</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>{order.table?.tableNumber || 'Takeaway'}</div>
                </div>
                <div style={{ background: '#1f2330', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                  {order.status}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #1f2330', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>{order.items.length} Items</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BILLING MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: '#131313', borderRadius: '24px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #1f2330', background: '#0a0a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>Table {selectedOrder.table?.tableNumber} - Bill Setup</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h3 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 500 }}>{item.quantity}x {item.menuItem.name}</div>
                    <div style={{ color: '#475569', fontWeight: 600 }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>Adjustments</h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#475569', fontWeight: 600, marginBottom: '8px' }}>GST (%)</label>
                  <div style={{ position: 'relative' }}>
                    <Percent size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="number" 
                      value={gst}
                      onChange={(e) => setGst(Number(e.target.value))}
                      style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #1f2330', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#475569', fontWeight: 600, marginBottom: '8px' }}>Discount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>₹</span>
                    <input 
                      type="number" 
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      style={{ width: '100%', padding: '12px 12px 12px 32px', borderRadius: '8px', border: '1px solid #1f2330', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#1f2330', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#475569', fontSize: '1.05rem' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{calculateTotals().subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#f87171', fontSize: '1.05rem' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>-₹{calculateTotals().discountAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: '#475569', fontSize: '1.05rem' }}>
                  <span>GST ({gst}%)</span>
                  <span style={{ fontWeight: 600 }}>+₹{calculateTotals().taxAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '24px' }}>
                  <span style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 700 }}>Final Total</span>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>₹{calculateTotals().final.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #1f2330', background: '#131313' }}>
              <button 
                onClick={handleGenerateBill}
                disabled={isProcessing}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#4f46e5', color: 'white', fontSize: '1.1rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {isProcessing ? 'Generating...' : 'Generate Bill & Print'} <FileText size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
