import { API_URL } from '../config/constants';
import { 
  mockReservations, 
  mockStats, 
  generateMockReservations, 
  generateMockStats,
  serverStatus,
  checkServerAvailability
} from '../utils/mockData';

// This variable will be set by the component using the service
let getAuthToken = null;

// Function to set the auth token getter from context
export const setAuthTokenGetter = (tokenGetter) => {
  getAuthToken = tokenGetter;
};

// Get auth token from localStorage using the correct key
const getStoredAuthToken = () => {
  // Try different possible token keys, as the code seems to use different naming conventions
  return localStorage.getItem('adminToken') || 
         localStorage.getItem('auth_token') || 
         localStorage.getItem('admin_token');
};

// Track server connectivity state
let isServerAvailable = true;
let connectionAttempts = 0;
let lastAttemptTime = 0;
const RETRY_INTERVAL = 30000; // 30 seconds between retries

// Try to reconnect to server after a delay
const shouldAttemptReconnect = () => {
  const now = Date.now();
  if (!isServerAvailable && (now - lastAttemptTime) > RETRY_INTERVAL) {
    lastAttemptTime = now;
    return true;
  }
  return false;
};

// Get all reservations with optional filters
export const getAllReservations = async (params = {}) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use mock data
    if (!isServerAvailable) {
      console.log('Using mock reservation data (server unavailable)');
      const mockData = generateMockReservations(15);
      return {
        reservations: mockData,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mockData.length,
          pages: Math.ceil(mockData.length / (params.limit || 10))
        }
      };
    }

    // Server is available, make the real request
    console.log('Server is available, making real API request');

    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    
    // Get token from auth context or from localStorage
    const token = getAuthToken ? getAuthToken() : getStoredAuthToken();
    
    console.log('Server URL:', `${API_URL}/api/reservations?${queryString}`);
    console.log('Token available:', !!token);
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Use the admin-specific endpoint instead of the general reservations endpoint
    // This will connect to the getAllReservations method in reservationController.js
    const response = await fetch(`${API_URL}/api/reservations?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Try the admin-specific endpoint as fallback if it exists
      const adminResponse = await getFallbackReservations(params);
      if (adminResponse && adminResponse.reservations) {
        return adminResponse;
      }
      console.warn(`API response not OK: ${response.status} ${response.statusText}`);
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Reservation service error:', error);
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    // Use mock data as fallback
    const mockData = generateMockReservations(15);
    return {
      reservations: mockData,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 10,
        total: mockData.length,
        pages: Math.ceil(mockData.length / (params.limit || 10))
      }
    };
  }
};

// Fallback to get reservations from the regular endpoint if admin endpoint isn't available
const getFallbackReservations = async (params = {}) => {
  try {
    const token = getStoredAuthToken();
    
    if (!token) {
      return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
    }
    
    // Try the endpoints in order until one works
    const endpoints = [
      // First try the admin-specific endpoint
      `${API_URL}/api/admin/reservations`,
      // Then try without 'admin' path
      `${API_URL}/api/reservations`,
      // Try with a root path as last resort
      `${API_URL}/reservations`
    ];
    
    let lastError = null;
    
    // Try each endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        
        const queryString = queryParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log(`Successful response from endpoint: ${endpoint}`);
          return await response.json();
        }
        
        lastError = `Server returned ${response.status}: ${response.statusText}`;
        console.warn(`Endpoint ${endpoint} failed: ${lastError}`);
      } catch (error) {
        lastError = error.message;
        console.error(`Error trying endpoint ${endpoint}:`, error);
      }
    }
    
    // If we get here, all endpoints failed
    console.error('All reservation endpoints failed:', lastError);
    return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
  } catch (error) {
    console.error('Fallback reservation service error:', error);
    return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
  }
};

// Get reservation stats - connect to the getReservationStats endpoint
export const getReservationStats = async (startDate = '', endDate = '') => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use mock stats
    if (!isServerAvailable) {
      console.log('Using mock stats data (server unavailable)');
      return mockStats;
    }
    
    // Server is available, make the real request
    console.log('Server is available, getting real stats');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    
    // Get admin token from localStorage using our helper function
    const token = getStoredAuthToken();
    
    if (!token) {
      console.warn('No authentication token available');
      return mockStats;
    }
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Connect to getReservationStats endpoint
    const response = await fetch(`${API_URL}/api/reservations/stats?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Stats API response not OK: ${response.status} ${response.statusText}`);
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Reservation stats service error:', error);
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    // Return mock stats on error
    return mockStats;
  }
};

// Get a single reservation by ID - connects to getReservationById endpoint
export const getReservationById = async (reservationId) => {
  try {
    // Get admin token from localStorage using our helper
    const token = getStoredAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Connect to getReservationById endpoint
    const response = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reservation details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get reservation service error:', error);
    throw error;
  }
};

// Update reservation status
export const updateReservationStatus = async (reservationId, newStatus) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use in-memory status tracking
    if (!isServerAvailable) {
      return updateStatusInMemory(reservationId, newStatus);
    }
    
    // Get admin token using our helper function
    const token = getStoredAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log(`Updating reservation ${reservationId} status to ${newStatus}`);
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const requestBody = JSON.stringify({ status: newStatus });
    console.log('Request body:', requestBody);
    
    const response = await fetch(`${API_URL}/api/reservations/${reservationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: requestBody,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Parse the response data regardless of status
    let responseData;
    try {
      responseData = await response.json();
      console.log('Response data:', responseData);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      responseData = { message: 'Failed to parse server response' };
    }
    
    if (!response.ok) {
      // If the error is about missing column, use our in-memory status tracking
      if (responseData.availableColumns) {
        console.error('Schema mismatch. Available columns:', responseData.availableColumns);
        return updateStatusInMemory(reservationId, newStatus);
      }
      
      throw new Error(responseData.message || 'Failed to update reservation status');
    }
    
    // Also update in-memory status to ensure immediate UI updates
    updateStatusInMemory(reservationId, newStatus);
    
    return responseData;
  } catch (error) {
    console.error('Update reservation status service error:', error);
    
    // Update server status on network errors only
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    // Always update the in-memory status for consistent UI
    return updateStatusInMemory(reservationId, newStatus);
  }
};

