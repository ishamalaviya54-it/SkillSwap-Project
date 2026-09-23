import React from 'react';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  ArrowRightLeft,
  Star,
  Megaphone,
  FileSpreadsheet,
  ShieldAlert
} from 'lucide-react';
import './AdminSidebar.css';

export const AdminSidebar = ({ activeTab, setActiveTab, stats }) => {
  const navItems = [
    { id: 'stats', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Accounts', icon: Users, badge: stats?.bannedUsers ? `${stats.bannedUsers} banned` : null },
    { id: 'skills', label: 'Skill Moderation', icon: Sparkles, badge: stats?.totalSkills ? stats.totalSkills : null },
    { id: 'swaps', label: 'Swap Velocity', icon: ArrowRightLeft, badge: stats?.pendingSwaps ? `${stats.pendingSwaps} pend` : null },
    { id: 'feedback', label: 'Ratings & Reviews', icon: Star },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'reports', label: 'Audit Reports', icon: FileSpreadsheet }
  ];

  return (
    <aside className="admin-sidebar card-glass">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-badge">
          <ShieldAlert size={16} />
          <span>Moderator Console</span>
        </div>
        <h2 className="admin-sidebar-title">Admin Controls</h2>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Admin Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="admin-nav-item-content">
                <Icon size={18} className="admin-nav-icon" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

