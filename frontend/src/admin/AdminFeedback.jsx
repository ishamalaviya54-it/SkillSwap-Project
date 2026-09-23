import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal/Modal';
import Button from '../components/Button/Button';
import Badge from '../components/Badge/Badge';
import {
  Star,
  Search,
  Trash2,
  RefreshCw,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import './AdminFeedback.css';

export const AdminFeedback = ({ onFeedbackModified }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deletingRating, setDeletingRating] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (ratingFilter !== 'all') params.rating = ratingFilter;

      const res = await API.get('/admin/ratings', { params });
      setRatings(res.data?.data || res.data?.ratings || []);
    } catch (err) {
      console.error('Failed to load ratings for admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchRatings();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, ratingFilter]);

  const handleConfirmDelete = async () => {
    if (!deletingRating) return;
    try {
      setProcessing(true);
      await API.delete(`/admin/ratings/${deletingRating._id}`);
      setDeletingRating(null);
      await fetchRatings();
      if (onFeedbackModified) onFeedbackModified();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete rating');
    } finally {
      setProcessing(false);
    }
  };

  const renderStars = (score) => {
    return (
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= score ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="admin-feedback-container">
      <div className="admin-feedback-header">
        <div>
          <h2 className="admin-section-title">Ratings & Reviews Moderation</h2>
          <p className="admin-section-desc">
            Audit peer feedback logs, evaluate user satisfaction, and remove fraudulent or defamatory ratings.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchRatings}>
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar card-glass">
        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by participant or review comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="all">All Ratings (1 - 5 Stars)</option>
          <option value="5">5 Stars ★★★★★</option>
          <option value="4">4 Stars ★★★★☆</option>
          <option value="3">3 Stars ★★★☆☆</option>
          <option value="2">2 Stars ★★☆☆☆</option>
          <option value="1">1 Star  ★☆☆☆☆</option>
        </select>
      </div>

      {/* Feedback Table */}
      <div className="admin-table-wrapper card-glass">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Loading ratings and reviews...</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="admin-empty-state">
            <Star size={40} className="empty-icon" />
            <p>No ratings or reviews match your filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Author (From)</th>
                  <th>Recipient (To)</th>
                  <th>Score</th>
                  <th>Comment / Feedback</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => {
                  const author = r.fromUser || r.reviewer;
                  const recipient = r.toUser || r.reviewee;
                  const feedbackText = r.feedback || r.comment || '';
                  return (
                    <tr key={r._id}>
                      <td>
                        <div className="user-cell">
                          <span className="user-cell-name">{author?.name || 'Anonymous'}</span>
                          <span className="user-cell-email">{author?.email || ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-cell">
                          <span className="user-cell-name">{recipient?.name || 'Anonymous'}</span>
                          <span className="user-cell-email">{recipient?.email || ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rating-score-cell">
                          {renderStars(r.rating)}
                          <span className="score-num">{r.rating}.0</span>
                        </div>
                      </td>
                      <td>
                        <p className="feedback-text-preview">
                          {feedbackText || <em className="text-subtle">No written comment</em>}
                        </p>
                      </td>
                      <td className="text-muted">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            onClick={() => setDeletingRating(r)}
                            className="btn-action btn-delete"
                            title="Remove Inappropriate Review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingRating}
        onClose={() => setDeletingRating(null)}
        title="Remove Review"
      >
        <div className="confirmation-modal-content">
          <AlertTriangle size={36} className="modal-alert-icon" />
          <p>
            Are you sure you want to permanently remove this review? This will recalculate the recipient's average score.
          </p>
          <div className="modal-actions">
            <Button variant="outline" size="md" onClick={() => setDeletingRating(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDelete} disabled={processing}>
              {processing ? 'Removing...' : 'Delete Review'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminFeedback;

