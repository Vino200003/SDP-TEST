import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import OrdersManagement from "./pages/OrdersManagement";
import MenuManagement from "./pages/MenuManagement";
import ReservationManagement from "./pages/ReservationManagement";
import InventoryManagement from "./pages/InventoryManagement";
import PlaceholderPage from "./components/PlaceholderPage";
import "./App.css";

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<OrdersManagement />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/menu" element={<MenuManagement />} />
        <Route path="/reservations" element={<ReservationManagement />} />
        {/* Use PlaceholderPage for the 404 route instead of NotFound */}
        <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
