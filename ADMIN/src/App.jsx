import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
// Import placeholder components for other pages
import PlaceholderPage from './components/PlaceholderPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu-management" element={<MenuManagement />} />
        <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
        <Route path="/reservations" element={<PlaceholderPage title="Table Reservations" />} />
        <Route path="/inventory" element={<PlaceholderPage title="Inventory" />} />
        <Route path="/staff" element={<PlaceholderPage title="Staff Management" />} />
        <Route path="/attendance" element={<PlaceholderPage title="Attendance" />} />
        <Route path="/delivery" element={<PlaceholderPage title="Delivery Management" />} />
        <Route path="/settings" element={<PlaceholderPage title="Admin Settings" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/logout" element={<Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
