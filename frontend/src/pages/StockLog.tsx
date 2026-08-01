import React from 'react';
import { 
  LayoutDashboard, ArrowRightLeft, Search, Filter, ArrowUpCircle, 
  ArrowDownCircle, FileEdit, Plus, Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const METRICS_DATA = [
  { id: 1, title: 'Items Received', value: '450', desc: 'Today', icon: ArrowUpCircle, color: '#15803d', bg: '#dcfce7' },
  { id: 2, title: 'Items Issued', value: '280', desc: 'Today', icon: ArrowDownCircle, color: '#2563eb', bg: '#dbeafe' },
  { id: 3, title: 'Spoilage/Waste', value: '12', desc: 'Logged today', icon: FileEdit, color: '#e11d48', bg: '#ffe4e6' },
];

const LOG_DATA = [
  { id: 'LOG-001', date: '10:45 AM, Today', item: 'Premium Tomatoes', sku: 'SKU-204', qty: '+50 kg', type: 'IN', reason: 'PO-2023-089 Delivery', user: 'John Doe' },
  { id: 'LOG-002', date: '09:30 AM, Today', item: 'Truffle Oil', sku: 'SKU-410', qty: '-2 L', type: 'OUT', reason: 'Kitchen Requisition', user: 'Chef Mario' },
  { id: 'LOG-003', date: '08:15 AM, Today', item: 'Avocados', sku: 'SKU-205', qty: '-5 kg', type: 'ADJ', reason: 'Spoilage', user: 'Jane Smith' },
  { id: 'LOG-004', date: 'Yesterday', item: 'Chicken Breast', sku: 'SKU-102', qty: '+120 kg', type: 'IN', reason: 'PO-2023-088 Delivery', user: 'John Doe' },
  { id: 'LOG-005', date: 'Yesterday', item: 'Heavy Cream', sku: 'SKU-301', qty: '-15 L', type: 'OUT', reason: 'Kitchen Requisition', user: 'Chef Mario' },
];

const VOLUME_DATA = [
  { time: '9 AM', volume: 20 },
  { time: '11 AM', volume: 150 },
  { time: '1 PM', volume: 40 },
  { time: '3 PM', volume: 80 },
  { time: '5 PM', volume: 210 },
];

export default function StockLog() {

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'IN': return { bg: '#dcfce7', color: '#15803d' };
      case 'OUT': return { bg: '#dbeafe', color: '#2563eb' };
      case 'ADJ': return { bg: '#ffe4e6', color: '#e11d48' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: '#fafafa', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#6366f1', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#475569' }}>Stock In / Stock Out</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '12px', borderRadius: '12px' }}>
            <ArrowRightLeft size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 'bold' }}>Stock Ledger</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Complete audit trail of all inventory movements, requisitions, and adjustments.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', color: '#e11d48', fontWeight: 600, cursor: 'pointer' }}>
            Log Wastage
          </button>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#5b21b6', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> New Requisition
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {METRICS_DATA.map(metric => (
          <div key={metric.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
              <metric.icon size={20} />
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{metric.title}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{metric.value}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{metric.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: Ledger */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', flex: 1, maxWidth: '300px' }}>
                  <Search size={16} color="#94a3b8" />
                  <input type="text" placeholder="Search item, user, or reason..." style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '0.875rem' }} />
                </div>
                <button style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 16px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>
                  <Calendar size={16} /> Date Range
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 20px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>
                  <Filter size={16} /> Filter Type
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Date & Time</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Item</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Quantity</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Reason / Ref</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  {LOG_DATA.map(item => {
                    const typeStyle = getTypeStyle(item.type);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 0', fontSize: '0.85rem', color: '#64748b' }}>{item.date}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{item.item}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>{item.sku}</div>
                        </td>
                        <td>
                          <span style={{ background: typeStyle.bg, color: typeStyle.color, padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                            {item.type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: item.qty.startsWith('+') ? '#15803d' : '#e11d48', fontWeight: 700 }}>{item.qty}</td>
                        <td style={{ fontSize: '0.85rem', color: '#475569' }}>{item.reason}</td>
                        <td style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 500 }}>{item.user}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chart */}
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', fontSize: '1rem' }}>Movement Volume (Today)</h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VOLUME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Line type="monotone" dataKey="volume" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
