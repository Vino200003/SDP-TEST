import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import '../styles/Header.css';

function Header({ title }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [adminInitials, setAdminInitials] = useState('A');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get admin info from local storage
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      try {
        const admin = JSON.parse(adminInfo);
        
        // Set admin name for display
        if (admin.first_name && admin.last_name) {
          setAdminName(`${admin.first_name} ${admin.last_name}`);
          setAdminInitials(`${admin.first_name[0]}${admin.last_name[0]}`);
        } else if (admin.first_name) {
          setAdminName(admin.first_name);
          setAdminInitials(admin.first_name[0]);
        } else if (admin.email) {
          const emailName = admin.email.split('@')[0];
          setAdminName(emailName);
          setAdminInitials(emailName[0].toUpperCase());
        }
      } catch (error) {
        console.error('Error parsing admin info:', error);
      }
    }
    
    // Fetch notifications (this could be replaced with actual API call)
    const demoNotifications = [
      { id: 1, message: 'New order received', time: '5 min ago', read: false },
      { id: 2, message: 'New reservation', time: '1 hour ago', read: false },
      { id: 3, message: 'Inventory low alert', time: '3 hours ago', read: true }
    ];
    setNotifications(demoNotifications);
  }, []);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    
    // Redirect to login page
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    
    // Close notifications dropdown if open
    if (showNotifications) {
      setShowNotifications(false);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // Close user menu if open
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <header className="dashboard-header">
      <h1 className="dashboard-title">{title}</h1>
      
      <div className="header-right">
        <div className="notifications-wrapper">
          <button 
            className="notifications-button" 
            onClick={toggleNotifications}
            aria-label="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-read-button" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile-wrapper">
          <div className="user-info" onClick={toggleUserMenu}>
            <div className="user-avatar">
              <span>{adminInitials}</span>
            </div>
            <span className="user-name">{adminName}</span>
          </div>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <Link to="/admin/settings" className="dropdown-item">
                <FaUser />
                <span>Profile</span>
              </Link>
              <Link to="/admin/settings" className="dropdown-item">
                <FaCog />
                <span>Settings</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-button" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
