import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import '../../styles/DeliveryDashboard.css';
import Header from '../components/Header';
import DeliveryCard from '../components/DeliveryCard';
import DeliveryStats from '../components/DeliveryStats';
import MapView from '../components/MapView';

const DeliveryDashboard = ({ onLogout }) => {
  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL-001',
      orderId: 'ORD-002',
      customer: {
        name: 'John Smith',
        address: '123 Main St, Cityville',
        phone: '555-1234'
      },
      items: [
        { name: 'Margherita Pizza', quantity: 1 },
        { name: 'Garlic Bread', quantity: 1 }
      ],
      status: 'Ready for Pickup',
      timestamp: '2023-10-12T10:35:00',
      estimatedDeliveryTime: '25-35 min',
      totalAmount: '$24.99'
    },
    {
      id: 'DEL-002',
      orderId: 'ORD-005',
      customer: {
        name: 'Emily Johnson',
        address: '456 Oak Ave, Townsville',
        phone: '555-5678'
      },
      items: [
        { name: 'Chicken Curry', quantity: 1 },
        { name: 'Naan Bread', quantity: 2 },
        { name: 'Mango Lassi', quantity: 1 }
      ],
      status: 'Ready for Pickup',
      timestamp: '2023-10-12T10:40:00',
      estimatedDeliveryTime: '35-45 min',
      totalAmount: '$32.50'
    },
    {
      id: 'DEL-003',
      orderId: 'ORD-007',
      customer: {
        name: 'Michael Brown',
        address: '789 Pine Blvd, Villagetown',
        phone: '555-9012'
      },
      items: [
        { name: 'Beef Burger', quantity: 2 },
        { name: 'Onion Rings', quantity: 1 },
        { name: 'Chocolate Milkshake', quantity: 2 }
      ],
      status: 'Out for Delivery',
      timestamp: '2023-10-12T10:20:00',
      estimatedDeliveryTime: '10-15 min',
      totalAmount: '$38.75'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
    ));
  };

  const filteredDeliveries = activeFilter === 'All' 
    ? deliveries 
    : deliveries.filter(delivery => delivery.status === activeFilter);

  const handleDeliverySelect = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const stats = {
    total: deliveries.length,
    readyForPickup: deliveries.filter(d => d.status === 'Ready for Pickup').length,
    outForDelivery: deliveries.filter(d => d.status === 'Out for Delivery').length,
    delivered: deliveries.filter(d => d.status === 'Delivered').length,
  };

  return (
    <div className="dashboard-container">
      <Header 
        title="Delivery Dashboard" 
        staffName="Alex Johnson" 
        staffRole="Delivery Staff"
        onLogout={onLogout} 
      />
      
      <div className="dashboard-content">
        <DeliveryStats stats={stats} />
        
        <div className="dashboard-main-content">
          <div className="deliveries-section">
            <div className="orders-header">
              <h2>Assigned Deliveries</h2>
              <div className="order-filters">
                <button 
                  className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('All')}
                >
                  All
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'Ready for Pickup' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Ready for Pickup')}
                >
                  Ready for Pickup
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'Out for Delivery' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Out for Delivery')}
                >
                  Out for Delivery
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'Delivered' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('Delivered')}
                >
                  Delivered
                </button>
              </div>
            </div>
            
            <div className="orders-grid">
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(delivery => (
                  <DeliveryCard 
                    key={delivery.id}
                    delivery={delivery}
                    updateStatus={updateDeliveryStatus}
                    statusOptions={['Ready for Pickup', 'Out for Delivery', 'Delivered']}
                    onSelect={() => handleDeliverySelect(delivery)}
                    isSelected={selectedDelivery && selectedDelivery.id === delivery.id}
                  />
                ))
              ) : (
                <div className="no-orders-message">
                  <i className="fas fa-inbox"></i>
                  <p>No deliveries match the selected filter</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="map-section">
            <MapView selectedDelivery={selectedDelivery} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;