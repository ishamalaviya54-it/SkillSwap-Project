import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/explore');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@skillswap.com');
      setPassword('Admin@123456');
    } else {
      setEmail('alex@example.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="auth-page">
      <div className="card-glass auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={20} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to manage your swaps and connect with peers.</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button variant="primary" size="lg" type="submit" disabled={isSubmitting} icon={LogIn}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Fast Login Helpers */}
        <div className="demo-credentials-helper">
          <span className="demo-hint-title">Quick Demo Autofill:</span>
          <div className="demo-buttons">
            <button type="button" onClick={() => handleFillDemo('user')} className="demo-badge-btn">
              Sample User
            </button>
            <button type="button" onClick={() => handleFillDemo('admin')} className="demo-badge-btn admin-demo">
              Admin Demo
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span>Don't have an account yet?</span>
          <Link to="/register" className="auth-link">Create Account</Link>
        </div>
      </div>
    </div>
  );
};
export default Login;

