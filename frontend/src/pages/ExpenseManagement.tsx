import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Wallet, Plus, Search, Filter, MoreVertical, 
  Eye, TrendingDown, ArrowUpRight, ArrowDownRight, IndianRupee,
  Calendar, CheckCircle2, AlertCircle, Clock, X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Payroll', description: '', amount: '', date: '', status: 'APPROVED' });

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newExpense,
        amount: parseFloat(newExpense.amount) || 0
      };
      
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewExpense({ category: 'Payroll', description: '', amount: '', date: '', status: 'APPROVED' });
        fetchExpenses();
      } else {
        alert('Failed to log expense');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toUpperCase();
    switch(s) {
      case 'APPROVED': return { bg: '#dcfce7', color: '#15803d' };
      case 'PENDING': return { bg: '#fef3c7', color: '#b45309' };
      case 'REJECTED': return { bg: '#ffe4e6', color: '#e11d48' };
      default: return { bg: '#f1f5f9', color: '#cbd5e1' };
    }
  };

  const { metricsData, categoryExpenseData } = useMemo(() => {
    let total = 0;
    let pendingCount = 0;
    const categoryTotals: Record<string, number> = {};

    expenses.forEach(e => {
      total += e.amount;
      if (e.status === 'PENDING') pendingCount++;
      
      if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
      categoryTotals[e.category] += e.amount;
    });

    let highestCategory = 'None';
    let highestValue = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > highestValue) {
        highestValue = val;
        highestCategory = cat;
      }
    });

    const avgDaily = expenses.length > 0 ? (total / 30).toFixed(0) : 0;

    const metrics = [
      { id: 1, title: 'Total Expenses', value: `₹ ${total.toLocaleString('en-IN')}`, desc: 'All time', trend: '+ 2.1% vs last month', isUp: false, color: '#e11d48', bg: '#ffe4e6', spark: [50, 48, 49, 45, 42, 42] },
      { id: 2, title: 'Highest Category', value: highestCategory, desc: `₹ ${highestValue.toLocaleString('en-IN')}`, trend: 'Consistent', isUp: false, color: '#b48600', bg: '#f3e8ff', spark: [20, 20, 21, 21, 21, 21] },
      { id: 3, title: 'Pending Approvals', value: pendingCount.toString(), desc: 'Requires manager review', trend: '+ 1 today', isUp: false, color: '#d97706', bg: '#fef3c7', spark: [5, 4, 3, 6, 5, 8] },
      { id: 4, title: 'Avg Daily Spend', value: `₹ ${Number(avgDaily).toLocaleString('en-IN')}`, desc: 'Operating run rate', trend: '- ₹500 vs last week', isUp: true, color: '#059669', bg: '#d1fae5', spark: [16000, 15800, 15500, 15200, 15000, 15178] },
    ];

    const colors = ['#7e22ce', '#3b82f6', '#e11d48', '#f59e0b', '#10b981', '#6366f1'];
    const catData = Object.entries(categoryTotals).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value);

    return { metricsData: metrics, categoryExpenseData: catData };
  }, [expenses]);

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#cbd5e1' }}>Expense Management</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <Wallet size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Expense Management</h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>Track operating expenses, approve pending costs, and monitor cash outflow.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#131313', border: '1px solid #1f2330', padding: '10px 20px', borderRadius: '8px', color: '#b48600', fontWeight: 600, cursor: 'pointer' }}>
            <TrendingDown size={16} /> Export Ledger
          </button>
          <button onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Log Expense
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {metricsData.map(metric => (
          <div key={metric.id} style={{ background: '#131313', borderRadius: '12px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
                {metric.id === 1 ? <IndianRupee size={20} /> : metric.id === 2 ? <TrendingDown size={20} /> : metric.id === 3 ? <Clock size={20} /> : <Calendar size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>{metric.title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>{metric.value}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{metric.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '8px', color: metric.isUp ? '#15803d' : '#e11d48', fontWeight: 600 }}>
                  {metric.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {metric.trend}
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: '40px', padding: '0 12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.spark.map((v, i) => ({ name: i, value: v }))}>
                  <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: Ledger */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#131313', border: '1px solid #1f2330', borderRadius: '8px', padding: '0 16px', flex: 1, maxWidth: '300px' }}>
                  <Search size={16} color="#94a3b8" />
                  <input type="text" placeholder="Search expenses..." style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '0.875rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 20px', border: '1px solid #1f2330', background: '#131313', borderRadius: '8px', color: '#cbd5e1', fontWeight: 500, cursor: 'pointer' }}>
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2330' }}>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Category & Desc</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                  ) : expenses.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No expenses found.</td></tr>
                  ) : expenses.map(item => {
                    const statusStyle = getStatusStyle(item.status);
                    const d = new Date(item.date);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #1f2330' }}>
                        <td style={{ padding: '16px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit'})}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>{item.category}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.description}</div>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#e11d48', fontWeight: 600 }}>₹ {item.amount.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {item.status.toUpperCase() === 'APPROVED' ? <CheckCircle2 size={12} /> : item.status.toUpperCase() === 'REJECTED' ? <AlertCircle size={12} /> : <Clock size={12} />} 
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button style={{ background: '#131313', border: '1px solid #1f2330', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }} title="View Receipt">
                              <Eye size={14} />
                            </button>
                            <button style={{ background: '#131313', border: '1px solid #1f2330', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
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
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1rem' }}>Expenses by Category</h3>
            {categoryExpenseData.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>No expenses found</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryExpenseData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" dataKey="value">
                        {categoryExpenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginLeft: '16px' }}>
                  {categoryExpenseData.slice(0, 4).map((cat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color, flexShrink: 0 }}></div> 
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#131313', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Log New Expense</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddExpense}>
              <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Amount (₹)</label>
                  <input type="number" required min="0" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none', color: '#f8fafc' }} placeholder="e.g. 1500" />
                </div>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Category</label>
                  <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none', color: '#f8fafc' }}>
                    <option value="Payroll">Payroll</option>
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Training">Training</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Description</label>
                  <input type="text" required value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none', color: '#f8fafc' }} placeholder="e.g. Electricity Bill" />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Status</label>
                  <select value={newExpense.status} onChange={e => setNewExpense({...newExpense, status: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none', color: '#f8fafc' }}>
                    <option value="APPROVED">Approved / Paid</option>
                    <option value="PENDING">Pending Approval</option>
                  </select>
                </div>

              </div>
              
              <div className="modal-footer" style={{ padding: '16px 24px', background: '#0a0a0a', borderTop: '1px solid #1f2330', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#131313', border: '1px solid #1f2330', fontWeight: 500, color: '#cbd5e1', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#b48600', border: 'none', fontWeight: 500, color: 'white', cursor: 'pointer' }}>Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
