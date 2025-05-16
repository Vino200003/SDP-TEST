/**
 * Utility functions for generating reports and handling admin data
 */

// Get admin name from local storage
exports.getAdminName = () => {
  try {
    const adminInfo = localStorage.getItem('adminInfo');
    if (!adminInfo) return 'Admin';
    
    const admin = JSON.parse(adminInfo);
    if (admin.first_name && admin.last_name) {
      return `${admin.first_name} ${admin.last_name}`;
    } else if (admin.first_name) {
      return admin.first_name;
    } else if (admin.email) {
      // If no name, use email before @ symbol
      return admin.email.split('@')[0];
    }
    
    return 'Admin';
  } catch (error) {
    console.error('Error parsing admin info:', error);
    return 'Admin';
  }
};

// Format currency for reports
exports.formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date for reports
exports.formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format time for reports
exports.formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Time';
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date and time for reports
exports.formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date/Time';
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validate menu items in an order
exports.validateOrderItems = async (orderItems, MenuItem) => {
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    throw new Error('No order items provided');
  }
  
  // Extract all menu item IDs from the order
  const menuItemIds = orderItems.map(item => item.menuItemId);
  
  // Find all menu items in the database
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
  
  // Check if all menu items were found
  if (menuItems.length !== menuItemIds.length) {
    throw new Error('One or more menu items not found');
  }
  
  return menuItems;
};