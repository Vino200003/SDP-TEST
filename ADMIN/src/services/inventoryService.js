import { API_URL } from '../config/constants';
import { 
  mockInventoryItems, 
  mockInventoryCategories, 
  mockSuppliers,
  generateMockInventoryStats,
  serverStatus,
  checkServerAvailability
} from '../utils/mockData';

// Get all inventory items with optional filters
export const getAllInventoryItems = async (filters = {}) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use mock data
    if (!isServerAvailable) {
      console.log('Using mock inventory data (server unavailable)');
      
      // Apply filters to mock data
      let filteredItems = [...mockInventoryItems];
      
      if (filters.status) {
        filteredItems = filteredItems.filter(item => 
          item.status === filters.status
        );
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.supplier_id) {
        filteredItems = filteredItems.filter(item => 
          item.supplier_id === parseInt(filters.supplier_id)
        );
      }
      
      // Sort if needed
      if (filters.sortBy) {
        filteredItems.sort((a, b) => {
          if (filters.sortOrder === 'desc') {
            return b[filters.sortBy] > a[filters.sortBy] ? 1 : -1;
          }
          return a[filters.sortBy] > b[filters.sortBy] ? 1 : -1;
        });
      }
      
      // Combine with supplier info
      filteredItems = filteredItems.map(item => {
        const supplier = mockSuppliers.find(s => s.supplier_id === item.supplier_id);
        return {
          ...item,
          supplier_name: supplier ? supplier.name : 'Unknown'
        };
      });
      
      return {
        items: filteredItems,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: filteredItems.length,
          pages: Math.ceil(filteredItems.length / (filters.limit || 10))
        }
      };
    }

    // Server is available, make the real request
    console.log('Server is available, making real API request for inventory');

    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const queryString = queryParams.toString();
    
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory?${queryString}`, {
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
    console.error('Inventory service error:', error);
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    // Return mock data as fallback
    return {
      items: mockInventoryItems,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: mockInventoryItems.length,
        pages: Math.ceil(mockInventoryItems.length / (filters.limit || 10))
      }
    };
  }
};

// Get inventory statistics
export const getInventoryStats = async () => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use mock stats
    if (!isServerAvailable) {
      console.log('Using mock inventory stats (server unavailable)');
      return generateMockInventoryStats();
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory/stats`, {
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
    console.error('Inventory stats service error:', error);
    
    // Update server status
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    // Return mock stats as fallback
    return generateMockInventoryStats();
  }
};

// Get a single inventory item by ID
export const getInventoryItemById = async (itemId) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, use mock data
    if (!isServerAvailable) {
      console.log('Using mock inventory item (server unavailable)');
      const item = mockInventoryItems.find(item => item.inventory_id === parseInt(itemId));
      if (!item) throw new Error('Item not found');
      return item;
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory/${itemId}`, {
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
    console.error('Get inventory item service error:', error);
    
    // If server is down and error is not "Item not found", update server status
    if (error.message !== 'Item not found') {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Create a new inventory item - adapted to match schema
export const createInventoryItem = async (itemData) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, simulate creating an item with mock data
    if (!isServerAvailable) {
      console.log('Simulating create inventory item (server unavailable)');
      
      // Create new ID (max existing ID + 1)
      const newId = Math.max(...mockInventoryItems.map(item => item.inventory_id)) + 1;
      
      const newItem = {
        inventory_id: newId,
        name: itemData.name,
        quantity: itemData.quantity,
        unit: itemData.unit,
        manu_date: itemData.manu_date,
        exp_date: itemData.exp_date,
        status: itemData.status || 'available',
        supplier_id: itemData.supplier_id
      };
      
      // Add to mock data
      mockInventoryItems.push(newItem);
      
      // Add supplier info
      const supplier = mockSuppliers.find(s => s.supplier_id === newItem.supplier_id);
      
      return {
        ...newItem,
        supplier_name: supplier ? supplier.name : 'Unknown'
      };
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create inventory item');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create inventory item service error:', error);
    
    // Update server status if network error
    if (error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Update an inventory item
export const updateInventoryItem = async (itemId, itemData) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, simulate updating an item with mock data
    if (!isServerAvailable) {
      console.log('Simulating update inventory item (server unavailable)');
      
      const index = mockInventoryItems.findIndex(item => item.inventory_id === parseInt(itemId));
      if (index === -1) throw new Error('Item not found');
      
      // Determine status based on quantity and reorder level
      let status = 'In Stock';
      if (itemData.quantity === 0) {
        status = 'Out of Stock';
      } else if (itemData.quantity <= itemData.reorder_level) {
        status = 'Low Stock';
      }
      
      // Update the item
      mockInventoryItems[index] = {
        ...mockInventoryItems[index],
        ...itemData,
        status
      };
      
      return mockInventoryItems[index];
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update inventory item');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update inventory item service error:', error);
    
    // Update server status if network error
    if (error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Delete an inventory item
export const deleteInventoryItem = async (itemId) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
    // If server is down, simulate deleting an item from mock data
    if (!isServerAvailable) {
      console.log('Simulating delete inventory item (server unavailable)');
      
      const index = mockInventoryItems.findIndex(item => item.inventory_id === parseInt(itemId));
      if (index === -1) throw new Error('Item not found');
      
      // Remove the item
      mockInventoryItems.splice(index, 1);
      
      return { message: 'Item deleted successfully' };
    }
    
    // Server is available, make the real request
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete inventory item');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete inventory item service error:', error);
    
    // Update server status if network error
    if (error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Get all inventory categories
export const getInventoryCategories = async () => {
  try {
    const isServerAvailable = await checkServerAvailability();
    
    if (!isServerAvailable) {
      return mockInventoryCategories;
    }
    
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory/categories`, {
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
    console.error('Get inventory categories service error:', error);
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    return mockInventoryCategories;
  }
};

// Get all suppliers
export const getSuppliers = async () => {
  try {
    const isServerAvailable = await checkServerAvailability();
    
    if (!isServerAvailable) {
      return mockSuppliers;
    }
    
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/suppliers`, {
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
    console.error('Get suppliers service error:', error);
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    return mockSuppliers;
  }
};

// Update inventory quantity (for quick updates)
export const updateInventoryQuantity = async (itemId, newQuantity) => {
  try {
    const isServerAvailable = await checkServerAvailability();
    
    if (!isServerAvailable) {
      console.log('Simulating quantity update (server unavailable)');
      
      const index = mockInventoryItems.findIndex(item => item.inventory_id === parseInt(itemId));
      if (index === -1) throw new Error('Item not found');
      
      // Update the quantity
      mockInventoryItems[index] = {
        ...mockInventoryItems[index],
        quantity: newQuantity,
        status: newQuantity === 0 ? 'not_available' : mockInventoryItems[index].status
      };
      
      // Add supplier info for consistency
      const supplier = mockSuppliers.find(s => s.supplier_id === mockInventoryItems[index].supplier_id);
      
      return {
        ...mockInventoryItems[index],
        supplier_name: supplier ? supplier.name : 'Unknown'
      };
    }
    
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/inventory/${itemId}/quantity`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: newQuantity })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update inventory quantity');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update inventory quantity service error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};