// Function to update and store reservation statuses in localStorage when the database doesn't support it
function updateStatusInMemory(reservationId, newStatus) {
  console.log(`Using in-memory status tracking for reservation ${reservationId}`);
  
  // Get existing statuses from localStorage or initialize empty object
  const statusesJson = localStorage.getItem('reservationStatuses') || '{}';
  const statuses = JSON.parse(statusesJson);
  
  // Update the status for this reservation
  statuses[reservationId] = newStatus;
  
  // Save back to localStorage
  localStorage.setItem('reservationStatuses', JSON.stringify(statuses));
  
  // Dispatch a custom event to notify components about the status change
  window.dispatchEvent(new CustomEvent('reservationStatusChanged', {
    detail: { reservationId, status: newStatus }
  }));
  
  return {
    message: 'Reservation status updated successfully (in-memory)',
    reservation_id: reservationId,
    status: newStatus
  };
}

// Get reservation status from localStorage if not in database
export const getReservationStatus = (reservation) => {
  // If the reservation has a status field, use it
  if (reservation.status || reservation.reservation_status || reservation.reserve_status) {
    return reservation.status || reservation.reservation_status || reservation.reserve_status;
  }
  
  // Otherwise check in localStorage
  try {
    const statusesJson = localStorage.getItem('reservationStatuses') || '{}';
    const statuses = JSON.parse(statusesJson);
    const id = reservation.reserve_id || reservation.reservation_id;
    
    // Return the stored status or default to 'Pending'
    return statuses[id] || 'Pending';
  } catch (error) {
    console.error('Error getting status from localStorage:', error);
    return 'Pending';
  }
};

