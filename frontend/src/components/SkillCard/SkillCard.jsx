import React from 'react';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';
import { ArrowRightLeft, Clock, Star, Sparkles } from 'lucide-react';
import './SkillCard.css';

export const SkillCard = ({ user, onRequestSwap }) => {
  const {
    name = 'Anonymous User',
    bio = 'Skill enthusiast ready to exchange knowledge.',
    skillsOffered = [],
    skillsWanted = [],
    availability = 'Flexible',
    rating = 5.0,
    avatar,
    profilePhoto
  } = user || {};

  const displayAvatar = profilePhoto || avatar;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="skill-card card-glass">
      {/* User Header */}
      <div className="skill-card-header">
        <div className="skill-card-avatar-wrapper">
          {displayAvatar ? (
            <img src={displayAvatar} alt={name} className="skill-card-avatar" />
          ) : (
            <div className="skill-card-initials">{initials}</div>
          )}
          <span className="online-status-indicator" title="Active"></span>
        </div>

        <div className="skill-card-user-info">
          <h3 className="skill-card-name">{name}</h3>
          <div className="skill-card-meta">
            <span className="skill-card-availability">
              <Clock size={12} /> {availability}
            </span>
            <span className="skill-card-rating">
              <Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <p className="skill-card-bio">{bio}</p>

      {/* Skills Offered Section */}
      <div className="skill-section">
        <div className="skill-section-title">
          <Sparkles size={14} className="icon-offered" />
          <span>Offers</span>
        </div>
        <div className="skill-tags">
          {skillsOffered.length > 0 ? (
            skillsOffered.map((skill, index) => (
              <Badge key={index} variant="primary" size="sm">
                {skill.name || skill}
              </Badge>
            ))
          ) : (
            <span className="empty-skills-notice">No skills listed yet</span>
          )}
        </div>
      </div>

      {/* Skills Wanted Section */}
      <div className="skill-section">
        <div className="skill-section-title">
          <ArrowRightLeft size={14} className="icon-wanted" />
          <span>Wants to Learn</span>
        </div>
        <div className="skill-tags">
          {skillsWanted.length > 0 ? (
            skillsWanted.map((skill, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {skill.name || skill}
              </Badge>
            ))
          ) : (
            <span className="empty-skills-notice">Open to any skill</span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="skill-card-footer">
        <Button
          variant="primary"
          size="sm"
          className="swap-btn"
          icon={ArrowRightLeft}
          onClick={() => onRequestSwap && onRequestSwap(user)}
        >
          Request Swap
        </Button>
      </div>
    </div>
  );
};
export default SkillCard;

