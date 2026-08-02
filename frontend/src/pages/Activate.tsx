import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, EyeOff } from 'lucide-react';

export default function Activate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const role = searchParams.get('role');
  
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Invalid Link</h2>
          <p style={{ marginTop: '16px', marginBottom: '24px' }}>Activation token is missing.</p>
          <button className="btn-primary" onClick={() => navigate('/owner/login')} style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/staff/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin: formData.password }), // Sending as 'pin' instead of 'password'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate account');
      }

      alert('Account activated successfully! You can now log in using your PIN.');
      navigate('/staff/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max length of 4
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData({ ...formData, [e.target.name]: val });
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="auth-card" style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '440px' }}>
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '8px' }}>RestaurantOS</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome! Please set a 4-digit PIN to activate your {role ? <strong style={{color: '#6366f1'}}>{role}</strong> : ''} account.</p>
        </div>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Enter 4-Digit PIN</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="0000" 
                required 
                maxLength={4}
                minLength={4}
                value={formData.password}
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', letterSpacing: '8px', fontSize: '1.25rem', fontFamily: 'monospace' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <EyeOff size={18} color="#94a3b8" />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Confirm 4-Digit PIN</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="0000" 
                required 
                maxLength={4}
                minLength={4}
                value={formData.confirmPassword}
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', letterSpacing: '8px', fontSize: '1.25rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
            {isLoading ? 'Activating...' : 'Activate & Go to POS'}
          </button>
        </form>
      </div>
    </div>
  );
}
