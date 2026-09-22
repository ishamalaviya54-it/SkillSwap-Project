import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Shield, RefreshCw, Star, Users } from 'lucide-react';
import Button from '../../components/Button/Button';
import './Home.css';

export const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>Next-Gen Knowledge Barter Platform</span>
          </div>

          <h1 className="hero-title">
            Learn Anything by <br />
            <span className="text-gradient">Sharing What You Know</span>
          </h1>

          <p className="hero-subtitle">
            Skip expensive courses. SkillSwap connects passionate learners and mentors across the globe for direct, 1-on-1 collaborative skill exchanges.
          </p>

          <div className="hero-actions">
            <Link to="/explore">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Explore Skills
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>

          {/* Platform Stat Strip */}
          <div className="stats-strip card-glass">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Barter Economy</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Peer Collaboration</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">Verified</span>
              <span className="stat-label">Community Ratings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="features-section container">
        <h2 className="section-title">Why SkillSwap?</h2>
        <p className="section-subtitle">
          Built from the ground up for transparent, secure, and reciprocal growth.
        </p>

        <div className="features-grid">
          <div className="feature-card card-glass">
            <div className="feature-icon-box icon-primary">
              <RefreshCw size={24} />
            </div>
            <h3>Reciprocal Exchange</h3>
            <p>
              Trade web development for Spanish, guitar lessons for UI/UX design. Fair and credit-free.
            </p>
          </div>

          <div className="feature-card card-glass">
            <div className="feature-icon-box icon-secondary">
              <Star size={24} />
            </div>
            <h3>Trust & Feedback Loop</h3>
            <p>
              Transparent ratings and verified reviews keep quality high and every swap accountable.
            </p>
          </div>

          <div className="feature-card card-glass">
            <div className="feature-icon-box icon-accent">
              <Shield size={24} />
            </div>
            <h3>Admin Moderation</h3>
            <p>
              Active community moderation ensures inappropriate skills or bad actors are kept off the platform.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;

