import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';
import logo from '../assets/logo.png';

function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Restaurant Logo" className="sidebar-logo" />
        <h3 className="sidebar-title">Restaurant Admin</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <span className="icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/menu-management" className={`nav-link ${location.pathname === '/menu-management' ? 'active' : ''}`}>
              <span className="icon">🍽️</span>
              Menu Management
            </Link>
          </li>
          <li>
            <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
              <span className="icon">🛒</span>
              Orders
            </Link>
          </li>
          <li>
            <Link to="/reservations" className={`nav-link ${location.pathname === '/reservations' ? 'active' : ''}`}>
              <span className="icon">📅</span>
              Table Reservations
            </Link>
          </li>
          <li>
            <Link to="/inventory" className={`nav-link ${location.pathname === '/inventory' ? 'active' : ''}`}>
              <span className="icon">📦</span>
              Inventory
            </Link>
          </li>
          <li>
            <Link to="/staff" className={`nav-link ${location.pathname === '/staff' ? 'active' : ''}`}>
              <span className="icon">👥</span>
              Staff Management
            </Link>
          </li>
          <li>
            <Link to="/attendance" className={`nav-link ${location.pathname === '/attendance' ? 'active' : ''}`}>
              <span className="icon">⏱️</span>
              Attendance
            </Link>
          </li>
          <li>
            <Link to="/delivery" className={`nav-link ${location.pathname === '/delivery' ? 'active' : ''}`}>
              <span className="icon">🚚</span>
              Delivery Management
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}>
              <span className="icon">⚙️</span>
              Admin Settings
            </Link>
          </li>
          <li>
            <Link to="/reports" className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}>
              <span className="icon">📈</span>
              Reports
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <Link to="/logout" className="logout-button">
          <span className="icon">🚪</span>
          Logout
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
