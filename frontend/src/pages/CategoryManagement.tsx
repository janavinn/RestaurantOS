import React from 'react';
import { 
  LayoutDashboard, Tags, Plus, Search, MoreVertical, Edit3, Trash2, 
  Layers, Package, IndianRupee, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';

const METRICS_DATA = [
  { id: 1, title: 'Total Categories', value: '18', desc: 'Active groupings', trend: '3 new added', isUp: true, color: '#7e22ce', bg: '#f3e8ff' },
  { id: 2, title: 'Largest Category', value: 'Produce', desc: '340 SKUs', trend: 'High turnover', isUp: true, color: '#059669', bg: '#d1fae5' },
  { id: 3, title: 'Highest Value', value: 'Meat', desc: '₹ 3.2L Inventory', trend: 'Requires monitoring', isUp: false, color: '#e11d48', bg: '#ffe4e6' },
];

const CATEGORIES = [
  { id: 1, name: 'Produce', items: 340, value: '₹ 1,50,000', status: 'Active' },
  { id: 2, name: 'Meat & Seafood', items: 125, value: '₹ 3,20,000', status: 'Active' },
  { id: 3, name: 'Dairy & Eggs', items: 85, value: '₹ 1,80,000', status: 'Active' },
  { id: 4, name: 'Dry Goods', items: 210, value: '₹ 1,20,000', status: 'Active' },
  { id: 5, name: 'Beverages', items: 145, value: '₹ 75,200', status: 'Active' },
  { id: 6, name: 'Packaging', items: 50, value: '₹ 35,000', status: 'Review Needed' },
];

export default function CategoryManagement() {
  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: '#fafafa', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#6366f1', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#475569' }}>Category Management</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '12px', borderRadius: '12px' }}>
            <Tags size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 'bold' }}>Category Management</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Organize your inventory into logical groupings for easier tracking.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {METRICS_DATA.map(metric => (
          <div key={metric.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
              {metric.id === 1 ? <Layers size={20} /> : metric.id === 2 ? <Package size={20} /> : <IndianRupee size={20} />}
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
        
        {/* LEFT COLUMN: Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', maxWidth: '300px', marginBottom: '24px' }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search categories..." style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '0.875rem' }} />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Category Name</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Total Items</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Total Value</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map(cat => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 0', fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{cat.name}</td>
                      <td style={{ fontSize: '0.875rem', color: '#6366f1', fontWeight: 600 }}>{cat.items} SKUs</td>
                      <td style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>{cat.value}</td>
                      <td>
                        <span style={{ background: cat.status === 'Active' ? '#dcfce7' : '#fef3c7', color: cat.status === 'Active' ? '#15803d' : '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {cat.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                            <Edit3 size={14} />
                          </button>
                          <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Add Form */}
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Plus size={18} color="#6366f1" /> Quick Add Category
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Category Name</label>
                <input type="text" placeholder="e.g., Frozen Foods" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '0.875rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Description (Optional)</label>
                <textarea placeholder="Brief description..." rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '0.875rem', resize: 'none' }}></textarea>
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                Save Category
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
