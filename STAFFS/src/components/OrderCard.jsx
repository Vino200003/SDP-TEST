import React from 'react';
import '../../styles/OrderCard.css';

const OrderCard = ({ order, updateStatus, statusOptions }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getTimeElapsed = (timestamp) => {
    const orderTime = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    return `${diffInMinutes} minutes ago`;
  };
  
  const getBadgeClass = (status) => {
    switch(status) {
      case 'New': return 'badge-new';
      case 'Preparing': return 'badge-preparing';
      case 'Ready': return 'badge-ready';
      case 'Completed': return 'badge-completed';
      default: return '';
    }
  };
  
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };
  
  return (
    <div className={`order-card ${order.status.toLowerCase()}`}>
      <div className="order-header">
        <div className="order-id-container">
          <div className="order-id">{order.id}</div>
          {order.priority && (
            <span className={`priority-badge ${getPriorityClass(order.priority)}`}>
              {order.priority} Priority
            </span>
          )}
        </div>
        <div className="order-meta">
          <div className="order-time" title={formatTime(order.timestamp)}>
            {getTimeElapsed(order.timestamp)}
          </div>
          <div className={`order-type ${order.type.toLowerCase()}`}>
            {order.type}
            {order.tableNumber && ` - Table ${order.tableNumber}`}
          </div>
        </div>
      </div>
      
      <div className="order-items">
        <h4>Items:</h4>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              <div className="item-header">
                <span className="item-quantity">{item.quantity}x</span>
                <span className="item-name">{item.name}</span>
              </div>
              {item.notes && <div className="item-notes">{item.notes}</div>}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="order-footer">
        <div className="order-status">
          <span className={`status-badge ${getBadgeClass(order.status)}`}>
            {order.status}
          </span>
        </div>
        
        <div className="status-actions">
          <select 
            value={order.status}
            onChange={(e) => updateStatus(order.id, e.target.value)}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button 
            className="update-button"
            onClick={() => {
              const currentIndex = statusOptions.indexOf(order.status);
              if (currentIndex < statusOptions.length - 1) {
                updateStatus(order.id, statusOptions[currentIndex + 1]);
              }
            }}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;