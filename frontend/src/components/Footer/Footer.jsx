import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="container footer-content">
        <div className="footer-brand-column">
          <div className="footer-brand">
            <Sparkles className="footer-icon" size={18} />
            <span>SkillSwap</span>
          </div>
          <p className="footer-tagline">
            Empowering peer-to-peer knowledge exchange. Learn, teach, and level up together without borders.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-nav-col">
            <h4>Platform</h4>
            <a href="/explore">Browse Skills</a>
            <a href="/swaps">My Swaps</a>
            <a href="/register">Join Community</a>
          </div>
          <div className="footer-nav-col">
            <h4>Categories</h4>
            <span>Coding & Tech</span>
            <span>Design & UI/UX</span>
            <span>Languages</span>
            <span>Music & Audio</span>
          </div>
          <div className="footer-nav-col">
            <h4>Trust & Safety</h4>
            <span>Community Guidelines</span>
            <span>Moderation Policies</span>
            <span>Privacy & Terms</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container bottom-bar-inner">
          <p>© {new Date().getFullYear()} SkillSwap Platform. Built for high-impact collaborative learning.</p>
          <span className="build-badge">
            <Heart size={14} className="heart-icon" /> Hackathon Edition
          </span>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

