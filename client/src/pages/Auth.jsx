import { useState } from 'react';
import { API_URL } from '../config';
import { Lock, Mail, User } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { 
          email: formData.email, 
          password: formData.password 
        } : formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      
      // Redirect to feed
      window.location.href = '/';

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 className="logo" style={{ justifyContent: 'center', marginBottom: '10px' }}>MiniGram</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Welcome back! Please login.' : 'Create an account to join.'}
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            borderLeft: '4px solid var(--error)',
            color: 'var(--error)',
            marginBottom: '20px',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  name="username"
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                name="email"
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                name="password"
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Sign up here' : 'Login here'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
