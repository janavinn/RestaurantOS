import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, Lock, EyeOff, User, BarChart2, Package, Users, FileText } from 'lucide-react';

export default function Login() {
  const { urlRole, urlUsername } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isOwnerRootLogin = !urlRole && !urlUsername;
  const displayRole = urlRole ? urlRole.charAt(0).toUpperCase() + urlRole.slice(1).toLowerCase() : 'Owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to login');
      
      if (urlRole && urlRole.toUpperCase() !== data.user.role) {
        throw new Error(`Access Denied: You are trying to login to the ${urlRole} portal with a ${data.user.role} account.`);
      }

      if (isOwnerRootLogin && data.user.role !== 'OWNER') {
        throw new Error('Access Denied: This portal is restricted to Restaurant Owners. Staff must use their direct links.');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const roleSlug = (data.user.role || 'owner').toLowerCase();
      const nameSlug = (data.user.name || 'user').toLowerCase().replace(/\s+/g, '-');

      window.location.href = `/${roleSlug}/${nameSlug}/dashboard`;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-layout">
      {/* Left Hero Section */}
      <div className="login-hero" style={{ backgroundImage: 'url(/restaurant-bg.png)' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
           <div className="brand">
             <div className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                  <line x1="6" y1="17" x2="18" y2="17"></line>
                </svg>
             </div>
             <div className="brand-text">
               <h2>Aarunya</h2>
               <p>Smart Restaurant Management</p>
             </div>
           </div>
           
           <h1 className="hero-title">
             Manage your restaurant<br/>
             <span className="text-highlight">smarter, together.</span>
           </h1>
           
           <div className="hero-divider"></div>
           
           <p className="hero-subtitle">
             All-in-one solution to manage your inventory,<br/>
             staff, orders, suppliers, expenses and more.<br/>
             Built for efficiency. Designed for growth.
           </p>

           <div className="feature-grid">
             <div className="feature-card">
               <BarChart2 className="feature-icon" />
               <span>Analytics &<br/>Reports</span>
             </div>
             <div className="feature-card">
               <Package className="feature-icon" />
               <span>Inventory<br/>Management</span>
             </div>
             <div className="feature-card">
               <Users className="feature-icon" />
               <span>Staff<br/>Management</span>
             </div>
             <div className="feature-card">
               <FileText className="feature-icon" />
               <span>AI Invoice<br/>Processing</span>
             </div>
           </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          
          <div className="user-avatar-wrapper">
            <div className="user-avatar">
              <User size={32} color="#6366f1" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="login-title">{displayRole} Portal</h2>
          <p className="login-subtitle">Sign in to manage operations</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  required 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Enter your password" 
                  required 
                  onChange={handleChange} 
                />
                <button 
                  type="button" 
                  className="icon-btn right" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeOff size={18} color="#94a3b8" />
                </button>
              </div>
            </div>

            <div className="form-actions">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn-signin" disabled={isLoading}>
               Sign In
            </button>
          </form>

          <div className="divider"><span>or</span></div>
          
          {isOwnerRootLogin && (
            <div style={{textAlign: 'center', fontSize: '0.9rem', fontWeight: '500'}}>
               Don't have an account? <Link to="/register" style={{color: '#6366f1', textDecoration: 'none'}}>Register Here</Link>
            </div>
          )}
          
          <div className="login-footer">
            © 2024 Aarunya. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
