import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/authService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import OrdersManagement from './pages/OrdersManagement';
import ReservationManagement from './pages/ReservationManagement';
// Import placeholder components for other pages
import PlaceholderPage from './components/PlaceholderPage';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/menu-management" element={
        <ProtectedRoute>
          <MenuManagement />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <OrdersManagement />
        </ProtectedRoute>
      } />
      <Route path="/reservations" element={
        <ProtectedRoute>
          <ReservationManagement />
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute>
          <PlaceholderPage title="Inventory" />
        </ProtectedRoute>
      } />
      <Route path="/staff" element={
        <ProtectedRoute>
          <PlaceholderPage title="Staff Management" />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <PlaceholderPage title="Attendance" />
        </ProtectedRoute>
      } />
      <Route path="/delivery" element={
        <ProtectedRoute>
          <PlaceholderPage title="Delivery Management" />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <PlaceholderPage title="Admin Settings" />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <PlaceholderPage title="Reports" />
        </ProtectedRoute>
      } />
      
      {/* Logout route */}
      <Route path="/logout" element={<Navigate to="/login" replace />} />
      
      {/* Default routes - Updated to redirect to login first, then dashboard if authenticated */}
      <Route path="/" element={
        isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
