import React from 'react';
import '../../styles/Header.css';
import Logo from './Logo';

const Header = ({ title, staffName = 'Staff Name', staffRole = 'Staff', onLogout, onProfileClick }) => {
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
          <div className="header-actions">
            {onProfileClick && (
              <button className="profile-button" onClick={onProfileClick}>
                <i className="fas fa-user-circle"></i>
                <span>Profile</span>
              </button>
            )}
            <button className="logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;