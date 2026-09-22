import React, { useState } from 'react';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import {
  ShieldAlert,
  Users,
  ArrowRightLeft,
  Star,
  Download,
  Megaphone,
  UserX,
  UserCheck,
  Edit3,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 142,
    activeSwaps: 38,
    pendingSwaps: 19,
    cancelledSwaps: 5,
    flaggedSkills: 2
  });

  const [users, setUsers] = useState([
    { _id: 'u101', name: 'Alex Rivera', email: 'alex@example.com', role: 'user', isBanned: false, reports: 0 },
    { _id: 'u102', name: 'Suspicious Bot', email: 'bot99@spam.net', role: 'user', isBanned: true, reports: 4 },
    { _id: 'u103', name: 'Elena Rostova', email: 'elena@example.com', role: 'user', isBanned: false, reports: 0 }
  ]);

  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  const handleToggleBan = (userId) => {
    setUsers(
      users.map((u) => (u._id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
  };

  const handleModerateSkill = (userName, skillName) => {
    const reason = prompt(`Reason for moderating/replacing description for "${skillName}" by ${userName}:`);
    if (reason) {
      alert(`Skill description flagged and moderated. Reason: ${reason}`);
    }
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle || !announcementText) return;
    setAnnouncementSent(true);
    setTimeout(() => {
      setAnnouncementTitle('');
      setAnnouncementText('');
      setAnnouncementSent(false);
    }, 3000);
  };

  const handleDownloadReport = () => {
    const reportData = {
      title: 'SkillSwap Platform Activity Report',
      timestamp: new Date().toISOString(),
      stats,
      userCount: users.length
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillSwap_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-pill">
            <ShieldAlert size={14} /> Admin Moderation Console
          </div>
          <h1 className="admin-title">Platform Operations & Moderation</h1>
          <p className="admin-subtitle">
            Monitor swap velocity, enforce safety policies, broadcast announcements, and generate compliance reports.
          </p>
        </div>

        <Button variant="primary" size="md" icon={Download} onClick={handleDownloadReport}>
          Download Platform Report
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-kpi-grid">
        <div className="card-glass kpi-card">
          <div className="kpi-icon-box kpi-blue">
            <Users size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{stats.totalUsers}</span>
            <span className="kpi-label">Registered Members</span>
          </div>
        </div>

        <div className="card-glass kpi-card">
          <div className="kpi-icon-box kpi-green">
            <ArrowRightLeft size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{stats.activeSwaps}</span>
            <span className="kpi-label">Active Swaps</span>
          </div>
        </div>

        <div className="card-glass kpi-card">
          <div className="kpi-icon-box kpi-yellow">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{stats.pendingSwaps}</span>
            <span className="kpi-label">Pending Requests</span>
          </div>
        </div>

        <div className="card-glass kpi-card">
          <div className="kpi-icon-box kpi-red">
            <ShieldAlert size={20} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{stats.flaggedSkills}</span>
            <span className="kpi-label">Flagged Descriptions</span>
          </div>
        </div>
      </div>

      {/* Main Admin Columns */}
      <div className="admin-layout-grid">
        {/* Left Column: User Management & Moderation */}
        <div className="admin-column">
          <div className="card-glass admin-card">
            <div className="admin-card-header">
              <h2>User Moderation & Ban Control</h2>
              <Badge variant="neutral">{users.length} Users</Badge>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="table-user-cell">
                          <span className="table-user-name">{u.name}</span>
                          <span className="table-user-email">{u.email}</span>
                        </div>
                      </td>
                      <td>
                        {u.isBanned ? (
                          <Badge variant="danger" size="sm">Banned</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Active</Badge>
                        )}
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            type="button"
                            className={`btn-table-action ${u.isBanned ? 'btn-unban' : 'btn-ban'}`}
                            onClick={() => handleToggleBan(u._id)}
                          >
                            {u.isBanned ? <UserCheck size={14} /> : <UserX size={14} />}
                            <span>{u.isBanned ? 'Unban' : 'Ban'}</span>
                          </button>
                          <button
                            type="button"
                            className="btn-table-action btn-mod"
                            onClick={() => handleModerateSkill(u.name, 'Sample Skill')}
                            title="Moderate Skill Description"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Announcements */}
        <div className="admin-column">
          <div className="card-glass admin-card">
            <div className="admin-card-header">
              <h2>
                <Megaphone size={18} className="icon-megaphone" /> Platform Announcement
              </h2>
            </div>
            <p className="section-desc">
              Broadcast a system-wide notice or safety warning to all SkillSwap members.
            </p>

            <form onSubmit={handleSendAnnouncement} className="announcement-form">
              <div className="form-group">
                <label className="form-label">Announcement Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Scheduled Maintenance or New Skill Rules"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Write clear instructions for the community..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  required
                />
              </div>

              {announcementSent && (
                <div className="announcement-success">
                  <CheckCircle size={16} /> Broadcast sent to all active users!
                </div>
              )}

              <Button variant="primary" type="submit" icon={Megaphone}>
                Publish Announcement
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;

