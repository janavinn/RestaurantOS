import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      alert('Password reset successful! Please login with your new password.');
      navigate('/aarunya/owner/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-layout">
      {/* Left Hero Section (Reused from Login for consistency) */}
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
             Secure your<br/>
             <span className="text-highlight">workspace.</span>
           </h1>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <h2 className="login-title">Reset Password</h2>
          <p className="login-subtitle">Please enter your new password below.</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fee2e2' }}>{error}</div>}
            
            <div className="input-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  placeholder="Enter new password" 
                  required 
                  onChange={(e) => setPassword(e.target.value)} 
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
            
            <div className="input-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  placeholder="Confirm new password" 
                  required 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              </div>
            </div>

            <button type="submit" className="btn-signin" disabled={isLoading} style={{ marginTop: '1rem' }}>
               {isLoading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>

          <div className="login-footer" style={{ marginTop: '3rem' }}>
            © 2024 Aarunya. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
