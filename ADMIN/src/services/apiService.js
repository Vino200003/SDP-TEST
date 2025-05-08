import { API_URL } from '../config/constants';

// This service helps make authenticated API calls
// It will be initialized with the token getter from AuthContext
let getAuthToken = null;

export const initializeApiService = (tokenGetter) => {
  getAuthToken = tokenGetter;
};

// Generic request function with authentication
export const request = async (endpoint, options = {}) => {
  try {
    if (!getAuthToken) {
      console.warn('Auth token getter not initialized. API calls may fail.');
    }
    
    const token = getAuthToken ? getAuthToken() : null;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });
    
    // Handle 401 Unauthorized by triggering a logout event
    if (response.status === 401) {
      // Dispatch a custom event that can be caught to log the user out
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
    throw error;
  }
};

// Helper methods for common request types
export const get = (endpoint) => request(endpoint, { method: 'GET' });

export const post = (endpoint, data) => request(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
});

export const put = (endpoint, data) => request(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});

export const patch = (endpoint, data) => request(endpoint, {
  method: 'PATCH',
  body: JSON.stringify(data)
});

export const del = (endpoint) => request(endpoint, { method: 'DELETE' });
