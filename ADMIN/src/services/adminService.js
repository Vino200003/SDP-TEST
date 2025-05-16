import axios from 'axios';
import { API_URL } from '../config/constants';

// Create configured axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token; // For backward compatibility
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login admin
export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post('/api/admin/login', { email, password });
    
    // Save token and admin info to localStorage
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
    }
    
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Logout admin
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminInfo');
};

// Get admin profile
export const getAdminProfile = async () => {
  try {
    const response = await api.get('/api/admin/settings/profile');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update admin profile
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await api.put('/api/admin/settings/profile', profileData);
    
    // Update admin info in localStorage
    if (response.data.admin) {
      localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
    }
    
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Change admin password
export const changeAdminPassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/api/admin/settings/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Create a new admin user
export const createNewAdmin = async (adminData) => {
  try {
    const response = await api.post('/api/admin/create', adminData);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get all admins
export const getAllAdmins = async () => {
  try {
    const response = await api.get('/api/admin/settings/all-admins');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Delete an admin
export const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/api/admin/settings/delete/${adminId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Check if current admin is the super admin
export const checkSuperAdminStatus = async () => {
  try {
    const response = await api.get('/api/admin/settings/super-admin-check');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Other admin related functions can be added here

// Helper function to handle errors
const handleError = (error) => {
  console.error("API Error:", error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.status === 401) {
      // Unauthorized - clear localStorage and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/login';
    }
    
    return {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred',
      ...error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server. Please check your internet connection.'
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message
    };
  }
};
