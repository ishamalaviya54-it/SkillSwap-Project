import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import { User, Plus, Trash2, Eye, EyeOff, Save, Clock, Sparkles, BookOpen } from 'lucide-react';
import './Profile.css';

export const Profile = () => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Jane Doe',
    email: user?.email || 'jane.doe@example.com',
    bio: 'Full-stack software developer interested in swapping tech mentorship for musical instrument training.',
    availability: 'Weekends & Evenings',
    isPublic: true,
    skillsOffered: [
      { name: 'JavaScript', level: 'Expert' },
      { name: 'Node.js Express', level: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Piano & Keyboard', level: 'Beginner' },
      { name: 'French Conversation', level: 'Beginner' }
    ]
  });

  const [newOfferedSkill, setNewOfferedSkill] = useState('');
  const [newWantedSkill, setNewWantedSkill] = useState('');

  const handleAddOfferedSkill = (e) => {
    e.preventDefault();
    if (!newOfferedSkill.trim()) return;
    setProfileData({
      ...profileData,
      skillsOffered: [...profileData.skillsOffered, { name: newOfferedSkill.trim(), level: 'Intermediate' }]
    });
    setNewOfferedSkill('');
  };

  const handleRemoveOfferedSkill = (index) => {
    setProfileData({
      ...profileData,
      skillsOffered: profileData.skillsOffered.filter((_, i) => i !== index)
    });
  };

  const handleAddWantedSkill = (e) => {
    e.preventDefault();
    if (!newWantedSkill.trim()) return;
    setProfileData({
      ...profileData,
      skillsWanted: [...profileData.skillsWanted, { name: newWantedSkill.trim(), level: 'Beginner' }]
    });
    setNewWantedSkill('');
  };

  const handleRemoveWantedSkill = (index) => {
    setProfileData({
      ...profileData,
      skillsWanted: profileData.skillsWanted.filter((_, i) => i !== index)
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert('Profile changes saved successfully! (Backend API will persist in Step 2)');
  };

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <h1 className="profile-title">
          My <span className="text-gradient">Profile Settings</span>
        </h1>
        <p className="profile-subtitle">
          Manage your offered skills, learning wishlist, availability, and public discovery settings.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="profile-form-layout">
        {/* Left Column: Basic Info & Availability */}
        <div className="profile-column">
          <div className="card-glass profile-card">
            <h2 className="card-heading">
              <User size={18} className="heading-icon" /> General Details
            </h2>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={profileData.email} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability Schedule</label>
              <div className="input-with-icon">
                <Clock size={16} className="field-icon" />
                <input
                  type="text"
                  className="form-input with-left-icon"
                  placeholder="e.g. Weekdays after 6pm, Weekends"
                  value={profileData.availability}
                  onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
                />
              </div>
            </div>

            <div className="privacy-toggle-box">
              <div className="privacy-info">
                {profileData.isPublic ? <Eye size={20} className="privacy-icon-public" /> : <EyeOff size={20} className="privacy-icon-private" />}
                <div>
                  <h4>{profileData.isPublic ? 'Public Profile' : 'Private Profile'}</h4>
                  <p>
                    {profileData.isPublic
                      ? 'Your profile is visible in public searches and discovery.'
                      : 'Hidden from public directory. Only direct connections can see your profile.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={`toggle-switch-btn ${profileData.isPublic ? 'active' : ''}`}
                onClick={() => setProfileData({ ...profileData, isPublic: !profileData.isPublic })}
              >
                {profileData.isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Skills Management */}
        <div className="profile-column">
          {/* Skills Offered */}
          <div className="card-glass profile-card">
            <h2 className="card-heading">
              <Sparkles size={18} className="heading-icon text-indigo" /> Skills You Offer
            </h2>
            <p className="section-note">Add skills you can teach or mentor other peers in.</p>

            <div className="skills-interactive-list">
              {profileData.skillsOffered.map((skill, index) => (
                <div key={index} className="skill-item-chip">
                  <Badge variant="primary" size="md">{skill.name}</Badge>
                  <button
                    type="button"
                    className="btn-chip-delete"
                    onClick={() => handleRemoveOfferedSkill(index)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-skill-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add offered skill (e.g. React, Python)"
                value={newOfferedSkill}
                onChange={(e) => setNewOfferedSkill(e.target.value)}
              />
              <Button variant="secondary" size="md" icon={Plus} onClick={handleAddOfferedSkill}>
                Add
              </Button>
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="card-glass profile-card">
            <h2 className="card-heading">
              <BookOpen size={18} className="heading-icon text-cyan" /> Skills You Want to Learn
            </h2>
            <p className="section-note">Add skills or topics you are seeking to learn from others.</p>

            <div className="skills-interactive-list">
              {profileData.skillsWanted.map((skill, index) => (
                <div key={index} className="skill-item-chip">
                  <Badge variant="secondary" size="md">{skill.name}</Badge>
                  <button
                    type="button"
                    className="btn-chip-delete"
                    onClick={() => handleRemoveWantedSkill(index)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-skill-row">
              <input
                type="text"
                className="form-input"
                placeholder="Add desired skill (e.g. Guitar, French)"
                value={newWantedSkill}
                onChange={(e) => setNewWantedSkill(e.target.value)}
              />
              <Button variant="secondary" size="md" icon={Plus} onClick={handleAddWantedSkill}>
                Add
              </Button>
            </div>
          </div>

          <div className="save-actions-wrapper">
            <Button variant="primary" size="lg" icon={Save} type="submit" className="save-full-btn">
              Save Profile Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default Profile;

