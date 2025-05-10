import { API_URL } from '../config/constants';

// Mock data for staff members (for fallback)
const mockStaff = [
  {
    staff_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@restaurant.com',
    phone_number: '(123) 456-7890',
    role: 'waiter',
    active: true,
    created_at: '2023-01-15T08:30:00Z',
    updated_at: '2023-01-15T08:30:00Z'
  },
  {
    staff_id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@restaurant.com',
    phone_number: '(234) 567-8901',
    role: 'chef',
    active: true,
    created_at: '2023-02-20T09:45:00Z',
    updated_at: '2023-02-20T09:45:00Z'
  },
  {
    staff_id: 3,
    first_name: 'David',
    last_name: 'Johnson',
    email: 'david.johnson@restaurant.com',
    phone_number: '(345) 678-9012',
    role: 'delivery',
    active: true,
    created_at: '2023-03-10T10:15:00Z',
    updated_at: '2023-03-10T10:15:00Z'
  }
];

// Get the JWT token from local storage
const getToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken');

// Server status object
export const serverStatus = {
  isAvailable: false,
  lastChecked: null
};

// Check server availability
export const checkServerAvailability = async () => {
  try {
    // Use a more reliable endpoint for server check
    const response = await fetch(`${API_URL}/api/health/check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    serverStatus.isAvailable = response.ok;
    serverStatus.lastChecked = Date.now();
    
    return response.ok;
  } catch (error) {
    console.error('Server availability check failed:', error);
    
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    return false;
  }
};

// Get all staff members
export const getAllStaff = async () => {
  try {
    // Check server availability first
    await checkServerAvailability();
    
    // If server is not available, return mock data
    if (!serverStatus.isAvailable) {
      console.log('Using mock staff data - server unavailable');
      return [...mockStaff];
    }
    
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/staff`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.log('Unauthorized access - using mock data instead');
      return [...mockStaff];
    }
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching staff:', error);
    
    // Return mock data as fallback
    return [...mockStaff];
  }
};

// Get a staff member by ID
export const getStaffById = async (staffId) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/staff/${staffId}`, {
      method: 'GET',
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
    console.error('Error fetching staff member:', error);
    throw error;
  }
};

// Create a new staff member
export const createStaff = async (staffData) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/staff`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(staffData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
};

// Update a staff member
export const updateStaff = async (staffId, staffData) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/staff/${staffId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(staffData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
};

// Delete a staff member
export const deleteStaff = async (staffId) => {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}/api/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
};
