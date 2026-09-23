import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Sparkles,
  Menu,
  X,
  User,
  ArrowRightLeft,
  ShieldCheck,
  LogOut,
  Bell,
  Check,
  Megaphone,
  Star
} from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get('/notifications');
      const list = res.data?.data || [];
      setNotifications(list);
      setUnreadCount(res.data?.unreadCount || list.filter((n) => !n.isRead).length);
    } catch (err) {
      console.warn('Could not load notifications', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'announcement': return <Megaphone size={14} className="text-secondary" />;
      case 'swap_request':
      case 'swap_update': return <ArrowRightLeft size={14} className="text-primary" />;
      case 'rating': return <Star size={14} className="text-warning" />;
      default: return <Bell size={14} className="text-primary" />;
    }
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

        {/* Desktop Auth & Notifications Controls */}
        <div className="navbar-actions desktop-actions">
          {isAuthenticated ? (
            <div className="user-profile-widget">
              {/* Notification Bell Dropdown */}
              <div className="notifications-dropdown-container" ref={notifRef}>
                <button
                  className="btn-notification-bell"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label="View notifications"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="unread-badge-dot">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="notifications-dropdown-menu card-glass">
                    <div className="notif-dropdown-header">
                      <span className="notif-header-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="btn-mark-all-read">
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="notif-dropdown-body">
                      {notifications.length === 0 ? (
                        <div className="notif-empty-state">
                          <Bell size={24} className="text-subtle" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n._id}
                            className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                            onClick={() => {
                              if (!n.isRead) handleMarkAsRead(n._id, { stopPropagation: () => {} });
                            }}
                          >
                            <div className="notif-icon-box">
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="notif-content-block">
                              <p className="notif-message">{n.message}</p>
                              <span className="notif-time">
                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            {!n.isRead && (
                              <button
                                className="btn-notif-mark"
                                onClick={(e) => handleMarkAsRead(n._id, e)}
                                title="Mark read"
                              >
                                <Check size={12} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
