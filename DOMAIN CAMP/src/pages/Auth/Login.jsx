import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, Lock, User, ShieldAlert } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username or email');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    setError('');
    setLoading(true);

    // Simulate login API call with 1s delay
    setTimeout(async () => {
      const result = await login(username, password);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }
    }, 1000);
  };

  const handleQuickSelect = (selUser) => {
    setUsername(selUser);
    setPassword('password123');
  };

  return (
    <div className="login-container flex-center">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="logo-badge flex-center">
            <Film size={28} className="logo-icon" />
          </div>
          <h1>CineVerse</h1>
          <p className="subtitle">Enter the cinematic universe</p>
        </div>

        {error && (
          <div className="error-banner flex">
            <ShieldAlert size={20} className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>



          <button type="submit" className="btn-primary login-btn flex-center" disabled={loading}>
            {loading ? (
              <span className="spinner-small"></span>
            ) : (
              'Sign In with JWT'
            )}
          </button>
        </form>

        <div className="quick-access">
          <p className="quick-access-title">Quick Role Simulation Logins:</p>
          <div className="quick-buttons">
            <button 
              onClick={() => handleQuickSelect('aarav_cinema')}
              className="quick-btn user-badge"
              type="button"
              disabled={loading}
            >
              Aarav (User)
            </button>
            <button 
              onClick={() => handleQuickSelect('raj_multiplex')}
              className="quick-btn owner-badge"
              type="button"
              disabled={loading}
            >
              Raj Multiplex (Owner)
            </button>
            <button 
              onClick={() => handleQuickSelect('devendra_admin')}
              className="quick-btn admin-badge"
              type="button"
              disabled={loading}
            >
              Devendra Admin (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
