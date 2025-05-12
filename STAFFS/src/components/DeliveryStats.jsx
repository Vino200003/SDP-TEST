import React from 'react';
import '../../styles/DeliveryStats.css';

const DeliveryStats = ({ stats }) => {
  return (
    <div className="stats-container">
      <div className="stat-card total">
        <div className="stat-icon">
          <i className="fas fa-list"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">Total Deliveries</p>
          <h3 className="stat-value">{stats.total}</h3>
        </div>
      </div>
      
      <div className="stat-card pickup">
        <div className="stat-icon">
          <i className="fas fa-shopping-bag"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">Ready for Pickup</p>
          <h3 className="stat-value">{stats.readyForPickup}</h3>
        </div>
      </div>
      
      <div className="stat-card delivery">
        <div className="stat-icon">
          <i className="fas fa-motorcycle"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">Out for Delivery</p>
          <h3 className="stat-value">{stats.outForDelivery}</h3>
        </div>
      </div>
      
      <div className="stat-card completed">
        <div className="stat-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-content">
          <p className="stat-title">Delivered</p>
          <h3 className="stat-value">{stats.delivered}</h3>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStats;