// Fallback function to update reservation using PUT instead of PATCH
async function updateReservationFallback(reservationId, newStatus, token) {
  console.log('Trying fallback update method...');
  
  // First get the current reservation
  const response = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reservation for fallback update');
  }
  
  const reservation = await response.json();
  
  // Prepare minimal update data
  const updateData = {
    // Try different status field names
    status: newStatus,
    reservation_status: newStatus,
    reserve_status: newStatus
  };
  
  // Update using PUT endpoint
  const updateResponse = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    throw new Error(errorData.message || 'Fallback update failed');
  }
  
  return {
    message: 'Reservation status updated successfully (fallback method)',
    reservation_id: reservationId,
    status: newStatus
  };
}

// Get all tables - connects to getAllTables endpoint
export const getAllTables = async () => {
  try {
    // If we know server is down, return mock tables immediately
    if (!isServerAvailable && !shouldAttemptReconnect()) {
      return Array.from({ length: 10 }, (_, i) => ({
        table_no: i + 1,
        capacity: Math.floor(Math.random() * 6) + 2,
        status: Math.random() > 0.7 ? 'Reserved' : 'Available',
        is_active: Math.random() > 0.1, // Most tables are active
        current_status: Math.random() > 0.7 ? 'Reserved' : 'Available'
      }));
    }
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Connect to getAllTables endpoint
    const response = await fetch(`${API_URL}/api/reservations/tables`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Server is available
    isServerAvailable = true;
    
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get tables service error:', error);
    
    // Track that server is unavailable if connection failed
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      isServerAvailable = false;
      lastAttemptTime = Date.now();
    }
    
    // Return mock tables
    return Array.from({ length: 10 }, (_, i) => ({
      table_no: i + 1,
      capacity: Math.floor(Math.random() * 6) + 2,
      status: Math.random() > 0.7 ? 'Reserved' : 'Available',
      is_active: Math.random() > 0.1, // Most tables are active
      current_status: Math.random() > 0.7 ? 'Reserved' : 'Available'
    }));
  }
};

// Create a new table
export const createNewTable = async (tableData) => {
  try {
    // Get admin token using our helper function
    const token = getStoredAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/reservations/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tableData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create table');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create table error:', error);
    throw error;
  }
};

// Update table status
export const updateTableStatus = async (tableNo, newStatus) => {
  try {
    // Get admin token using our helper function
    const token = getStoredAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/reservations/tables/${tableNo}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update table status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update table status error:', error);
    throw error;
  }
};

// Set table active status
export const setTableActiveStatus = async (tableNo, isActive) => {
  try {
    // Get admin token using our helper function
    const token = getStoredAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/reservations/tables/${tableNo}/active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update table active status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Set table active status error:', error);
    throw error;
  }
};

// Check table availability at a specific date and time
export const checkTablesAvailability = async (dateTime) => {
  try {
    // For reliability, we'll use mock data by default
    const tables = await getAllTables();
    
    // Mock availability based on the time of day
    const checkDate = new Date(dateTime);
    const hour = checkDate.getHours();
    
    // Determine busyness based on time of day
    // Busy hours: 12-2pm (lunch) and 6-8pm (dinner)
    const isPeakHour = (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20);
    const isWeekend = checkDate.getDay() === 0 || checkDate.getDay() === 6;
    const busynessFactor = isPeakHour ? (isWeekend ? 0.8 : 0.6) : 0.3;
    
    const mockAvailability = {};
    tables.forEach(table => {
      // More tables reserved during peak hours
      mockAvailability[table.table_no] = Math.random() > busynessFactor ? 'Available' : 'Reserved';
    });
    
    return mockAvailability;
  } catch (error) {
    console.error('Error checking tables availability:', error);
    // Return empty map on error
    return {};
  }
};

// Manually check server connection (for retry button)
export const checkServerConnection = async () => {
  return await checkServerAvailability();
};
