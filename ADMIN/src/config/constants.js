/**
 * Application constants
 */

// API URL configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Authentication settings
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'admin_user';

// Other app settings
export const APP_TITLE = 'Restaurant Admin';
export const DEFAULT_ITEMS_PER_PAGE = 10;

// Other constants
export const APP_NAME = 'Restaurant Admin';
export const APP_VERSION = '1.0.0';

// Other constants can be added here as needed
export const ORDER_STATUSES = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const ORDER_TYPES = {
  DELIVERY: 'Delivery',
  TAKEAWAY: 'Takeaway',
  DINE_IN: 'Dine-in'
};

// Table pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Role options for staff
export const STAFF_ROLES = [
  { value: 'waiter', label: 'Waiter' },
  { value: 'chef', label: 'Chef' },
  { value: 'delivery', label: 'Delivery' }
];

// Format date to local string
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};
