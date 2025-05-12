import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/KitchenDashboard.css';
import '../../styles/OrderTable.css';
import Header from '../components/Header';
import OrderStats from '../components/OrderStats';

const KitchenDashboard = ({ onLogout }) => {
  const [orders, setOrders] = useState([
    {
      order_id: 1001,
      user_id: 101,
      order_type: 'Dine-in',
      order_status: 'In Progress',
      kitchen_status: 'Preparing',
      table_no: 12,
      sub_total: 34.50,
      service_fee: 2.00,
      total_amount: 36.50,
      payment_type: 'card',
      payment_status: 'paid',
      special_instructions: 'Allergic to peanuts',
      created_at: '2023-10-12T10:30:00',
      items: [
        { name: 'Chicken Burger', quantity: 2, notes: 'No pickles', price: 11.50 },
        { name: 'French Fries', quantity: 1, notes: 'Extra salt', price: 4.50 },
        { name: 'Coke', quantity: 2, notes: '', price: 3.50 }
      ]
    },
    {
      order_id: 1002,
      user_id: 105,
      order_type: 'Delivery',
      order_status: 'In Progress',
      kitchen_status: 'Pending',
      delivery_status: 'Assigned',
      estimated_delivery_time: '2023-10-12T11:15:00',
      sub_total: 25.99,
      service_fee: 1.50,
      delivery_fee: 3.99,
      total_amount: 31.48,
      payment_type: 'card',
      payment_status: 'paid',
      delivery_address: '123 Main St, Cityville',
      special_instructions: 'Ring the doorbell twice',
      created_at: '2023-10-12T10:35:00',
      items: [
        { name: 'Margherita Pizza', quantity: 1, notes: 'Extra cheese', price: 18.99 },
        { name: 'Garlic Bread', quantity: 1, notes: '', price: 7.00 }
      ]
    },
    {
      order_id: 1003,
      user_id: 102,
      order_type: 'Takeaway',
      order_status: 'In Progress',
      kitchen_status: 'Preparing',
      sub_total: 28.50,
      service_fee: 0.00,
      total_amount: 28.50,
      payment_type: 'cash',
      payment_status: 'unpaid',
      special_instructions: 'Pack items separately',
      created_at: '2023-10-12T10:25:00',
      items: [
        { name: 'Vegetable Pasta', quantity: 1, notes: 'No mushrooms', price: 16.50 },
        { name: 'Tiramisu', quantity: 1, notes: '', price: 12.00 }
      ]
    },
    {
      order_id: 1004,
      user_id: 103,
      order_type: 'Dine-in',
      order_status: 'In Progress',
      kitchen_status: 'Preparing',
      table_no: 8,
      sub_total: 52.50,
      service_fee: 5.25,
      total_amount: 57.75,
      payment_type: 'card',
      payment_status: 'paid',
      special_instructions: 'Birthday celebration, please add a candle to the dessert',
      created_at: '2023-10-12T10:15:00',
      items: [
        { name: 'Steak', quantity: 1, notes: 'Medium rare', price: 28.50 },
        { name: 'Mashed Potatoes', quantity: 1, notes: '', price: 8.00 },
        { name: 'Caesar Salad', quantity: 1, notes: 'Dressing on the side', price: 9.50 },
        { name: 'Chocolate Cake', quantity: 1, notes: 'Add birthday candle', price: 6.50 }
      ]
    },
    {
      order_id: 1005,
      user_id: 104,
      order_type: 'Takeaway',
      order_status: 'In Progress',
      kitchen_status: 'Ready',
      sub_total: 23.00,
      service_fee: 0.00,
      total_amount: 23.00,
      payment_type: 'cash',
      payment_status: 'unpaid',
      created_at: '2023-10-12T10:05:00',
      items: [
        { name: 'Chicken Wrap', quantity: 2, notes: '', price: 9.50 },
        { name: 'Onion Rings', quantity: 1, notes: '', price: 4.00 }
      ]
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedItems, setExpandedItems] = useState({});
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.order_id === orderId ? { ...order, kitchen_status: newStatus } : order
    ));
  };

  const toggleItems = (orderId) => {
    setExpandedItems(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getFilteredOrders = () => {
    let result = [...orders];
    
    // Apply status filter
    if (activeFilter !== 'All') {
      result = result.filter(order => order.kitchen_status === activeFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'All') {
      result = result.filter(order => order.order_type === typeFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.order_id.toString().includes(term) || 
        order.items.some(item => item.name.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  };

  const filteredOrders = getFilteredOrders();

  const stats = {
    total: orders.length,
    new: orders.filter(order => order.kitchen_status === 'Pending').length,
    preparing: orders.filter(order => order.kitchen_status === 'Preparing').length,
    ready: orders.filter(order => order.kitchen_status === 'Ready').length,
    completed: orders.filter(order => order.kitchen_status === 'Cancelled').length
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const getTimeElapsed = (timestamp) => {
    const orderTime = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const hours = Math.floor(diffInMinutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };
  
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'badge-pending';
      case 'Preparing': return 'badge-preparing';
      case 'Ready': return 'badge-ready';
      case 'Cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <Header 
        title="Kitchen Dashboard" 
        staffName="Michael Chen" 
        staffRole="Kitchen Staff" 
        onLogout={onLogout}
      />
      
      <div className="dashboard-content">
        <OrderStats stats={stats} />
        
        <div className="orders-controls">
          <div className="orders-header">
            <h2>Orders Queue</h2>
            
            <div className="advanced-filters">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search order id or item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button 
                  className="search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  {searchTerm ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
                </button>
              </div>
              
              <div className="filter-group">
                <label>Status:</label>
                <div className="order-filters">
                  <button 
                    className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('All')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Pending' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Pending')}
                  >
                    Pending
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Preparing' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Preparing')}
                  >
                    Preparing
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Ready' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Ready')}
                  >
                    Ready
                  </button>
                  <button 
                    className={`filter-button ${activeFilter === 'Cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('Cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
              
              <div className="filter-group">
                <label>Type:</label>
                <div className="order-filters">
                  <button 
                    className={`filter-button ${typeFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('All')}
                  >
                    All
                  </button>
                  <button 
                    className={`filter-button ${typeFilter === 'Dine-in' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Dine-in')}
                  >
                    Dine-in
                  </button>
                  <button 
                    className={`filter-button ${typeFilter === 'Takeaway' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Takeaway')}
                  >
                    Takeaway
                  </button>
                  <button 
                    className={`filter-button ${typeFilter === 'Delivery' ? 'active' : ''}`}
                    onClick={() => setTypeFilter('Delivery')}
                  >
                    Delivery
                  </button>
                </div>
              </div>
              
              <div className="sort-control">
                <label>Sort:</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="filter-summary">
            <p>
              Showing {filteredOrders.length} orders
              {activeFilter !== 'All' && ` with status "${activeFilter}"`}
              {typeFilter !== 'All' && ` of type "${typeFilter}"`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
            {(activeFilter !== 'All' || typeFilter !== 'All' || searchTerm) && (
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setActiveFilter('All');
                  setTypeFilter('All');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        <div className="order-types-container">
          <div className="order-type-section">
            <h3 className="section-title">Orders Queue</h3>
            <div className="orders-grid">
              {filteredOrders.length > 0 ? (
                <div className="order-table-container">
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Type</th>
                        <th>Time</th>
                        <th>Table/Delivery</th>
                        <th>Kitchen Status</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <React.Fragment key={order.order_id}>
                          <tr>
                            <td className="order-id">#{order.order_id}</td>
                            <td>
                              <div className="order-type-cell">
                                <span className={`order-type-badge ${order.order_type.toLowerCase()}`}>
                                  {order.order_type}
                                </span>
                              </div>
                            </td>
                            <td title={formatDateTime(order.created_at)}>
                              {getTimeElapsed(order.created_at)}
                            </td>
                            <td>
                              {order.order_type === 'Dine-in' && `Table ${order.table_no}`}
                              {order.order_type === 'Delivery' && 'Delivery'}
                              {order.order_type === 'Takeaway' && 'Pickup'}
                            </td>
                            <td className="status-column">
                              <span className={`status-badge ${getStatusBadgeClass(order.kitchen_status)}`}>
                                {order.kitchen_status}
                              </span>
                            </td>
                            <td className="amount-cell">
                              ${order.total_amount.toFixed(2)}
                            </td>
                            <td className="actions-column">
                              <select 
                                className="update-status-select"
                                value={order.kitchen_status}
                                onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Ready">Ready</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <button 
                                className="update-button"
                                onClick={() => {
                                  const statusOptions = ['Pending', 'Preparing', 'Ready'];
                                  const currentIndex = statusOptions.indexOf(order.kitchen_status);
                                  if (currentIndex < statusOptions.length - 1) {
                                    updateOrderStatus(order.order_id, statusOptions[currentIndex + 1]);
                                  }
                                }}
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="7">
                              <button 
                                className="toggle-items-btn" 
                                onClick={() => toggleItems(order.order_id)}
                              >
                                <i className={`fas fa-${expandedItems[order.order_id] ? 'chevron-down' : 'chevron-right'}`}></i>
                                {expandedItems[order.order_id] ? 'Hide Items' : 'Show Items'} ({order.items.length})
                              </button>
                              
                              {expandedItems[order.order_id] && (
                                <div className="items-wrapper">
                                  <table className="items-table">
                                    <thead>
                                      <tr>
                                        <th width="10%">Qty</th>
                                        <th width="40%">Item</th>
                                        <th width="30%">Notes</th>
                                        <th width="20%">Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item, idx) => (
                                        <tr key={idx}>
                                          <td className="item-quantity">{item.quantity}x</td>
                                          <td>{item.name}</td>
                                          <td className="item-notes">{item.notes || '-'}</td>
                                          <td className="amount-cell">${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  
                                  {order.special_instructions && (
                                    <div className="instructions-text">
                                      <strong>Special Instructions:</strong> {order.special_instructions}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-orders-message">
                  <i className="fas fa-utensils"></i>
                  <p>No orders match your filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;