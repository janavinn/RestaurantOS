import React, { useState, useEffect } from 'react';
import { Plus, X, Search, ChevronDown, Users, UserCheck, Clock, UserPlus, Eye, Edit2, Trash2, Filter, RotateCcw, Phone, LayoutDashboard, Copy, CalendarX, UserMinus } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  shift?: string;
  attendance?: string;
  phone?: string;
  emergencyContact?: string;
  createdAt: string;
}

export default function StaffManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'WAITER', shift: 'Morning' });
  const [editForm, setEditForm] = useState({ id: '', name: '', role: '', shift: '', status: '', phone: '', emergencyContact: '' });
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Success state for invite
  const [inviteResult, setInviteResult] = useState<{link: string, email: string} | null>(null);

  const [userRole, setUserRole] = useState('');

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error('Failed to fetch staff', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUserRole(u.role || '');
    }
    fetchStaff();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/staff/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inviteForm)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setInviteResult({ link: data.inviteUrl, email: inviteForm.email });
        setInviteForm({ name: '', email: '', role: 'WAITER', shift: 'Morning' });
        fetchStaff(); // Refresh list
      } else {
        alert(data.error || 'Failed to send invite');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const openEditModal = (s: Staff) => {
    setEditForm({ 
      id: s.id, 
      name: s.name, 
      role: s.role, 
      shift: s.shift || 'Morning', 
      status: s.status,
      phone: s.phone || '',
      emergencyContact: s.emergencyContact || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/staff/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchStaff();
      } else {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          alert(data.error || 'Failed to update staff');
        } catch {
          alert('Failed to update staff');
        }
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const handleQuickUpdate = async (id: string, field: string, value: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      });
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error('Failed quick update', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStaff();
      } else {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          alert(data.error || 'Failed to delete staff member.');
        } catch {
          alert('Failed to delete staff member.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'MANAGER': return { bg: '#3d2b07', text: '#f59e0b' }; // Gold
      case 'CHEF': return { bg: '#3d1b1c', text: '#ef4444' }; // Red
      case 'WAITER': return { bg: '#143d23', text: '#22c55e' }; // Green
      case 'CASHIER': return { bg: '#21234c', text: '#6366f1' }; // Blue
      case 'STORE KEEPER': return { bg: '#31194e', text: '#a855f7' }; // Purple
      default: return { bg: '#1f2937', text: '#9ca3af' };
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-orange-100 text-orange-700';
      case 'INACTIVE': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter staff based on permissions and UI filters
  const filteredStaff = staff.filter(s => {
    // Managers shouldn't see Owners in their staff list
    if (userRole === 'MANAGER' && s.role === 'OWNER') return false;
    
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="staff-page" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#9ca3af' }}>Staff Management</span>
      </div>

      <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title">
          <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 8px 0', fontWeight: 'bold' }}>Staff Management</h1>
          <p style={{ margin: 0, color: '#9ca3af' }}>
            {userRole === 'MANAGER' ? 'Track daily attendance, shifts, and contact information.' : 'Manage your restaurant staff, roles and permissions.'}
          </p>
        </div>
        {userRole !== 'MANAGER' && (
          <button className="btn-primary" onClick={() => setIsModalOpen(!isModalOpen)} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', padding: '12px 24px', width: 'max-content', margin: 0, color: '#0a0a0a', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            {isModalOpen ? <X size={18} /> : <UserPlus size={18} />} 
            {isModalOpen ? 'Cancel' : 'Add New Staff'}
          </button>
        )}
      </div>

      {/* Inline Add Staff Form (Only for OWNER) */}
      {isModalOpen && userRole === 'OWNER' && (
        <div style={{ background: '#131313', borderRadius: '12px', border: '1px solid #1f2330', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #1f2330', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Invite New Staff</h2>
          </div>
          
          {!inviteResult ? (
            <form onSubmit={handleInvite}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Full Name</label>
                  <input type="text" required value={inviteForm.name} onChange={e => setInviteForm({...inviteForm, name: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', color: '#f8fafc', outline: 'none' }} placeholder="John Doe" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Email Address</label>
                  <input type="email" required value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', color: '#f8fafc', outline: 'none' }} placeholder="john@example.com" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Assign Role</label>
                  <select value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', color: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
                    <option value="MANAGER">Manager</option>
                    <option value="CHEF">Chef (Kitchen)</option>
                    <option value="WAITER">Waiter (Front of House)</option>
                    <option value="CASHIER">Cashier (Billing)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Assign Shift</label>
                  <select value={inviteForm.shift} onChange={e => setInviteForm({...inviteForm, shift: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', color: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Full Day">Full Day</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid #1f2330', fontWeight: 500, color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#6366f1', border: 'none', fontWeight: 500, color: 'white', cursor: 'pointer' }}>Send Invite</button>
              </div>
            </form>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(21, 128, 61, 0.2)', color: '#4ade80', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <UserCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '8px', fontWeight: 600 }}>Invite Sent!</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '24px' }}>
                An email has been sent to <strong>{inviteResult.email}</strong>. You can also manually share this invite link:
              </p>
              <div style={{ background: '#0a0a0a', border: '1px dashed #1f2330', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                <input type="text" readOnly value={inviteResult.link} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#9ca3af', fontSize: '0.875rem' }} />
                <button onClick={() => { navigator.clipboard.writeText(inviteResult.link); alert('Copied to clipboard!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b48600' }}>
                  <Copy size={18} />
                </button>
              </div>
              <button onClick={() => { setIsModalOpen(false); setInviteResult(null); }} style={{ padding: '10px 32px', borderRadius: '8px', background: '#6366f1', border: 'none', fontWeight: 500, color: 'white', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="metrics-grid mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {userRole === 'MANAGER' ? (
          <>
            <div className="metric-card" style={{ padding: '24px', background: '#131313', border: 'none', borderBottom: '2px solid #3b82f6', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px', alignItems: 'center' }}>
                <div className="icon-box" style={{ background: '#1e293b', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Total Staff Today</span>
                  <div style={{ fontSize: '1.75rem', marginTop: '4px', color: 'white', fontWeight: 'bold' }}>{filteredStaff.length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px' }}>Across all roles</div>
                </div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '24px', background: '#131313', border: 'none', borderBottom: '2px solid #22c55e', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px', alignItems: 'center' }}>
                <div className="icon-box" style={{ background: '#064e3b', color: '#22c55e', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={20} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Present</span>
                  <div style={{ fontSize: '1.75rem', marginTop: '4px', color: 'white', fontWeight: 'bold' }}>{filteredStaff.filter(s => s.attendance === 'Present').length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '4px' }}>100% present</div>
                </div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '24px', background: '#131313', border: 'none', borderBottom: '2px solid #ef4444', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px', alignItems: 'center' }}>
                <div className="icon-box" style={{ background: '#450a0a', color: '#ef4444', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserMinus size={20} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Absent</span>
                  <div style={{ fontSize: '1.75rem', marginTop: '4px', color: 'white', fontWeight: 'bold' }}>{filteredStaff.filter(s => s.attendance === 'Absent').length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>0% absent</div>
                </div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '24px', background: '#131313', border: 'none', borderBottom: '2px solid #f59e0b', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px', alignItems: 'center' }}>
                <div className="icon-box" style={{ background: '#451a03', color: '#f59e0b', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarX size={20} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>On Leave</span>
                  <div style={{ fontSize: '1.75rem', marginTop: '4px', color: 'white', fontWeight: 'bold' }}>{filteredStaff.filter(s => s.attendance === 'Leave').length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>0% on leave</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card" style={{ padding: '24px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px' }}>
                <div className="icon-box" style={{ background: 'rgba(126, 34, 206, 0.2)', color: '#c084fc', width: '56px', height: '56px', borderRadius: '50%' }}><Users size={24} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Total Staff</span>
                  <span className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{staff.length}</span>
                  <span className="metric-trend" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>All employees</span>
                </div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '24px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px' }}>
                <div className="icon-box" style={{ background: 'rgba(21, 128, 61, 0.2)', color: '#4ade80', width: '56px', height: '56px', borderRadius: '50%' }}><UserCheck size={24} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Active</span>
                  <span className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{staff.filter(s => s.status === 'ACTIVE').length}</span>
                  <span className="metric-trend" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Currently active employees</span>
                </div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '24px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px' }}>
                <div className="icon-box" style={{ background: 'rgba(194, 65, 12, 0.2)', color: '#fb923c', width: '56px', height: '56px', borderRadius: '50%' }}><Clock size={24} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Pending</span>
                  <span className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{staff.filter(s => s.status === 'PENDING').length}</span>
                  <span className="metric-trend" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Awaiting setup</span>
                </div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '24px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div className="metric-header" style={{ gap: '16px' }}>
                <div className="icon-box" style={{ background: 'rgba(190, 24, 93, 0.2)', color: '#f472b6', width: '56px', height: '56px', borderRadius: '50%' }}><UserPlus size={24} /></div>
                <div className="metric-info">
                  <span className="metric-label" style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Kitchen Staff</span>
                  <span className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{staff.filter(s => s.role === 'CHEF').length}</span>
                  <span className="metric-trend" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>Chefs & cooks</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* FILTER TOOLBAR */}
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div className="search-bar" style={{ width: '350px', background: '#0a0a0a', border: '1px solid #1f2330', padding: '12px 16px', borderRadius: '8px', display: 'flex' }}>
            <input 
              type="text" 
              placeholder="Search staff by name or email..." 
              style={{ width: '100%', outline: 'none', border: 'none', background: 'transparent', color: '#f8fafc' }} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={18} color="#94a3b8" />
          </div>
          
          <div style={{ position: 'relative' }}>
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              style={{ padding: '12px 32px 12px 16px', border: '1px solid #1f2330', borderRadius: '8px', background: '#161922', outline: 'none', appearance: 'none', cursor: 'pointer', minWidth: '150px' }}
            >
              <option value="All">All Roles</option>
              {userRole !== 'MANAGER' && <option value="OWNER">Owner</option>}
              {userRole !== 'MANAGER' && <option value="MANAGER">Manager</option>}
              <option value="CHEF">Chef</option>
              <option value="WAITER">Waiter</option>
              <option value="CASHIER">Cashier</option>
            </select>
            <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none' }} />
          </div>
          
          {userRole !== 'MANAGER' && (
            <div style={{ position: 'relative' }}>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '12px 32px 12px 16px', border: '1px solid #1f2330', borderRadius: '8px', background: '#161922', outline: 'none', appearance: 'none', cursor: 'pointer', minWidth: '150px' }}
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '14px', pointerEvents: 'none' }} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={resetFilters} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid #b48600', color: '#b48600', fontWeight: 500 }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* FULL WIDTH TABLE */}
      <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', border: '1px solid #1f2330', borderRadius: '12px', background: '#131313' }}>
        <div className="table-responsive">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'transparent', borderBottom: '1px solid #1f2330', color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ width: '40px', padding: '16px 24px' }}>#</th>
                <th style={{ padding: '16px' }}>Staff Details</th>
                <th style={{ padding: '16px' }}>Role</th>
                <th style={{ padding: '16px' }}>Shift</th>
                {userRole === 'MANAGER' ? (
                  <th style={{ padding: '16px' }}>Attendance</th>
                ) : (
                  <>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Joined On</th>
                  </>
                )}
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={userRole === 'MANAGER' ? 6 : 7} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>Loading staff data...</td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={userRole === 'MANAGER' ? 6 : 7} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>No staff members found matching your filters.</td></tr>
              ) : (
                filteredStaff.map((s, index) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #1f2330' }}>
                    <td style={{ padding: '16px 24px', color: '#9ca3af', fontSize: '0.875rem' }}>{index + 1}</td>
                    <td style={{ padding: '16px' }}>
                      <div className="staff-name-cell" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: getRoleColor(s.role).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getRoleColor(s.role).text, fontSize: '0.85rem', fontWeight: 600 }}>
                          {s.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#f8fafc', fontSize: '0.875rem' }}>{s.name}</div>
                          {userRole === 'MANAGER' ? (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{s.phone || s.email}</div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{s.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: getRoleColor(s.role).bg, color: getRoleColor(s.role).text, textTransform: 'uppercase' }}>
                        {s.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>
                      {userRole === 'MANAGER' ? (
                        <select 
                          value={s.shift || 'Morning'}
                          onChange={(e) => handleQuickUpdate(s.id, 'shift', e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #1f2330', background: '#0a0a0a', color: '#cbd5e1', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                          <option value="Full Day">Full Day</option>
                        </select>
                      ) : (
                        s.shift || '-'
                      )}
                    </td>
                    {userRole === 'MANAGER' ? (
                      <td style={{ padding: '16px' }}>
                        <select 
                          value={s.attendance || 'Not Marked'}
                          onChange={(e) => handleQuickUpdate(s.id, 'attendance', e.target.value)}
                          style={{ 
                            padding: '6px 12px', 
                            borderRadius: '16px', 
                            border: 'none', 
                            outline: 'none',
                            background: s.attendance === 'Present' ? '#0d2716' : s.attendance === 'Absent' ? '#450a0a' : s.attendance === 'Leave' ? '#451a03' : '#1f2937',
                            color: s.attendance === 'Present' ? '#22c55e' : s.attendance === 'Absent' ? '#ef4444' : s.attendance === 'Leave' ? '#f59e0b' : '#9ca3af',
                            appearance: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          <option value="Not Marked">• Not Marked</option>
                          <option value="Present">• Present</option>
                          <option value="Absent">• Absent</option>
                          <option value="Leave">• Leave</option>
                        </select>
                      </td>
                    ) : (
                      <>
                        <td style={{ padding: '16px' }}>
                          <span className={`status-badge-clean ${getStatusColor(s.status)}`} style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 }}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>{new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      </>
                    )}
                    
                    <td style={{ padding: '16px' }}>
                      {(userRole !== 'MANAGER' || s.role !== 'MANAGER') && (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {s.status === 'PENDING' && userRole === 'OWNER' && (
                            <button className="icon-btn-outline" onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/staff/${s.id}/resend-invite`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  setInviteResult({ link: data.inviteUrl, email: s.email });
                                  setIsModalOpen(true);
                                } else {
                                  alert('Failed to resend invite');
                                }
                              } catch (err) {
                                console.error(err);
                                alert('An error occurred');
                              }
                            }} style={{ color: '#6366f1', border: '1px solid #1e1b4b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '6px', cursor: 'pointer' }} title="Resend Invite Link"><Copy size={14} /></button>
                          )}
                          <button className="icon-btn-outline" onClick={() => openEditModal(s)} style={{ color: '#d97706', border: '1px solid #43320f', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '6px', cursor: 'pointer' }} title="Edit Staff Details"><Edit2 size={14} /></button>
                          {userRole === 'OWNER' && (
                            <button className="icon-btn-outline" onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', border: '1px solid #450a0a', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', borderRadius: '6px', cursor: 'pointer' }} title="Remove Staff"><Trash2 size={14} /></button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1f2330', background: '#161922' }}>
          <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Showing {filteredStaff.length} of {staff.length} staff members</span>
        </div>
      </div>



      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#161922', borderRadius: '16px', width: '100%', maxWidth: '450px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Edit Staff Details</h2>
              <button className="btn-close" onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEdit}>
              <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Manager Edit View */}
                {userRole === 'MANAGER' ? (
                  <>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Phone Number</label>
                      <input type="text" className="input-field" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Emergency Contact</label>
                      <input type="text" className="input-field" value={editForm.emergencyContact} onChange={e => setEditForm({...editForm, emergencyContact: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Contact Name & Number" />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Shift</label>
                      <select className="input-field" value={editForm.shift} onChange={e => setEditForm({...editForm, shift: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Full Day">Full Day</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Full Name</label>
                      <input type="text" className="input-field" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="John Doe" />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Role</label>
                      <select className="input-field" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                        <option value="MANAGER">Manager</option>
                        <option value="CHEF">Chef (Kitchen)</option>
                        <option value="WAITER">Waiter (Front of House)</option>
                        <option value="CASHIER">Cashier (Billing)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Shift</label>
                      <select className="input-field" value={editForm.shift} onChange={e => setEditForm({...editForm, shift: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Full Day">Full Day</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Status</label>
                      <select className="input-field" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>
                  </>
                )}

              </div>
              <div className="modal-footer" style={{ padding: '16px 24px', background: '#0f1219', borderTop: '1px solid #1f2330', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#161922', border: '1px solid #cbd5e1', fontWeight: 500, color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#6366f1', border: 'none', fontWeight: 500, color: '#161922', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
