import React, { useState } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import SkillCard from '../../components/SkillCard/SkillCard';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import './Explore.css';

// Initial placeholder mock data for project structure preview
const INITIAL_USERS = [
  {
    _id: 'u1',
    name: 'Alex Rivera',
    bio: 'Senior React & Node.js Developer looking to learn 3D Blender modeling and digital illustration.',
    availability: 'Evenings & Weekends',
    rating: 4.9,
    skillsOffered: [{ name: 'React' }, { name: 'Full-Stack Node.js' }, { name: 'TypeScript' }],
    skillsWanted: [{ name: 'Blender 3D' }, { name: 'Digital Painting' }]
  },
  {
    _id: 'u2',
    name: 'Elena Rostova',
    bio: 'Professional UI/UX Designer with 5+ years experience. Excited to learn Python for data analysis.',
    availability: 'Weekdays (Morning)',
    rating: 5.0,
    skillsOffered: [{ name: 'Figma' }, { name: 'UI/UX Prototyping' }, { name: 'Design Systems' }],
    skillsWanted: [{ name: 'Python' }, { name: 'Data Visualization' }]
  },
  {
    _id: 'u3',
    name: 'Marcus Chen',
    bio: 'Guitar instructor & music producer eager to swap music theory for mobile app development with Flutter.',
    availability: 'Flexible',
    rating: 4.8,
    skillsOffered: [{ name: 'Acoustic Guitar' }, { name: 'Music Production' }, { name: 'Ableton' }],
    skillsWanted: [{ name: 'Flutter' }, { name: 'Mobile App Dev' }]
  }
];

export const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [offeredSkill, setOfferedSkill] = useState('');

  const handleOpenSwapModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSwapMessage('');
    setOfferedSkill('');
  };

  const handleSendSwap = (e) => {
    e.preventDefault();
    alert(`Swap request sent to ${selectedUser.name}! (API will be connected in Step 2)`);
    handleCloseSwapModal();
  };

  const filteredUsers = INITIAL_USERS.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesName = user.name.toLowerCase().includes(term);
    const matchesOffered = user.skillsOffered.some((s) => s.name.toLowerCase().includes(term));
    const matchesWanted = user.skillsWanted.some((s) => s.name.toLowerCase().includes(term));
    return matchesName || matchesOffered || matchesWanted;
  });

  return (
    <div className="container explore-page">
      {/* Explore Header */}
      <div className="explore-header">
        <h1 className="explore-title">
          Explore <span className="text-gradient">Public Skill Swappers</span>
        </h1>
        <p className="explore-subtitle">
          Discover members ready to trade their skills. Find your next study partner or mentor today.
        </p>

        {/* Search & Filter Bar */}
        <div className="search-bar-wrapper card-glass">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by skill (e.g. React, Guitar, Figma) or member name..."
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

      {/* Directory Grid */}
      <div className="users-grid responsive-grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <SkillCard key={user._id} user={user} onRequestSwap={handleOpenSwapModal} />
          ))
        ) : (
          <div className="empty-results-box card-glass">
            <Filter size={36} className="empty-icon" />
            <h3>No matching skills found</h3>
            <p>Try searching for a different skill keyword or clear the search filter.</p>
          </div>
        )}
      </div>

      {/* Swap Request Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseSwapModal}
        title={`Request Skill Swap with ${selectedUser?.name}`}
      >
        <form onSubmit={handleSendSwap} className="swap-request-form">
          <div className="form-group">
            <label className="form-label">Skill You Will Teach</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. JavaScript basics, Piano lessons"
              required
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skill You Want to Learn</label>
            <input
              type="text"
              className="form-input"
              defaultValue={selectedUser?.skillsOffered[0]?.name || ''}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Introduction & Message</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe your learning goals and preferred session schedule..."
              value={swapMessage}
              onChange={(e) => setSwapMessage(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={handleCloseSwapModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Send Swap Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Explore;

