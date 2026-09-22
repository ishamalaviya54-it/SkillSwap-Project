import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { Compass, Home } from 'lucide-react';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="not-found-page container">
      <div className="card-glass not-found-card">
        <Compass size={64} className="not-found-icon" />
        <h1 className="not-found-title">404</h1>
        <h2>Page Not Found</h2>
        <p>The page or skill swap you are looking for does not exist or has been moved.</p>
        <Link to="/">
          <Button variant="primary" icon={Home}>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};
export default NotFound;

