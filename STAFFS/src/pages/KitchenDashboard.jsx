import React, { useState } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/KitchenDashboard.css';
import Header from '../components/Header';
import OrderStats from '../components/OrderStats';
import OrderCard from '../components/OrderCard';

const KitchenDashboard = ({ onLogout }) => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      type: 'Dine-in',
      tableNumber: '12',
      items: [
        { name: 'Chicken Burger', quantity: 2, notes: 'No pickles' },
        { name: 'French Fries', quantity: 1, notes: 'Extra salt' },
        { name: 'Coke', quantity: 2, notes: '' }
      ],
      status: 'New',
      priority: 'High',
      timestamp: '2023-10-12T10:30:00'
    },
    {
      id: 'ORD-002',
      type: 'Delivery',
      items: [
        { name: 'Margherita Pizza', quantity: 1, notes: 'Extra cheese' },
        { name: 'Garlic Bread', quantity: 1, notes: '' }
      ],
      status: 'New',
      priority: 'Medium',
      timestamp: '2023-10-12T10:35:00'
    },
    {
      id: 'ORD-003',
      type: 'Pickup',
      items: [
        { name: 'Vegetable Pasta', quantity: 1, notes: 'No mushrooms' },
        { name: 'Tiramisu', quantity: 1, notes: '' }
      ],
      status: 'Preparing',
      priority: 'Medium',
      timestamp: '2023-10-12T10:25:00'
    },
    {
      id: 'ORD-004',
      type: 'Dine-in',
      tableNumber: '8',
      items: [
        { name: 'Steak', quantity: 1, notes: 'Medium rare' },
        { name: 'Mashed Potatoes', quantity: 1, notes: '' },
        { name: 'Caesar Salad', quantity: 1, notes: 'Dressing on the side' }
      ],
      status: 'Preparing',
      priority: 'High',
      timestamp: '2023-10-12T10:15:00'
    },
    {
      id: 'ORD-005',
      type: 'Pickup',
      items: [
        { name: 'Chicken Wrap', quantity: 2, notes: '' },
        { name: 'Onion Rings', quantity: 1, notes: '' }
      ],
      status: 'Ready',
      priority: 'Low',
      timestamp: '2023-10-12T10:05:00'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('All');

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = activeFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const stats = {
    total: orders.length,
    new: orders.filter(order => order.status === 'New').length,
    preparing: orders.filter(order => order.status === 'Preparing').length,
    ready: orders.filter(order => order.status === 'Ready').length,
    completed: orders.filter(order => order.status === 'Completed').length
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
            <div className="order-filters">
              <button 
                className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
                onClick={() => setActiveFilter('All')}
              >
                All
              </button>
              <button 
                className={`filter-button ${activeFilter === 'New' ? 'active' : ''}`}
                onClick={() => setActiveFilter('New')}
              >
                New
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
                className={`filter-button ${activeFilter === 'Completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Completed')}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
        
        <div className="order-types-container">
          <div className="order-type-section">
            <h3 className="section-title">Dine-in Orders</h3>
            <div className="orders-grid">
              {filteredOrders
                .filter(order => order.type === 'Dine-in')
                .map(order => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    updateStatus={updateOrderStatus}
                    statusOptions={['New', 'Preparing', 'Ready', 'Completed']}
                  />
                ))}
              {filteredOrders.filter(order => order.type === 'Dine-in').length === 0 && (
                <div className="no-orders-message">
                  <i className="fas fa-utensils"></i>
                  <p>No dine-in orders</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="order-type-section">
            <h3 className="section-title">Delivery & Pickup Orders</h3>
            <div className="orders-grid">
              {filteredOrders
                .filter(order => order.type === 'Delivery' || order.type === 'Pickup')
                .map(order => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    updateStatus={updateOrderStatus}
                    statusOptions={['New', 'Preparing', 'Ready', 'Completed']}
                  />
                ))}
              {filteredOrders.filter(order => order.type === 'Delivery' || order.type === 'Pickup').length === 0 && (
                <div className="no-orders-message">
                  <i className="fas fa-shopping-bag"></i>
                  <p>No delivery or pickup orders</p>
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