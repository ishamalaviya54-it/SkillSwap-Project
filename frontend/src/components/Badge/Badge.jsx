import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'primary', // primary, secondary, success, warning, danger, neutral
  size = 'md', // sm, md
  className = ''
}) => {
  return (
    <span className={`badge-pill badge-${variant} badge-size-${size} ${className}`}>
      {children}
    </span>
  );
};
export default Badge;

