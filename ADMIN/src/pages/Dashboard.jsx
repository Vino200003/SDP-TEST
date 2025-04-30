import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RecentOrders from '../components/RecentOrders';
import '../styles/Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <Header title="Dashboard" />
        
        <div className="dashboard-stats">
          <StatCard 
            title="Total Revenue" 
            value="$12,850" 
            icon="💰" 
            color="#ffc107" 
          />
          <StatCard 
            title="Total Orders" 
            value="248" 
            icon="📦" 
            color="#212121" 
          />
          <StatCard 
            title="New Customers" 
            value="32" 
            icon="👥" 
            color="#ffc107" 
          />
          <StatCard 
            title="Average Order" 
            value="$51.82" 
            icon="📊" 
            color="#212121" 
          />
        </div>
        
        <div className="dashboard-charts">
          <div className="chart-card">
            <h2>Sales Overview</h2>
            <div className="chart-placeholder">
              <p>Sales Chart will be displayed here</p>
            </div>
          </div>
          <div className="chart-card">
            <h2>Popular Items</h2>
            <div className="chart-placeholder">
              <p>Popular Items Chart will be displayed here</p>
            </div>
          </div>
        </div>
        
        <RecentOrders />
      </main>
    </div>
  );
}

export default Dashboard;
