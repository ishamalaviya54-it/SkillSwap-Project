import React from 'react';
import Badge from '../Badge/Badge';
import { Calendar, User } from 'lucide-react';
import './AnnouncementCard.css';

export const AnnouncementCard = ({ announcement }) => {
  if (!announcement) return null;

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'important': return 'danger';
      case 'warning': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className={`announcement-card card-glass priority-${announcement.priority || 'info'}`}>
      <div className="announcement-card-header">
        <Badge variant={getPriorityBadgeVariant(announcement.priority)}>
          {announcement.priority ? announcement.priority.toUpperCase() : 'GENERAL'}
        </Badge>
        <div className="announcement-date-item">
          <Calendar size={13} />
          <span>{announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'Recent'}</span>
        </div>
      </div>

      <h4 className="announcement-card-title">{announcement.title}</h4>
      <p className="announcement-card-content">{announcement.message || announcement.content}</p>

      <div className="announcement-card-author">
        <User size={13} />
        <span>By {announcement.createdBy?.name || announcement.author?.name || 'Administrator'}</span>
      </div>
    </div>
  );
};

export default AnnouncementCard;

