import { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, CheckCircle2, IndianRupee } from 'lucide-react';

export default function CashierPayments() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders/active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setOrders(data.filter((o: any) => o.status === 'BILLED'));
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

  const handlePayment = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    
    try {
      await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: 'PAID',
          paymentMethod
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
          <div style={{ background: '#064e3b', color: '#34d399', padding: '12px', borderRadius: '12px' }}>
            <CreditCard size={28} />
          </div>
          Accept Payments
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>Collect payments for generated bills.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '64px' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', background: '#131313', padding: '64px', borderRadius: '16px', color: '#64748b' }}>
          No pending payments. Generate a bill first.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {orders.map(order => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              style={{ background: '#131313', borderRadius: '16px', padding: '24px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '2px solid #e2e8f0', transition: 'border-color 0.2s', position: 'relative' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, background: '#422006', color: '#fbbf24', padding: '6px 12px', borderBottomLeftRadius: '16px', borderTopRightRadius: '14px', fontSize: '0.85rem', fontWeight: 700 }}>
                AWAITING PAYMENT
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                Table {order.table?.tableNumber || 'Takeaway'}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
                ₹{(order.finalTotal || order.total).toFixed(2)}
              </div>
              <div style={{ color: '#475569', fontSize: '0.95rem' }}>
                {order.items.length} items billed
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAYMENT MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: '#131313', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>Table {selectedOrder.table?.tableNumber}</h2>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981', marginBottom: '32px' }}>
              ₹{(selectedOrder.finalTotal || selectedOrder.total).toFixed(2)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <button 
                onClick={() => setPaymentMethod('CASH')}
                style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${paymentMethod === 'CASH' ? '#10b981' : '#1f2330'}`, background: paymentMethod === 'CASH' ? '#10b98120' : '#0a0a0a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <Banknote size={32} color={paymentMethod === 'CASH' ? '#10b981' : '#64748b'} />
                <span style={{ fontWeight: 600, color: paymentMethod === 'CASH' ? '#10b981' : '#64748b' }}>Cash</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('CARD')}
                style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${paymentMethod === 'CARD' ? '#10b981' : '#1f2330'}`, background: paymentMethod === 'CARD' ? '#10b98120' : '#0a0a0a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <CreditCard size={32} color={paymentMethod === 'CARD' ? '#10b981' : '#64748b'} />
                <span style={{ fontWeight: 600, color: paymentMethod === 'CARD' ? '#10b981' : '#64748b' }}>Card</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('UPI')}
                style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${paymentMethod === 'UPI' ? '#10b981' : '#1f2330'}`, background: paymentMethod === 'UPI' ? '#10b98120' : '#0a0a0a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <Smartphone size={32} color={paymentMethod === 'UPI' ? '#10b981' : '#64748b'} />
                <span style={{ fontWeight: 600, color: paymentMethod === 'UPI' ? '#10b981' : '#64748b' }}>UPI</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#1f2330', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', fontSize: '1.1rem', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {isProcessing ? 'Processing...' : 'Payment Received'} <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
