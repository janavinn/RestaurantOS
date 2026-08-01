import React from 'react';
import { 
  LayoutDashboard, User, Mail, Phone, Shield, Key, 
  Smartphone, Laptop, Save, UploadCloud, CheckCircle2
} from 'lucide-react';

export default function ProfileSettings() {
  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#cbd5e1' }}>Profile Settings</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <User size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Profile Settings</h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>Manage your personal information, security preferences, and active sessions.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Personal Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '32px' }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.25rem' }}>Personal Information</h2>
            
            {/* Avatar Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                JN
              </div>
              <div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', background: '#131313', border: '1px solid #1f2330', borderRadius: '8px', color: '#cbd5e1', fontWeight: 500, cursor: 'pointer' }}>
                    <UploadCloud size={16} /> Upload New
                  </button>
                  <button style={{ padding: '8px 16px', background: '#131313', border: '1px solid #fee2e2', borderRadius: '8px', color: '#ef4444', fontWeight: 500, cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>JPG, GIF or PNG. Max size of 800K</div>
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" defaultValue="Janavi" style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Last Name</label>
                <input type="text" defaultValue="N N" style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="email" defaultValue="janavi.owner@aarunya.com" style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="tel" defaultValue="+91 98765 43210" style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Role</label>
                <input type="text" value="System Administrator" disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', background: '#0a0a0a', color: '#94a3b8', fontSize: '0.95rem', cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #1f2330', display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', border: 'none', padding: '12px 24px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Security */}
        <div style={{ width: '400px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Shield size={20} color="#4f46e5" /> Security Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="password" placeholder="New Password" style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                </div>
              </div>
              <button style={{ width: '100%', padding: '10px', background: '#131313', color: '#b48600', border: '1px solid #4f46e5', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                Update Password
              </button>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #1f2330' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Add an extra layer of security.</div>
                </div>
                <label className="toggle-switch" style={{ margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', fontSize: '1.1rem' }}>Active Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '10px', borderRadius: '8px' }}>
                  <Laptop size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>Windows PC - Chrome</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bengaluru, India</div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '0.75rem', color: '#15803d', fontWeight: 600, marginTop: '4px' }}>
                    <CheckCircle2 size={12} /> Active Now
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid #1f2330', paddingTop: '16px' }}>
                <div style={{ background: '#1f2330', color: '#94a3b8', padding: '10px', borderRadius: '8px' }}>
                  <Smartphone size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>iPhone 14 - Safari</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Chennai, India</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    Last active: 2 hours ago
                  </div>
                </div>
                <button style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Revoke</button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
