import React, { useState, useEffect } from 'react';
import { Package, Download, Upload, ClipboardList, Truck, AlertTriangle, PlusCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  minStock: number;
  unit: string;
  supplierName: string;
}

interface PurchaseRequest {
  id: string;
  itemName: string;
  quantity: string;
  status: string;
  requestedBy: string;
  createdAt: string;
}

export default function StoreKeeperDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stockin' | 'stockout' | 'requests' | 'deliveries'>('requests');
  
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms State
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [updateQuantity, setUpdateQuantity] = useState<number | ''>('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch Inventory
      const invRes = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (invRes.ok) setInventory(await invRes.json());

      // Fetch Purchase Requests
      const prRes = await fetch('/api/purchase-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (prRes.ok) setRequests(await prRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent, type: 'IN' | 'OUT') => {
    e.preventDefault();
    if (!selectedItem || updateQuantity === '') return;

    const item = inventory.find(i => i.id === selectedItem);
    if (!item) return;

    const newStock = type === 'IN' 
      ? item.stockLevel + Number(updateQuantity) 
      : item.stockLevel - Number(updateQuantity);

    if (newStock < 0) {
      alert('Cannot reduce stock below zero!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/inventory/${selectedItem}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stockLevel: newStock })
      });

      if (res.ok) {
        setSuccessMsg(`Successfully updated ${item.name}`);
        setUpdateQuantity('');
        setSelectedItem('');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update stock', err);
    }
  };

  const handleCompleteRequest = async (id: string, itemName: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/purchase-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'FULFILLED' })
      });

      if (res.ok) {
        setSuccessMsg(`Marked ${itemName} as FULFILLED.`);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update request', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/aarunya/staff/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)', background: 'transparent', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Horizontal Tabs */}
      <div style={{ background: '#131313', borderBottom: '1px solid #1f2330', padding: '0 40px' }}>
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('requests')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', border: 'none', background: 'transparent', color: activeTab === 'requests' ? '#eab308' : '#64748b', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'requests' ? '3px solid #eab308' : '3px solid transparent', transition: 'all 0.2s' }}
          >
            <ClipboardList size={20} /> Purchase Requests
          </button>
          <button 
            onClick={() => setActiveTab('stockin')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', border: 'none', background: 'transparent', color: activeTab === 'stockin' ? '#10b981' : '#64748b', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'stockin' ? '3px solid #10b981' : '3px solid transparent', transition: 'all 0.2s' }}
          >
            <Download size={20} /> Stock In
          </button>
          <button 
            onClick={() => setActiveTab('stockout')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', border: 'none', background: 'transparent', color: activeTab === 'stockout' ? '#f43f5e' : '#64748b', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'stockout' ? '3px solid #f43f5e' : '3px solid transparent', transition: 'all 0.2s' }}
          >
            <Upload size={20} /> Stock Out
          </button>
          <button 
            onClick={() => setActiveTab('deliveries')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', border: 'none', background: 'transparent', color: activeTab === 'deliveries' ? '#a855f7' : '#64748b', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'deliveries' ? '3px solid #a855f7' : '3px solid transparent', transition: 'all 0.2s' }}
          >
            <Truck size={20} /> Deliveries
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {successMsg && (
          <div style={{ background: '#064e3b', color: '#34d399', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, border: '1px solid #064e3b', boxShadow: 'none' }}>
            <CheckCircle2 size={20} /> {successMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '64px' }}>Loading data...</div>
        ) : (
          <>
            {/* PURCHASE REQUESTS TAB (Moved to top) */}
            {activeTab === 'requests' && (
              <div>
                <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem', fontWeight: 700, color: '#f8fafc' }}>Purchase Requests</h1>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {requests.filter(r => r.status === 'STORE_PENDING').length === 0 ? (
                    <div style={{ background: '#131313', padding: '32px', borderRadius: '16px', textAlign: 'center', color: '#64748b', border: '1px solid #1f2330' }}>
                      No pending purchase requests right now.
                    </div>
                  ) : (
                    requests.filter(r => r.status === 'STORE_PENDING').map(req => (
                      <div key={req.id} style={{ background: '#131313', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{req.itemName}</h3>
                            <span style={{ background: '#143d23', color: '#22c55e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>STORE PENDING</span>
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
                            Requested: <strong>{req.quantity}</strong> • By: {req.requestedBy}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleCompleteRequest(req.id, req.itemName)}
                          style={{ background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                        >
                          <CheckCircle2 size={18} /> Mark as Fulfilled
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* STOCK IN TAB */}
            {activeTab === 'stockin' && (
              <div>
                <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem', fontWeight: 700, color: '#f8fafc' }}>Stock In (Receive Delivery)</h1>
                
                <div style={{ background: '#131313', borderRadius: '16px', padding: '32px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', maxWidth: '600px' }}>
                  <form onSubmit={(e) => handleUpdateStock(e, 'IN')}>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>Select Ingredient</label>
                      <select 
                        value={selectedItem} 
                        onChange={(e) => setSelectedItem(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1f2330', fontSize: '1rem', outline: 'none', background: '#0a0a0a', color: '#f8fafc' }}
                      >
                        <option value="">-- Choose item to receive --</option>
                        {inventory.map(item => (
                          <option key={item.id} value={item.id}>{item.name} (Current: {item.stockLevel} {item.unit})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>Quantity Received</label>
                      <input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={updateQuantity}
                        onChange={(e) => setUpdateQuantity(Number(e.target.value))}
                        required
                        placeholder="e.g. 20"
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1f2330', fontSize: '1rem', outline: 'none', background: '#0a0a0a', color: '#f8fafc' }}
                      />
                    </div>

                    <button type="submit" style={{ width: '100%', background: '#10b981', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Download size={20} /> Receive Stock
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* STOCK OUT TAB */}
            {activeTab === 'stockout' && (
              <div>
                <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem', fontWeight: 700, color: '#f8fafc' }}>Stock Out (Issue to Kitchen / Damaged)</h1>
                
                <div style={{ background: '#131313', borderRadius: '16px', padding: '32px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', maxWidth: '600px' }}>
                  <form onSubmit={(e) => handleUpdateStock(e, 'OUT')}>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>Select Ingredient</label>
                      <select 
                        value={selectedItem} 
                        onChange={(e) => setSelectedItem(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1f2330', fontSize: '1rem', outline: 'none', background: '#0a0a0a', color: '#f8fafc' }}
                      >
                        <option value="">-- Choose item to issue --</option>
                        {inventory.filter(i => i.stockLevel > 0).map(item => (
                          <option key={item.id} value={item.id}>{item.name} (Current: {item.stockLevel} {item.unit})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>Quantity to Issue/Remove</label>
                      <input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={updateQuantity}
                        onChange={(e) => setUpdateQuantity(Number(e.target.value))}
                        required
                        placeholder="e.g. 5"
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1f2330', fontSize: '1rem', outline: 'none', background: '#0a0a0a', color: '#f8fafc' }}
                      />
                    </div>

                    <button type="submit" style={{ width: '100%', background: '#f43f5e', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Upload size={20} /> Issue/Remove Stock
                    </button>
                  </form>
                </div>
              </div>
            )}



            {/* DELIVERIES TAB */}
            {activeTab === 'deliveries' && (
              <div>
                <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem', fontWeight: 700, color: '#f8fafc' }}>Recent Deliveries</h1>
                
                <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'transparent', borderBottom: '1px solid #1f2330' }}>
                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Item</th>
                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Quantity</th>
                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                        <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Requested By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.filter(r => r.status === 'FULFILLED').map(req => (
                        <tr key={req.id} style={{ borderBottom: '1px solid #1f2330' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: '#f8fafc' }}>{req.itemName}</td>
                          <td style={{ padding: '16px', color: '#e2e8f0', fontWeight: 500 }}>{req.quantity}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ background: '#064e3b', color: '#34d399', padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>FULFILLED</span>
                          </td>
                          <td style={{ padding: '16px', color: '#64748b', fontSize: '0.875rem' }}>{req.requestedBy}</td>
                        </tr>
                      ))}
                      {requests.filter(r => r.status === 'FULFILLED').length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No delivery history found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </>
        )}
      </div>

    </div>
  );
}
