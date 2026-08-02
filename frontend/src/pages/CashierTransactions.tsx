import { useState, useEffect } from 'react';
import { Search, History, Banknote, CreditCard, Smartphone } from 'lucide-react';

export default function CashierTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPaymentIcon = (method: string) => {
    if (method === 'CASH') return <Banknote size={18} />;
    if (method === 'CARD') return <CreditCard size={18} />;
    if (method === 'UPI') return <Smartphone size={18} />;
    return <Banknote size={18} />;
  };

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.table?.tableNumber?.toString() || '').includes(searchQuery)
  );

  return (
    <div style={{ padding: '40px', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#1f2330', color: '#475569', padding: '12px', borderRadius: '12px' }}>
              <History size={28} />
            </div>
            Transactions
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>View today's payment history and receipts.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search Bill ID or Table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #1f2330', fontSize: '1rem', outline: 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '64px' }}>Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', background: '#131313', padding: '64px', borderRadius: '16px', color: '#64748b' }}>
          No transactions found for today.
        </div>
      ) : (
        <div style={{ background: '#131313', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1f2330', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Bill Number</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Table</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Payment Method</th>
                <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const date = new Date(tx.createdAt);
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #1f2330' }}>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '0.95rem' }}>
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem' }}>
                      #{tx.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '0.95rem' }}>
                      {tx.table?.tableNumber ? `Table ${tx.table.tableNumber}` : 'Takeaway'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1f2330', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                        {getPaymentIcon(tx.paymentMethod || 'CASH')}
                        {tx.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#10b981', fontWeight: 700, fontSize: '1.1rem', textAlign: 'right' }}>
                      ₹{(tx.finalTotal || tx.total).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
