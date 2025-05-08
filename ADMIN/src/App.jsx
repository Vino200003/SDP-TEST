import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import OrdersManagement from './pages/OrdersManagement';
import ReservationManagement from './pages/ReservationManagement';
import InventoryManagement from './pages/InventoryManagement';
import Login from './pages/Login';
import { useState, useEffect } from 'react';
import { isAuthenticated } from './services/authService';
import PlaceholderPage from "./components/PlaceholderPage";
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  // Check authentication status when component mounts
  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={isAuth ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuth ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/menu-management" 
          element={isAuth ? <MenuManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders" 
          element={isAuth ? <OrdersManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/reservations" 
          element={isAuth ? <ReservationManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/inventory" 
          element={isAuth ? <InventoryManagement /> : <Navigate to="/login" />} 
        />
        {/* Add other protected routes here */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
