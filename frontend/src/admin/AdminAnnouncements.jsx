import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal/Modal';
import Button from '../components/Button/Button';
import Badge from '../components/Badge/Badge';
import {
  Megaphone,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import './AdminAnnouncements.css';

export const AdminAnnouncements = ({ onAnnouncementModified }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('info');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/announcements');
      setAnnouncements(res.data?.data || res.data?.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      await API.post('/admin/announcements', {
        title: title.trim(),
        message: message.trim(),
        priority
      });

      setTitle('');
      setMessage('');
      setPriority('info');
      setIsCreateOpen(false);
      setSuccessToast('Announcement broadcasted to all active platform members!');
      setTimeout(() => setSuccessToast(''), 4000);

      await fetchAnnouncements();
      if (onAnnouncementModified) onAnnouncementModified();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deletingId) return;
    try {
      await API.delete(`/admin/announcements/${deletingId}`);
      setDeletingId(null);
      await fetchAnnouncements();
      if (onAnnouncementModified) onAnnouncementModified();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'important': return <Badge variant="danger">Important Alert</Badge>;
      case 'warning': return <Badge variant="warning">Maintenance Notice</Badge>;
      default: return <Badge variant="primary">General News</Badge>;
    }
  };

  return (
    <div className="admin-announcements-container">
      <div className="admin-announcements-header">
        <div>
          <h2 className="admin-section-title">Platform-Wide Announcements</h2>
          <p className="admin-section-desc">
            Broadcast platform updates, scheduled downtime notices, and community announcements to all registered users.
          </p>
        </div>
        <div className="announcements-header-actions">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchAnnouncements}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            New Broadcast
          </Button>
        </div>
      </div>

      {successToast && (
        <div className="admin-success-banner">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Announcements List */}
      <div className="announcements-grid">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Loading broadcast announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="admin-empty-state card-glass">
            <Megaphone size={40} className="empty-icon" />
            <p>No active announcements posted yet.</p>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
              Create First Announcement
            </Button>
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="announcement-item-card card-glass">
              <div className="announcement-item-top">
                <div className="announcement-priority-wrapper">
                  {getPriorityBadge(a.priority)}
                </div>
                <button
                  onClick={() => setDeletingId(a._id)}
                  className="btn-action btn-delete"
                  title="Delete Announcement"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <h3 className="announcement-item-title">{a.title}</h3>
              <p className="announcement-item-message">{a.message || a.content}</p>

              <div className="announcement-item-footer">
                <span className="announcement-author">
                  Posted by {a.createdBy?.name || a.author?.name || 'Platform Administrator'}
                </span>
                <span className="announcement-date">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Compose Platform Broadcast"
      >
        <form onSubmit={handleCreateAnnouncement} className="create-announcement-form">
          <div className="broadcast-notification-hint">
            <BellRing size={16} />
            <span>Posting this announcement will immediately alert all active members via their in-app notification center.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Scheduled Platform Upgrade & Barter Tips"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="info">General Info (Blue)</option>
              <option value="warning">System Warning / Maintenance (Amber)</option>
              <option value="important">Critical / Urgent Policy Update (Red)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Provide clear details for platform members..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <Button variant="outline" size="md" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={submitting}>
              {submitting ? 'Broadcasting...' : 'Broadcast to All Users'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Delete Announcement"
      >
        <div className="confirmation-modal-content">
          <AlertCircle size={36} className="modal-alert-icon" />
          <p>Are you sure you want to remove this announcement from the platform?</p>
          <div className="modal-actions">
            <Button variant="outline" size="md" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleDeleteAnnouncement}>
              Delete Announcement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;

