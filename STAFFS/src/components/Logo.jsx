import React from 'react';
import '../../styles/Logo.css';
import logoImage from '../../../ADMIN/src/assets/logo.png';

const Logo = () => {
  return (
    <div className="logo-container">
      <img src={logoImage} alt="Restaurant SDP" className="logo-image" />
      <p className="logo-subtitle">Staff Portal</p>
    </div>
  );
};

export default Logo;