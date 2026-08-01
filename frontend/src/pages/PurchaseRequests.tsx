import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, CheckCircle2, Clock, AlertCircle, X, Check, XCircle } from 'lucide-react';

export default function PurchaseRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({ itemName: '', quantity: '' });
  
  // To check if the current user is an OWNER to show approve/reject buttons
  const [userRole, setUserRole] = useState<string>('');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/purchase-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch purchase requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || '');
    }
    fetchRequests();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newReq)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewReq({ itemName: '', quantity: '' });
        fetchRequests(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to create purchase request', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/purchase-requests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'OWNER_APPROVAL': return { bg: '#451a03', color: '#fb923c', icon: Clock, label: 'AWAITING OWNER' };
      case 'OWNER_APPROVED': return { bg: '#064e3b', color: '#34d399', icon: CheckCircle2, label: 'OWNER APPROVED' };
      case 'APPROVED_BY_MANAGER': return { bg: '#064e3b', color: '#34d399', icon: CheckCircle2, label: 'OWNER APPROVED' }; // Legacy data support
      case 'STORE_PENDING': return { bg: '#143d23', color: '#22c55e', icon: CheckCircle2, label: 'STORE PENDING' };
      case 'FULFILLED': return { bg: '#21234c', color: '#6366f1', icon: CheckCircle2, label: 'FULFILLED' };
      case 'PENDING': return { bg: '#3d2b07', color: '#f59e0b', icon: Clock, label: 'PENDING' };
      case 'REJECTED': return { bg: '#3d1b1c', color: '#ef4444', icon: AlertCircle, label: 'REJECTED' };
      default: return { bg: '#1f2937', color: '#9ca3af', icon: Clock, label: status };
    }
  };

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(67, 56, 202, 0.2)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <ShoppingCart size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Purchase Requests</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Request new ingredients from the Owner for supplier delivery.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#161922', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2330' }}>
                <th style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Item Name</th>
                <th style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Quantity</th>
                <th style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Requested By</th>
                <th style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                {['OWNER', 'MANAGER', 'STORE_KEEPER'].includes(userRole) && (
                  <th style={{ padding: '16px 24px', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No requests found.</td></tr>
              ) : requests.map(req => {
                const s = getStatusStyle(req.status);
                const Icon = s.icon;
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid #1f2330' }}>
                    <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#9ca3af' }}>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 500, color: '#f8fafc' }}>{req.itemName}</td>
                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#9ca3af' }}>{req.quantity}</td>
                    <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#9ca3af' }}>{req.requestedBy}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: s.bg, color: s.color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                        <Icon size={12} /> {s.label}
                      </span>
                    </td>
                    {['OWNER', 'MANAGER', 'STORE_KEEPER'].includes(userRole) && (
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {req.status === 'PENDING' && ['MANAGER', 'OWNER'].includes(userRole) && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleUpdateStatus(req.id, 'OWNER_APPROVAL')} style={{ background: '#451a03', color: '#fb923c', border: '1px solid #fb923c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Send to Owner for Approval">
                              <Check size={14} /> Send to Owner
                            </button>
                            <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} style={{ background: '#3d1b1c', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Reject">
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                        
                        {req.status === 'OWNER_APPROVAL' && userRole === 'OWNER' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleUpdateStatus(req.id, 'OWNER_APPROVED')} style={{ background: '#143d23', color: '#22c55e', border: '1px solid #22c55e', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Approve Request">
                              <Check size={14} /> Approve Request
                            </button>
                          </div>
                        )}
                        
                        {(req.status === 'OWNER_APPROVED' || req.status === 'APPROVED_BY_MANAGER') && ['MANAGER', 'OWNER'].includes(userRole) && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleUpdateStatus(req.id, 'STORE_PENDING')} style={{ background: '#143d23', color: '#22c55e', border: '1px solid #22c55e', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Send to Store Keeper">
                              <Check size={14} /> Send to Store
                            </button>
                          </div>
                        )}
                        
                        {req.status === 'STORE_PENDING' && ['STORE_KEEPER', 'OWNER'].includes(userRole) && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleUpdateStatus(req.id, 'FULFILLED')} style={{ background: '#21234c', color: '#6366f1', border: '1px solid #6366f1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} title="Mark as Fulfilled">
                              <CheckCircle2 size={14} /> Fulfill
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 10, 10, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#131313', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden', border: '1px solid #1f2330' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>New Purchase Request</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Item Name</label>
                  <input type="text" required value={newReq.itemName} onChange={e => setNewReq({...newReq, itemName: e.target.value})} style={{ background: '#0a0a0a', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', color: '#f8fafc', outline: 'none' }} placeholder="e.g. Tomatoes" />
                </div>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Quantity Required</label>
                  <input type="text" required value={newReq.quantity} onChange={e => setNewReq({...newReq, quantity: e.target.value})} style={{ background: '#0a0a0a', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', color: '#f8fafc', outline: 'none' }} placeholder="e.g. 20 kg" />
                </div>
              </div>
              
              <div className="modal-footer" style={{ padding: '16px 24px', background: '#0a0a0a', borderTop: '1px solid #1f2330', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid #1f2330', fontWeight: 500, color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#b48600', border: 'none', fontWeight: 600, color: '#0a0a0a', cursor: 'pointer' }}>Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
