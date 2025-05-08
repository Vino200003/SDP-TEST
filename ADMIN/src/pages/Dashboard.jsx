import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useApiServices from '../hooks/useApiServices';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize API services
  useApiServices();

  // Sample useEffect for demonstration
  useEffect(() => {
    // Log authentication status for debugging
    console.log('Dashboard mounted. Auth status:', isAuthenticated);
    
    // Your existing data fetching logic...
    
  }, [isAuthenticated]);

  // Additional user welcome message showing successful authentication
  const welcomeMessage = user ? `Welcome back, ${user.first_name} ${user.last_name}!` : 'Welcome to the Dashboard!';

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="welcome-message">
          <h1>{welcomeMessage}</h1>
          <p>Here's what's happening with your restaurant today</p>
        </div>
        
        <Header title="Dashboard" />
        
        <div className="dashboard-overview">
          <div className="dashboard-welcome">
            <h2>Welcome to Restaurant Admin Dashboard</h2>
            <p>Manage your restaurant operations from this central dashboard</p>
          </div>
          
          <div className="dashboard-stats">
            {/* Sample stats cards */}
            <div className="stat-card orders">
              <h3>Orders Today</h3>
              <p className="stat-number">24</p>
              <p className="stat-info">↑ 12% from yesterday</p>
            </div>
            
            <div className="stat-card revenue">
              <h3>Today's Revenue</h3>
              <p className="stat-number">Rs. 45,250</p>
              <p className="stat-info">↑ 8% from yesterday</p>
            </div>
            
            <div className="stat-card reservations">
              <h3>Reservations</h3>
              <p className="stat-number">12</p>
              <p className="stat-info">For today</p>
            </div>
            
            <div className="stat-card inventory">
              <h3>Low Stock Items</h3>
              <p className="stat-number">5</p>
              <p className="stat-info">Need attention</p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Recent Orders</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="section-content">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#1082</td>
                    <td>John Smith</td>
                    <td>Rs. 1,250</td>
                    <td><span className="status-badge status-completed">Completed</span></td>
                    <td>10:30 AM</td>
                  </tr>
                  <tr>
                    <td>#1081</td>
                    <td>Emily Johnson</td>
                    <td>Rs. 850</td>
                    <td><span className="status-badge status-processing">In Progress</span></td>
                    <td>10:15 AM</td>
                  </tr>
                  <tr>
                    <td>#1080</td>
                    <td>Michael Brown</td>
                    <td>Rs. 2,100</td>
                    <td><span className="status-badge status-pending">Pending</span></td>
                    <td>09:50 AM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Today's Reservations</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="section-content">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Time</th>
                    <th>Table</th>
                    <th>Guests</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#506</td>
                    <td>Sophia Wilson</td>
                    <td>7:00 PM</td>
                    <td>Table 5</td>
                    <td>4</td>
                    <td><span className="status-badge status-confirmed">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td>#505</td>
                    <td>Robert Davis</td>
                    <td>6:30 PM</td>
                    <td>Table 12</td>
                    <td>2</td>
                    <td><span className="status-badge status-confirmed">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td>#504</td>
                    <td>Olivia Taylor</td>
                    <td>7:30 PM</td>
                    <td>Table 8</td>
                    <td>6</td>
                    <td><span className="status-badge status-pending">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
