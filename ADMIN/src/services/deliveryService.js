import { API_URL } from '../config/constants';

// Get the JWT token from local storage
const getToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken');

// Get all delivery personnel from staff table
export const getAllDeliveryPersonnel = async () => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/staff/delivery`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform data to match the expected format in the DeliveryManagement component
    return data.map(staff => ({
      id: staff.staff_id,
      name: `${staff.first_name} ${staff.last_name}`,
      contact_number: staff.phone_number || 'N/A',
      email: staff.email,
      vehicle_type: 'motorcycle', // Default value as this isn't in staff table
      license_number: staff.nic, // Using NIC as license number
      status: 'available', // Default status
      completed_deliveries: 0, // Default value
      avg_rating: 0, // Default value
      joined_date: staff.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error('Error fetching delivery personnel:', error);
    throw error;
  }
};

// Get delivery orders - updated to use the new API
export const getDeliveryOrders = async () => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/delivery/orders`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    throw error;
  }
};

// Update order status - updated to use the new API
export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/delivery/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};

// Assign order to delivery person - updated to use the new API
export const assignDeliveryOrder = async (orderId, deliveryPersonId) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/delivery/orders/${orderId}/assign/${deliveryPersonId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error assigning order ${orderId} to delivery person:`, error);
    throw error;
  }
};
