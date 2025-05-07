import { API_URL } from '../config/constants';

// Get all reservations with optional filters
export const getAllReservations = async (params = {}) => {
  try {
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
    
    if (!token) {
      console.error('Authentication required for fetching reservations');
      return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
    }
    
    const response = await fetch(`${API_URL}/api/admin/reservations${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // If API endpoint doesn't exist yet (404) or other error, return empty data
    if (!response.ok) {
      console.warn(`API response not OK: ${response.status} ${response.statusText}`);
      return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Reservation service error:', error);
    // Return empty data structure on error
    return { reservations: [], pagination: { page: 1, limit: params.limit || 10, total: 0, pages: 1 } };
  }
};

// Get reservation stats
export const getReservationStats = async (startDate = '', endDate = '') => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/admin/reservations/stats${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      // If the API endpoint doesn't exist, return default stats
      if (response.status === 404) {
        console.warn('Reservation stats endpoint not found, returning default stats');
        return {
          total_reservations: 0,
          upcoming_reservations: 0,
          completed_reservations: 0,
          cancelled_reservations: 0
        };
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reservation stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Reservation stats service error:', error);
    // Return default stats on error
    return {
      total_reservations: 0,
      upcoming_reservations: 0,
      completed_reservations: 0,
      cancelled_reservations: 0
    };
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
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/admin/reservations/${reservationId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update reservation status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update reservation status service error:', error);
    throw error;
  }
};

// Get all tables
export const getAllTables = async () => {
  try {
    // Get admin token from localStorage
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/admin/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch tables');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get tables service error:', error);
    return [];
  }
};
