import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Menu, X, User, ArrowRightLeft, ShieldCheck, LogOut } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" size={20} />
          </div>
          <span className="brand-name">
            Skill<span className="brand-highlight">Swap</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Explore Skills
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/swaps" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <ArrowRightLeft size={16} /> My Swaps
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <User size={16} /> Profile
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link admin-link active' : 'nav-link admin-link')}>
              <ShieldCheck size={16} /> Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="navbar-actions desktop-actions">
          {isAuthenticated ? (
            <div className="user-profile-widget">
              <span className="user-greeting">Hi, {user?.name?.split(' ')[0] || 'Member'}</span>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-link">Log In</Link>
              <Link to="/register" className="btn-primary-compact">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <nav className="mobile-nav-links">
              <NavLink to="/" onClick={closeMobileMenu} className="mobile-nav-link">Home</NavLink>
              <NavLink to="/explore" onClick={closeMobileMenu} className="mobile-nav-link">Explore Skills</NavLink>
              {isAuthenticated && (
                <>
                  <NavLink to="/swaps" onClick={closeMobileMenu} className="mobile-nav-link">My Swaps</NavLink>
                  <NavLink to="/profile" onClick={closeMobileMenu} className="mobile-nav-link">My Profile</NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/admin" onClick={closeMobileMenu} className="mobile-nav-link admin-link">
                  Admin Panel
                </NavLink>
              )}
            </nav>

            <div className="mobile-auth-actions">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-mobile-logout">
                  <LogOut size={16} /> Log Out ({user?.name})
                </button>
              ) : (
                <div className="mobile-auth-group">
                  <Link to="/login" onClick={closeMobileMenu} className="btn-mobile-login">Log In</Link>
                  <Link to="/register" onClick={closeMobileMenu} className="btn-primary-compact full-width">Join SkillSwap</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;

