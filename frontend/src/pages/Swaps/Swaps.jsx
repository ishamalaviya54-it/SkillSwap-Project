import React, { useState } from 'react';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Modal from '../../components/Modal/Modal';
import { ArrowRightLeft, Check, X, Ban, Star, MessageSquare } from 'lucide-react';
import './Swaps.css';

const MOCK_SWAPS = [
  {
    _id: 'swap1',
    type: 'incoming',
    peerName: 'Elena Rostova',
    offeredSkill: 'UI/UX Design with Figma',
    wantedSkill: 'Full-Stack Node.js',
    status: 'pending',
    message: 'Hey Jane, I saw your Node.js experience and would love to trade prototyping tips for backend API concepts!',
    date: '2 hours ago'
  },
  {
    _id: 'swap2',
    type: 'outgoing',
    peerName: 'Marcus Chen',
    offeredSkill: 'React State Management',
    wantedSkill: 'Acoustic Guitar Lessons',
    status: 'pending',
    message: 'Looking forward to learning fingerpicking patterns in exchange for React guidance.',
    date: '1 day ago'
  },
  {
    _id: 'swap3',
    type: 'active',
    peerName: 'Alex Rivera',
    offeredSkill: 'Modern JavaScript',
    wantedSkill: 'Blender 3D Modeling',
    status: 'accepted',
    message: 'Swap agreed! Scheduled for Saturday 3:00 PM.',
    date: '3 days ago'
  },
  {
    _id: 'swap4',
    type: 'completed',
    peerName: 'Sarah Connor',
    offeredSkill: 'Python Basics',
    wantedSkill: 'Public Speaking Coaching',
    status: 'completed',
    message: 'Great 3-week exchange session!',
    date: '1 week ago',
    feedbackGiven: false
  }
];

export const Swaps = () => {
  const [swaps, setSwaps] = useState(MOCK_SWAPS);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, active, completed
  const [feedbackModalSwap, setFeedbackModalSwap] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const handleAccept = (swapId) => {
    setSwaps(swaps.map((s) => (s._id === swapId ? { ...s, status: 'accepted' } : s)));
  };

  const handleReject = (swapId) => {
    setSwaps(swaps.map((s) => (s._id === swapId ? { ...s, status: 'rejected' } : s)));
  };

  const handleCancelPending = (swapId) => {
    setSwaps(swaps.map((s) => (s._id === swapId ? { ...s, status: 'cancelled' } : s)));
  };

  const handleOpenFeedback = (swap) => {
    setFeedbackModalSwap(swap);
    setRating(5);
    setFeedbackComment('');
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    setSwaps(
      swaps.map((s) =>
        s._id === feedbackModalSwap._id ? { ...s, feedbackGiven: true } : s
      )
    );
    alert('Thank you! Your rating and feedback have been submitted.');
    setFeedbackModalSwap(null);
  };

  const filteredSwaps = swaps.filter((s) => {
    if (activeTab === 'pending') return s.status === 'pending';
    if (activeTab === 'active') return s.status === 'accepted';
    if (activeTab === 'completed') return s.status === 'completed';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Active / In Progress</Badge>;
      case 'completed':
        return <Badge variant="primary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      case 'rejected':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="container swaps-page">
      <div className="swaps-header">
        <h1 className="swaps-title">
          My <span className="text-gradient">Skill Swaps</span>
        </h1>
        <p className="swaps-subtitle">
          Track incoming requests, accepted swaps, and submit feedback after finishing sessions.
        </p>

        {/* Tab Filter */}
        <div className="swaps-tab-bar">
          <button
            className={`swap-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Swaps ({swaps.length})
          </button>
          <button
            className={`swap-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({swaps.filter((s) => s.status === 'pending').length})
          </button>
          <button
            className={`swap-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({swaps.filter((s) => s.status === 'accepted').length})
          </button>
          <button
            className={`swap-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({swaps.filter((s) => s.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Swaps List */}
      <div className="swaps-list">
        {filteredSwaps.length > 0 ? (
          filteredSwaps.map((swap) => (
            <div key={swap._id} className="swap-row-card card-glass">
              <div className="swap-main-info">
                <div className="swap-partner-header">
                  <h3>{swap.peerName}</h3>
                  <span className="swap-date">{swap.date}</span>
                  {getStatusBadge(swap.status)}
                </div>

                <div className="swap-skill-exchange-strip">
                  <div className="exchange-tag-group">
                    <span className="exchange-label">Giving:</span>
                    <span className="skill-highlight text-indigo">{swap.offeredSkill}</span>
                  </div>
                  <ArrowRightLeft size={16} className="exchange-arrow" />
                  <div className="exchange-tag-group">
                    <span className="exchange-label">Receiving:</span>
                    <span className="skill-highlight text-cyan">{swap.wantedSkill}</span>
                  </div>
                </div>

                <p className="swap-message-preview">
                  <MessageSquare size={14} className="message-icon" /> "{swap.message}"
                </p>
              </div>

              {/* Actions Based on State */}
              <div className="swap-action-buttons">
                {swap.status === 'pending' && swap.type === 'incoming' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Check}
                      onClick={() => handleAccept(swap._id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={X}
                      onClick={() => handleReject(swap._id)}
                    >
                      Decline
                    </Button>
                  </>
                )}

                {swap.status === 'pending' && swap.type === 'outgoing' && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Ban}
                    onClick={() => handleCancelPending(swap._id)}
                  >
                    Cancel Request
                  </Button>
                )}

                {swap.status === 'accepted' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSwaps(
                        swaps.map((s) =>
                          s._id === swap._id ? { ...s, status: 'completed' } : s
                        )
                      )
                    }
                  >
                    Mark as Completed
                  </Button>
                )}

                {swap.status === 'completed' && !swap.feedbackGiven && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Star}
                    onClick={() => handleOpenFeedback(swap)}
                  >
                    Leave Rating & Review
                  </Button>
                )}

                {swap.status === 'completed' && swap.feedbackGiven && (
                  <span className="feedback-done-notice">
                    <Check size={14} /> Review Submitted
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-swaps-state card-glass">
            <ArrowRightLeft size={36} className="empty-icon" />
            <h3>No swaps in this filter</h3>
            <p>Explore public profiles to find mentors and initiate new swaps.</p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={!!feedbackModalSwap}
        onClose={() => setFeedbackModalSwap(null)}
        title={`Review Swap with ${feedbackModalSwap?.peerName}`}
      >
        <form onSubmit={handleSubmitFeedback} className="feedback-form">
          <div className="form-group">
            <label className="form-label">Rating (1 to 5 Stars)</label>
            <div className="star-rating-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={24}
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    color={star <= rating ? '#f59e0b' : '#6b7280'}
                  />
                </button>
              ))}
              <span className="rating-text-val">{rating} of 5 Stars</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Comment</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="How was your swap? Share feedback on punctuality, knowledge, and communication..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setFeedbackModalSwap(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Swaps;

