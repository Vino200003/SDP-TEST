import React, { useState, useEffect } from 'react';
import Login from './src/pages/Login';
import KitchenDashboard from './src/pages/KitchenDashboard';
import DeliveryDashboard from './src/pages/DeliveryDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [staffType, setStaffType] = useState(null);

  useEffect(() => {
    // Check URL for page parameter
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    
    if (page === 'kitchen-dashboard') {
      setCurrentPage('kitchen-dashboard');
      setStaffType('kitchen');
    } else if (page === 'delivery-dashboard') {
      setCurrentPage('delivery-dashboard');
      setStaffType('delivery');
    }
  }, []);

  const handleLogin = (type) => {
    setStaffType(type);
    
    if (type === 'kitchen') {
      setCurrentPage('kitchen-dashboard');
      // Update URL without reloading
      window.history.pushState({}, '', '?page=kitchen-dashboard');
    } else if (type === 'delivery') {
      setCurrentPage('delivery-dashboard');
      // Update URL without reloading
      window.history.pushState({}, '', '?page=delivery-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentPage('login');
    setStaffType(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="app">
      {currentPage === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      
      {currentPage === 'kitchen-dashboard' && (
        <KitchenDashboard onLogout={handleLogout} />
      )}
      
      {currentPage === 'delivery-dashboard' && (
        <DeliveryDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
