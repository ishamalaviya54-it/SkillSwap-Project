import React, { useState, useEffect } from 'react';
import API from '../services/api';
import AdminSidebar from './AdminSidebar';
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminSwaps from './AdminSwaps';
import AdminSkills from './AdminSkills';
import AdminFeedback from './AdminFeedback';
import AdminAnnouncements from './AdminAnnouncements';
import AdminReports from './AdminReports';
import { ShieldCheck, Activity, Menu, X } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await API.get('/admin/stats');
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container admin-page-container">
      {/* Top Banner Header */}
      <div className="admin-console-banner card-glass">
        <div className="console-banner-content">
          <div className="console-badge">
            <ShieldCheck size={16} />
            <span>Administrator Access Level</span>
          </div>
          <h1 className="console-title">Platform Administration & Governance</h1>
          <p className="console-subtitle">
            Supervise user trust, arbitrate barter transactions, broadcast community notices, and generate compliance audits.
          </p>
        </div>

        <div className="console-health-pill">
          <Activity size={16} className="pulse-icon text-success" />
          <span>Platform Status: <strong>Operational</strong></span>
        </div>

        {/* Mobile Sidebar Toggle Button */}
        <button
          className="admin-mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle Admin Navigation"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="admin-dashboard-layout">
        <div className={`admin-sidebar-column ${mobileSidebarOpen ? 'mobile-visible' : ''}`}>
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            stats={stats}
          />
        </div>

        <main className="admin-content-column">
          {activeTab === 'stats' && (
            <AdminStats stats={stats} loading={loadingStats} />
          )}

          {activeTab === 'users' && (
            <AdminUsers onUserModified={fetchStats} />
          )}

          {activeTab === 'skills' && (
            <AdminSkills onSkillModified={fetchStats} />
          )}

          {activeTab === 'swaps' && (
            <AdminSwaps />
          )}

          {activeTab === 'feedback' && (
            <AdminFeedback onFeedbackModified={fetchStats} />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncements onAnnouncementModified={fetchStats} />
          )}

          {activeTab === 'reports' && (
            <AdminReports />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

