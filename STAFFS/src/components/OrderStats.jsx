import React from 'react';
import '../../styles/OrderStats.css';

const OrderStats = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-card total">
        <div className="stat-icon">
          <i className="fas fa-clipboard-list"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">Total Orders</p>
          <h3 className="stat-value">{stats.total}</h3>
        </div>
      </div>
      
      <div className="stat-card new">
        <div className="stat-icon">
          <i className="fas fa-bell"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">New Orders</p>
          <h3 className="stat-value">{stats.new}</h3>
        </div>
      </div>
      
      <div className="stat-card preparing">
        <div className="stat-icon">
          <i className="fas fa-fire"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">Preparing</p>
          <h3 className="stat-value">{stats.preparing}</h3>
        </div>
      </div>
      
      <div className="stat-card ready">
        <div className="stat-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">Ready</p>
          <h3 className="stat-value">{stats.ready}</h3>
        </div>
      </div>
    </div>
  );
};

export default OrderStats;
