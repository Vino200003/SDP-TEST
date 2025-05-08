/**
 * Application constants
 */

// API URL - adjust based on your backend setup
export const API_URL = 'http://localhost:5000';

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
