import { API_URL } from '../config/constants';
import { serverStatus } from '../utils/mockData';

// Mock data for staff members
const mockStaff = [
  {
    staff_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@restaurant.com',
    phone_number: '(123) 456-7890',
    role: 'waiter',
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
    created_at: '2023-03-10T10:15:00Z',
    updated_at: '2023-03-10T10:15:00Z'
  },
  {
    staff_id: 4,
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.williams@restaurant.com',
    phone_number: '(456) 789-0123',
    role: 'waiter',
    created_at: '2023-04-05T11:30:00Z',
    updated_at: '2023-04-05T11:30:00Z'
  },
  {
    staff_id: 5,
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@restaurant.com',
    phone_number: '(567) 890-1234',
    role: 'chef',
    created_at: '2023-05-12T13:45:00Z',
    updated_at: '2023-05-12T13:45:00Z'
  }
];

// Check server availability
export const checkServerAvailability = async () => {
  try {
    // Attempt to ping the server
    const response = await fetch(`${API_URL}/api/health-check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });
    
    // Update server status
    serverStatus.isAvailable = response.ok;
    serverStatus.lastChecked = Date.now();
    
    return response.ok;
  } catch (error) {
    console.error('Server availability check failed:', error);
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    return false;
  }
};

// Get all staff members
export const getAllStaff = async () => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use mock data
    if (!isServerAvailable) {
      console.log('Using mock staff data (server unavailable)');
      return [...mockStaff];
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/staff`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Staff service error:', error);
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    // Return mock data as fallback
    return [...mockStaff];
  }
};

// Get staff member by ID
export const getStaffById = async (staffId) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use mock data
    if (!isServerAvailable) {
      console.log('Using mock staff data (server unavailable)');
      const staffMember = mockStaff.find(member => member.staff_id === parseInt(staffId));
      if (!staffMember) throw new Error('Staff member not found');
      return {...staffMember};
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/staff/${staffId}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get staff by ID service error:', error);
    
    // If we're looking for a specific staff member and can't find them in mock data,
    // don't update server status, just throw the error
    if (error.message === 'Staff member not found') {
      throw error;
    }
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    throw error;
  }
};

// Create a new staff member
export const createStaff = async (staffData) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, simulate creating a staff member with mock data
    if (!isServerAvailable) {
      console.log('Simulating create staff (server unavailable)');
      
      // Create new ID (max existing ID + 1)
      const newId = Math.max(...mockStaff.map(member => member.staff_id)) + 1;
      
      const now = new Date().toISOString();
      
      const newStaff = {
        staff_id: newId,
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        email: staffData.email,
        phone_number: staffData.phone_number || null,
        role: staffData.role,
        created_at: now,
        updated_at: now
      };
      
      // Add to mock data
      mockStaff.push(newStaff);
      
      return {...newStaff};
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
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
      throw new Error(errorData.message || 'Failed to create staff member');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create staff service error:', error);
    
    // Don't automatically set server status to down if it's a validation error
    if (!error.message.includes('validation') && !error.message.includes('already exists')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Update a staff member
export const updateStaff = async (staffId, staffData) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, simulate updating a staff member with mock data
    if (!isServerAvailable) {
      console.log('Simulating update staff (server unavailable)');
      
      const index = mockStaff.findIndex(member => member.staff_id === parseInt(staffId));
      if (index === -1) throw new Error('Staff member not found');
      
      const now = new Date().toISOString();
      
      // Update the staff member
      mockStaff[index] = {
        ...mockStaff[index],
        ...staffData,
        updated_at: now
      };
      
      return {...mockStaff[index]};
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
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
      throw new Error(errorData.message || 'Failed to update staff member');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update staff service error:', error);
    
    // Update server status if it's not a validation error or "not found" error
    if (
      !error.message.includes('validation') && 
      !error.message.includes('already exists') &&
      !error.message.includes('not found')
    ) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Delete a staff member
export const deleteStaff = async (staffId) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, simulate deleting a staff member from mock data
    if (!isServerAvailable) {
      console.log('Simulating delete staff (server unavailable)');
      
      const index = mockStaff.findIndex(member => member.staff_id === parseInt(staffId));
      if (index === -1) throw new Error('Staff member not found');
      
      // Remove the staff member
      mockStaff.splice(index, 1);
      
      return { message: 'Staff member deleted successfully' };
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete staff member');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete staff service error:', error);
    
    // Update server status if it's not a "not found" error
    if (!error.message.includes('not found')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};
