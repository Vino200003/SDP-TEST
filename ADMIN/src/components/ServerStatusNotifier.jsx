import React, { useState, useEffect } from 'react';
import '../styles/ServerStatusNotifier.css';

const ServerStatusNotifier = ({ isServerDown, onRetryConnection, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Only show notification if it's not disabled and server is down
    if (isServerDown && !disabled) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isServerDown, disabled]);

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`server-status-notifier ${isMinimized ? 'minimized' : ''}`}>
      {isMinimized ? (
        <div className="minimized-content" onClick={handleExpand}>
          <span className="server-status-icon error">⚠️</span>
          <span>Server Offline</span>
        </div>
      ) : (
        <div className="full-content">
          <div className="notifier-header">
            <div className="status-indicator">
              <span className="server-status-icon error">⚠️</span>
              <h3>Server Connection Issue</h3>
            </div>
            <div className="notifier-actions">
              <button className="minimize-btn" onClick={handleMinimize}>_</button>
              <button className="dismiss-btn" onClick={handleDismiss}>×</button>
            </div>
          </div>
          <div className="notifier-body">
            <p>The application is currently running with mock data because the server is unavailable.</p>
            <p className="technical-info">Error: Unable to connect to http://localhost:5000</p>
            <div className="action-buttons">
              <button className="retry-btn" onClick={onRetryConnection}>
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerStatusNotifier;
