import React from 'react';
import {
  Users,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Star,
  Activity,
  Megaphone,
  UserCheck
} from 'lucide-react';
import './AdminStats.css';

export const AdminStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="spinner"></div>
        <p>Loading platform operational metrics...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'blue',
      subtitle: `${stats?.bannedUsers ?? 0} banned, ${(stats?.totalUsers ?? 0) - (stats?.bannedUsers ?? 0)} active`
    },
    {
      title: 'Total Skills',
      value: stats?.totalSkills ?? 0,
      icon: Sparkles,
      color: 'purple',
      subtitle: 'Barter catalog entries'
    },
    {
      title: 'Pending Swaps',
      value: stats?.pendingSwaps ?? 0,
      icon: Clock,
      color: 'amber',
      subtitle: 'Awaiting peer confirmation'
    },
    {
      title: 'Accepted Swaps',
      value: stats?.acceptedSwaps ?? 0,
      icon: CheckCircle,
      color: 'green',
      subtitle: 'In-progress knowledge exchanges'
    },
    {
      title: 'Rejected Swaps',
      value: stats?.rejectedSwaps ?? 0,
      icon: XCircle,
      color: 'rose',
      subtitle: 'Declined barter proposals'
    },
    {
      title: 'Cancelled Swaps',
      value: stats?.cancelledSwaps ?? 0,
      icon: Ban,
      color: 'gray',
      subtitle: 'Withdrawn by requester'
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating ? `${stats.averageRating} / 5.0` : '5.0 / 5.0',
      icon: Star,
      color: 'yellow',
      subtitle: `${stats?.totalFeedback ?? 0} reviews submitted`
    },
    {
      title: 'Announcements',
      value: stats?.totalAnnouncements ?? 0,
      icon: Megaphone,
      color: 'cyan',
      subtitle: 'Platform broadcasts'
    }
  ];

  return (
    <div className="admin-stats-container">
      <div className="admin-stats-header">
        <div>
          <h2 className="admin-section-title">Platform Performance Metrics</h2>
          <p className="admin-section-desc">
            Real-time telemetry on user adoption, swap throughput, and satisfaction ratings.
          </p>
        </div>
      </div>

      <div className="admin-kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="admin-kpi-card card-glass">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">{kpi.title}</span>
                <div className={`admin-kpi-icon-box ${kpi.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="admin-kpi-value">{kpi.value}</div>
              <p className="admin-kpi-subtitle">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Operational Highlights Banner */}
      <div className="admin-insights-card card-glass">
        <div className="admin-insights-header">
          <Activity size={20} className="text-primary" />
          <h3 className="admin-insights-title">Platform Velocity Summary</h3>
        </div>
        <div className="admin-insights-body">
          <div className="insights-item">
            <UserCheck size={18} className="text-success" />
            <div>
              <strong>User Base Health:</strong>
              <p>{stats?.totalUsers ? `${Math.round((((stats.totalUsers - (stats.bannedUsers || 0)) / stats.totalUsers) * 100))}% of registered accounts are active.` : 'Platform is ready for members.'}</p>
            </div>
          </div>
          <div className="insights-item">
            <CheckCircle size={18} className="text-secondary" />
            <div>
              <strong>Exchange Completion:</strong>
              <p>{stats?.completedSwaps ?? 0} exchanges fully finalized, with {stats?.pendingSwaps ?? 0} currently negotiating.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;

