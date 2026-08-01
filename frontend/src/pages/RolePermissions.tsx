import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Users, Lock, Shield, Plus, X, Search, UserPlus, 
  AlertCircle, LayoutDashboard, CheckCircle2, Briefcase, Package, ShoppingCart, 
  LineChart, Menu as MenuIcon, BookOpen, Truck, Settings, Wallet
} from 'lucide-react';

const PERMISSIONS_DEF = [
  {
    category: 'Staff Management',
    icon: Users,
    items: [
      { id: 'staff', name: 'Staff Management', v: 'view_staff', c: 'add_staff', e: 'edit_staff', d: 'remove_staff' }
    ]
  },
  {
    category: 'Operations & Orders',
    icon: ShoppingCart,
    items: [
      { id: 'orders', name: 'Orders', v: 'view_orders', c: 'create_orders', e: null, d: 'void_orders' },
      { id: 'discounts', name: 'Discounts', v: 'apply_discounts', c: null, e: null, d: null }
    ]
  },
  {
    category: 'Reports & Analytics',
    icon: LineChart,
    items: [
      { id: 'reports', name: 'Reports', v: 'view_reports', c: null, e: 'export_reports', d: null }
    ]
  }
];

export default function RolePermissions() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All Modules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (!selectedRole && data.length > 0) {
          setSelectedRole(data[0]);
        } else if (selectedRole) {
          const updated = data.find((r: any) => r.id === selectedRole.id);
          if (updated) setSelectedRole(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handlePermissionChange = (permKey: string, checked: boolean) => {
    if (!selectedRole) return;
    setSelectedRole({
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [permKey]: checked
      }
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ permissions: selectedRole.permissions })
      });
      if (res.ok) {
        fetchRoles();
        alert('Permissions saved successfully!');
      } else {
        alert('Failed to save permissions');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ roleName: newRoleName })
      });
      if (res.ok) {
        setNewRoleName('');
        setNewRoleModal(false);
        fetchRoles();
      } else {
        alert('Failed to create role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('owner')) return <ShieldAlert size={20} />;
    if (n.includes('manager')) return <Briefcase size={20} />;
    if (n.includes('chef')) return <Shield size={20} />;
    if (n.includes('waiter')) return <Users size={20} />;
    if (n.includes('cashier')) return <Lock size={20} />;
    if (n.includes('store')) return <Package size={20} />;
    return <UserPlus size={20} />;
  };

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading roles...</div>;
  }

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#cbd5e1' }}>Role & Permissions</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Role & Permissions</h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>Manage user roles and control what each role can access and do.</p>
          </div>
        </div>
        <button onClick={() => setNewRoleModal(true)} className="btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', padding: '12px 24px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 500, cursor: 'pointer', width: 'max-content', margin: 0 }}>
          <Plus size={18} /> Create Custom Role
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="metric-card" style={{ background: '#131313', padding: '24px', borderRadius: '12px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '16px', borderRadius: '12px' }}><Users size={24} /></div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Total Roles</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>{roles.length}</div>
          </div>
        </div>
        <div className="metric-card" style={{ background: '#131313', padding: '24px', borderRadius: '12px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '16px', borderRadius: '12px' }}><ShieldCheck size={24} /></div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Active Custom Roles</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>{roles.filter(r => r.type === 'Custom').length}</div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Role List */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Roles</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {roles.map(role => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <div 
                  key={role.id} 
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: '16px',
                    background: '#131313',
                    border: `1px solid ${isSelected ? '#b48600' : '#1f2330'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 12px rgba(180, 134, 0, 0.2)' : 'none',
                    display: 'flex', alignItems: 'center', gap: '16px'
                  }}
                >
                  <div style={{ padding: '10px', borderRadius: '8px', background: isSelected ? 'rgba(180, 134, 0, 0.15)' : '#1f2330', color: isSelected ? '#b48600' : '#94a3b8' }}>
                    {getRoleIcon(role.roleName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>{role.roleName}</h4>
                      <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: role.type === 'System' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(21, 128, 61, 0.15)', color: role.type === 'System' ? '#818cf8' : '#4ade80', fontWeight: 600 }}>{role.type}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{role.users} {role.users === 1 ? 'User' : 'Users'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: Permissions Matrix */}
        {selectedRole && (
          <div style={{ flex: 1, background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            {/* Matrix Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #1f2330', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#10b981', padding: '16px', borderRadius: '50%' }}>
                  <Briefcase size={28} />
                </div>
                <div>
                  <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#f8fafc' }}>{selectedRole.roleName} Permissions</h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'rgba(21, 128, 61, 0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}><Users size={12} /> {selectedRole.users} Users Assigned</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={fetchRoles} style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '10px 16px', background: '#131313', border: '1px solid #1f2330', borderRadius: '8px', color: '#94a3b8', fontWeight: 500, cursor: 'pointer' }}>
                  <X size={16} /> Discard Changes
                </button>
                <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#b48600', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div style={{ padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingBottom: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Permission</th>
                    <th style={{ textAlign: 'center', paddingBottom: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, width: '80px' }}>View</th>
                    <th style={{ textAlign: 'center', paddingBottom: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, width: '80px' }}>Create</th>
                    <th style={{ textAlign: 'center', paddingBottom: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, width: '80px' }}>Edit</th>
                    <th style={{ textAlign: 'center', paddingBottom: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, width: '80px' }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS_DEF.map((group, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td colSpan={5} style={{ padding: '24px 0 12px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                            <group.icon size={16} color={idx === 0 ? '#7e22ce' : idx === 1 ? '#ea580c' : '#2563eb'} /> {group.category}
                          </div>
                        </td>
                      </tr>
                      {group.items.map(item => (
                        <tr key={item.id}>
                          <td style={{ padding: '16px 0 16px 24px', fontSize: '0.875rem', color: '#cbd5e1', borderBottom: '1px solid #1f2330' }}>{item.name}</td>
                          <td style={{ textAlign: 'center', borderBottom: '1px solid #1f2330' }}>
                            {item.v && <input type="checkbox" className="custom-chk" checked={selectedRole.permissions[item.v] || false} onChange={(e) => handlePermissionChange(item.v as string, e.target.checked)} />}
                          </td>
                          <td style={{ textAlign: 'center', borderBottom: '1px solid #1f2330' }}>
                            {item.c && <input type="checkbox" className="custom-chk" checked={selectedRole.permissions[item.c] || false} onChange={(e) => handlePermissionChange(item.c as string, e.target.checked)} />}
                          </td>
                          <td style={{ textAlign: 'center', borderBottom: '1px solid #1f2330' }}>
                            {item.e && <input type="checkbox" className="custom-chk" checked={selectedRole.permissions[item.e] || false} onChange={(e) => handlePermissionChange(item.e as string, e.target.checked)} />}
                          </td>
                          <td style={{ textAlign: 'center', borderBottom: '1px solid #1f2330' }}>
                            {item.d && <input type="checkbox" className="custom-chk" checked={selectedRole.permissions[item.d] || false} onChange={(e) => handlePermissionChange(item.d as string, e.target.checked)} />}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'rgba(251, 146, 60, 0.1)', padding: '16px 24px', display: 'flex', gap: '12px', alignItems: 'center', color: '#fb923c', fontSize: '0.875rem' }}>
              <AlertCircle size={18} />
              <span>Changes you make will affect all users assigned to this role.</span>
            </div>
          </div>
        )}
      </div>

      {/* New Role Modal */}
      {newRoleModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#131313', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Create Custom Role</h2>
              <button onClick={() => setNewRoleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateRole}>
              <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Role Name</label>
                  <input type="text" required value={newRoleName} onChange={e => setNewRoleName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', color: '#f8fafc', outline: 'none' }} placeholder="e.g. Assistant Manager" />
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '16px 24px', background: '#0a0a0a', borderTop: '1px solid #1f2330', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setNewRoleModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#131313', border: '1px solid #1f2330', fontWeight: 500, color: '#cbd5e1', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#b48600', border: 'none', fontWeight: 500, color: 'white', cursor: 'pointer' }}>Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
