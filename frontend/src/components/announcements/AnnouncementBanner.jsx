import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Badge from '../Badge/Badge';
import { Megaphone, X, ChevronRight, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './AnnouncementBanner.css';

export const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await API.get('/announcements');
        const list = res.data?.data || res.data?.announcements || [];
        setAnnouncements(list);
      } catch (err) {
        // Silent fail for non-blocking banner
        console.warn('Could not load announcements for banner', err);
      }
    };
    fetchAnnouncements();
  }, []);

  if (dismissed || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex];

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'important': return <AlertCircle size={16} className="text-danger" />;
      case 'warning': return <AlertTriangle size={16} className="text-warning" />;
      default: return <Info size={16} className="text-primary" />;
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'important': return 'danger';
      case 'warning': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className={`announcement-banner-wrapper priority-${current.priority || 'info'}`}>
      <div className="container announcement-banner-container">
        <div className="banner-left">
          <div className="banner-icon-box">
            {getPriorityIcon(current.priority)}
          </div>
          <Badge variant={getPriorityBadgeVariant(current.priority)}>
            {current.priority === 'important' ? 'Notice' : (current.priority === 'warning' ? 'Alert' : 'Update')}
          </Badge>
          <div className="banner-text-block">
            <strong className="banner-title">{current.title}</strong>
            <span className="banner-message">{current.message || current.content}</span>
          </div>
        </div>

        <div className="banner-right">
          {announcements.length > 1 && (
            <div className="banner-counter">
              <span>{currentIndex + 1} of {announcements.length}</span>
              <button
                className="banner-next-btn"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
                title="Next Announcement"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
          <button
            className="banner-dismiss-btn"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss announcement"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;

