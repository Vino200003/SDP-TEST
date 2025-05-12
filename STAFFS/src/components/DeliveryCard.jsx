import React from 'react';
import '../../styles/DeliveryCard.css';

const DeliveryCard = ({ delivery, updateStatus, statusOptions, onSelect, isSelected }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getBadgeClass = (status) => {
    switch(status) {
      case 'Ready for Pickup': return 'badge-pickup';
      case 'Out for Delivery': return 'badge-delivery';
      case 'Delivered': return 'badge-delivered';
      default: return '';
    }
  };
  
  return (
    <div 
      className={`delivery-card ${isSelected ? 'selected' : ''}`} 
      onClick={onSelect}
    >
      <div className="card-header">
        <div className="order-id">{delivery.orderId}</div>
        <span className={`status-badge ${getBadgeClass(delivery.status)}`}>
          {delivery.status}
        </span>
      </div>
      
      <div className="customer-info">
        <h4>{delivery.customer.name}</h4>
        <p className="address">
          <i className="fas fa-map-marker-alt"></i> {delivery.customer.address}
        </p>
        <p className="phone">
          <i className="fas fa-phone"></i> {delivery.customer.phone}
        </p>
      </div>
      
      <div className="order-details">
        <div className="order-items-count">
          <i className="fas fa-shopping-bag"></i>
          <span>{delivery.items.reduce((total, item) => total + item.quantity, 0)} items</span>
        </div>
        <div className="time-amount">
          <div>
            <i className="fas fa-clock"></i> {formatTime(delivery.timestamp)}
          </div>
          <div className="amount">
            {delivery.totalAmount}
          </div>
        </div>
      </div>
      
      <div className="status-control">
        <select 
          value={delivery.status}
          onChange={(e) => updateStatus(delivery.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button 
          className="update-button"
          onClick={(e) => {
            e.stopPropagation();
            const currentIndex = statusOptions.indexOf(delivery.status);
            if (currentIndex < statusOptions.length - 1) {
              updateStatus(delivery.id, statusOptions[currentIndex + 1]);
            }
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default DeliveryCard;