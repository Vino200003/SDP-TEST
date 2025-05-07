import { API_URL } from '../config/constants';
import { 
  mockReservations, 
  mockStats, 
  generateMockReservations, 
  generateMockStats,
  serverStatus,
  checkServerAvailability
} from '../utils/mockData';

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
    
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    
    console.log('Server URL:', `${API_URL}/api/reservations?${queryString}`);
    console.log('Token available:', !!token);
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
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
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
    }
    
    // Use regular reservation endpoint as fallback
    const response = await fetch(`${API_URL}/api/reservations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn(`Fallback API response not OK: ${response.status} ${response.statusText}`);
      return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
    }
    
    // The regular endpoint might not return pagination, so adapt the response
    const reservations = await response.json();
    return { 
      reservations,
      pagination: { 
        page: 1, 
        limit: reservations.length, 
        total: reservations.length, 
        pages: 1 
      }
    };
  } catch (error) {
    console.error('Fallback reservation service error:', error);
    return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
  }
};

// Get reservation stats
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
    
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      console.warn('No authentication token available');
      return mockStats;
    }
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
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

// Get a single reservation by ID
export const getReservationById = async (reservationId) => {
  try {
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/admin/reservations/${reservationId}`, {
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
    
    // If server is down, return a mocked successful response
    if (!isServerAvailable) {
      console.log('Server is unavailable, simulating status update');
      return {
        message: 'Reservation status updated successfully (simulated)',
        reservation_id: reservationId,
        status: newStatus
      };
    }
    
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_URL}/api/reservations/${reservationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update reservation status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update reservation status service error:', error);
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    // For status updates, we'll simulate a successful response
    return {
      message: 'Reservation status updated successfully (simulated)',
      reservation_id: reservationId,
      status: newStatus
    };
  }
};

// Get all tables (or mock tables if server is down)
export const getAllTables = async () => {
  try {
    // If we know server is down, return mock tables immediately
    if (!isServerAvailable && !shouldAttemptReconnect()) {
      return Array.from({ length: 10 }, (_, i) => ({
        table_no: i + 1,
        capacity: Math.floor(Math.random() * 6) + 2,
        status: 'Available'
      }));
    }
    
    // Use a timeout to prevent hanging for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
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
      status: 'Available'
    }));
  }
};

// Manually check server connection (for retry button)
export const checkServerConnection = async () => {
  return await checkServerAvailability();
};
