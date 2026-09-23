import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import './LoginForm.css';

export const LoginForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setErrorMessage('');
  };

  return (
    <form className="login-form-wrapper" onSubmit={handleSubmit} noValidate>
      {errorMessage && (
        <div className="auth-error-alert" role="alert">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="login-email">Email Address</label>
        <input
          id="login-email"
          type="email"
          name="email"
          className={`form-input ${errorMessage ? 'is-invalid' : ''}`}
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="login-password">Password</label>
        <div className="password-input-group">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className={`form-input ${errorMessage ? 'is-invalid' : ''}`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="btn-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary auth-submit-btn"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="spinner-icon animate-spin" />
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="auth-form-footer">
        <span>Don't have an account?</span>
        <Link to="/register" className="auth-form-link">
          Sign up
        </Link>
      </div>

      <div className="demo-credentials-box">
        <span className="demo-title">Quick Demo Sign In</span>
        <div className="demo-chips">
          <button
            type="button"
            className="demo-chip"
            onClick={() => fillDemo('krisha@example.com', 'password123')}
          >
            Demo User
          </button>
          <button
            type="button"
            className="demo-chip"
            onClick={() => fillDemo('admin@skillswap.com', 'admin123')}
          >
            Demo Admin
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;

