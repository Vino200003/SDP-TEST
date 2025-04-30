/**
 * API utility functions for making requests to the backend
 */

// Base URL for API requests - using relative path with proxy
const API_URL = '/api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Response from the API
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('API error during registration:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @returns {Promise} - Response from the API
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store the token automatically if it's present
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    console.error('API error during login:', error);
    throw error;
  }
};

/**
 * Check authentication status
 * @returns {Promise} - Response with user data if authenticated
 */
export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed');
    }
    
    return data;
  } catch (error) {
    console.error('API error during authentication check:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} - Response from the API
 */
export const logoutUser = async () => {
  try {
    localStorage.removeItem('token');
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

/**
 * Get all menu items
 * @returns {Promise} - Response with menu data
 */
export const getAllMenuItems = async () => {
  try {
    const response = await fetch(`${API_URL}/menu`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch menu items');
    }
    
    return data;
  } catch (error) {
    console.error('API error fetching menu items:', error);
    throw error;
  }
};

/**
 * Get menu categories
 * @returns {Promise} - Response with menu categories
 */
export const getMenuCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/menu/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch menu categories');
    }
    
    return data;
  } catch (error) {
    console.error('API error fetching menu categories:', error);
    throw error;
  }
};

/**
 * Get menu items by category
 * @param {string} categoryCode - Category code to filter by
 * @returns {Promise} - Response with filtered menu items
 */
export const getMenuItemsByCategory = async (categoryCode) => {
  try {
    const response = await fetch(`${API_URL}/menu/category/${categoryCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch category items');
    }
    
    return data;
  } catch (error) {
    console.error('API error fetching category items:', error);
    throw error;
  }
};

/**
 * Get all available tables
 * @returns {Promise} - Response with table data
 */
export const getAllTables = async () => {
  try {
    const response = await fetch(`${API_URL}/reservations/tables`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch tables');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API error fetching tables:', error);
    throw error;
  }
};

/**
 * Get available tables for a specific date/time
 * @param {string} dateTime - ISO datetime string
 * @returns {Promise} - Response with available tables
 */
export const getAvailableTables = async (dateTime) => {
  try {
    const response = await fetch(`${API_URL}/reservations/available-tables?dateTime=${encodeURIComponent(dateTime)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch available tables');
    }
    
    return data;
  } catch (error) {
    console.error('API error fetching available tables:', error);
    throw error;
  }
};

/**
 * Create a new reservation
 * @param {Object} reservationData - Reservation details
 * @returns {Promise} - Response from the API
 */
export const createReservation = async (reservationData) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['x-auth-token'] = token;
    }
    
    const response = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reservationData),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create reservation');
    }
    
    return data;
  } catch (error) {
    console.error('API error creating reservation:', error);
    throw error;
  }
};

/**
 * Get user's profile
 * @returns {Promise} - Response with user profile data
 */
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }
    
    return data;
  } catch (error) {
    console.error('API error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user's profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} - Response with updated profile data
 */
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(profileData),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user profile');
    }
    
    return data;
  } catch (error) {
    console.error('API error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user's reservations
 * @returns {Promise} - Response with user's reservations
 */
export const getUserReservations = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/reservations/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user reservations');
    }
    
    return data;
  } catch (error) {
    console.error('API error fetching user reservations:', error);
    throw error;
  }
};

/**
 * Check if a user is currently authenticated
 * @returns {boolean} - True if user is authenticated, false otherwise
 */
export const isUserAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // Convert to boolean
};
