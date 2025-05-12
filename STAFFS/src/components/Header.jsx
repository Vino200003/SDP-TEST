import React from 'react';
import '../../styles/Header.css';
import Logo from './Logo';

const Header = ({ title, staffName = 'Staff Name', staffRole = 'Staff', onLogout }) => {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if no onLogout function is provided
      window.location.href = '/';
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <Logo />
      </div>
      <h1 className="header-title">{title}</h1>
      <div className="header-right">
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">{staffName}</span>
            <span className="user-role">{staffRole}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;