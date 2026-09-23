import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Sparkles, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import SkillCard from '../../components/SkillCard/SkillCard';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
import './Explore.css';

export const Explore = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [wantedSkill, setWantedSkill] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const res = await API.get('/users', { params });
      let list = res.data?.data || res.data?.users || [];

      // Filter out self if logged in
      if (currentUser && currentUser._id) {
        list = list.filter((u) => u._id !== currentUser._id);
      }
      setUsers(list);
    } catch (err) {
      console.error('Failed to load explore users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentUser]);

  const handleOpenSwapModal = (targetUser) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedUser(targetUser);
    // Pre-populate wanted skill with the first skill the target user offers
    const defaultWanted = targetUser.skillsOffered?.[0]?.name || (typeof targetUser.skillsOffered?.[0] === 'string' ? targetUser.skillsOffered[0] : '');
    setWantedSkill(defaultWanted);

    // Pre-populate offered skill with first skill the current user offers
    const defaultOffered = currentUser?.skillsOffered?.[0]?.name || (typeof currentUser?.skillsOffered?.[0] === 'string' ? currentUser?.skillsOffered[0] : '');
    setOfferedSkill(defaultOffered);

    setSwapMessage('');
    setIsModalOpen(true);
    setErrorMessage('');
  };

  const handleCloseSwapModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSwapMessage('');
    setOfferedSkill('');
    setWantedSkill('');
    setErrorMessage('');
  };

  const handleSendSwap = async (e) => {
    e.preventDefault();
    if (!offeredSkill.trim() || !wantedSkill.trim()) {
      setErrorMessage('Please specify both the skill you will teach and the skill you want to learn.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await API.post('/swaps', {
        recipientId: selectedUser._id,
        offeredSkill: offeredSkill.trim(),
        wantedSkill: wantedSkill.trim(),
        message: swapMessage.trim()
      });

      handleCloseSwapModal();
      setToastMessage(`Swap proposal successfully dispatched to ${selectedUser.name}!`);
      setTimeout(() => setToastMessage(''), 4500);
    } catch (err) {
      console.error('Failed to send swap request', err);
      setErrorMessage(err.response?.data?.message || 'Could not send swap proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="explore-page">
      <AnnouncementBanner />

      <div className="container explore-content">
        {/* Explore Header */}
        <div className="explore-header">
          <div className="explore-pill">
            <Sparkles size={14} /> Peer Knowledge Directory
          </div>
          <h1 className="explore-title">
            Explore <span className="text-gradient">Public Skill Swappers</span>
          </h1>
          <p className="explore-subtitle">
            Discover passionate creators, engineers, and teachers ready to trade knowledge with you.
          </p>

          {/* Search Bar */}
          <div className="search-bar-wrapper card-glass">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by skill (e.g. React, Spanish, Guitar), name, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="explore-toast card-glass">
            <CheckCircle size={20} className="text-success" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Directory Grid */}
        <div className="users-grid responsive-grid">
          {loading ? (
            <div className="explore-loading-state">
              <div className="spinner"></div>
              <p>Discovering available mentors and partners...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <SkillCard key={user._id} user={user} onRequestSwap={handleOpenSwapModal} />
            ))
          ) : (
            <div className="empty-results-box card-glass">
              <Filter size={36} className="empty-icon" />
              <h3>No matching members found</h3>
              <p>Try searching for a different skill or clear the search keywords.</p>
            </div>
          )}
        </div>

        {/* Swap Request Dialog */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseSwapModal}
          title={`Propose Knowledge Barter with ${selectedUser?.name}`}
        >
          <form onSubmit={handleSendSwap} className="swap-request-form">
            {errorMessage && (
              <div className="modal-error-banner">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Skill You Will Teach (Offered)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. JavaScript basics, Piano fingerpicking"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skill You Want to Learn (From {selectedUser?.name})</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. UI/UX Design, Spanish conversation"
                value={wantedSkill}
                onChange={(e) => setWantedSkill(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Note & Schedule Preferences</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe your learning goals, experience level, and preferred swap times..."
                value={swapMessage}
                onChange={(e) => setSwapMessage(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <Button variant="outline" size="md" type="button" onClick={handleCloseSwapModal}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" disabled={submitting}>
                {submitting ? 'Sending Proposal...' : 'Send Swap Proposal'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Explore;
