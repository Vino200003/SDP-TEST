import { API_URL } from '../config/constants';
import { 
  mockInventoryItems, 
  mockInventoryCategories,
  generateMockInventoryStats,
  serverStatus,
  checkServerAvailability
} from '../utils/mockData';

// Create a local mock suppliers array to use when server is unavailable (sorted by ID)
const fallbackSuppliers = [
  { supplier_id: 1, name: "Quality Foods Ltd", contact_number: "0112345678", email: "info@qualityfoods.com", address: "123 Main St, Colombo", status: "active" },
  { supplier_id: 2, name: "Fresh Farms Inc", contact_number: "0775566778", email: "orders@freshfarms.lk", address: "45 Farm Road, Kandy", status: "active" },
  { supplier_id: 3, name: "Green Harvest Ltd", contact_number: "0114567890", email: "sales@greenharvest.com", address: "78 Garden Ave, Galle", status: "active" },
  { supplier_id: 4, name: "Mediterranean Imports", contact_number: "0776655443", email: "imports@mediterranean.lk", address: "90 Import Drive, Colombo", status: "active" },
  { supplier_id: 5, name: "Bakers Supply Co", contact_number: "0112223344", email: "supply@bakerssupply.com", address: "12 Baker Street, Negombo", status: "inactive" }
].sort((a, b) => a.supplier_id - b.supplier_id);

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
      
      // Combine with fallback supplier info instead of mockSuppliers
      filteredItems = filteredItems.map(item => {
        const supplier = fallbackSuppliers.find(s => s.supplier_id === item.supplier_id);
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
      const supplier = fallbackSuppliers.find(s => s.supplier_id === newItem.supplier_id);
      
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

// Update an inventory item - using only valid status values from the database schema
export const updateInventoryItem = async (itemId, itemData) => {
  try {
    // Check server availability first
    const isServerAvailable = await checkServerAvailability();
    
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
    console.log('Updating inventory item ID:', itemId, 'with data:', itemData);
    
    // Create the data object for the update
    const updateData = {
      name: itemData.name || "",
      unit: itemData.unit || ""
    };
    
    // Add numeric fields
    if (itemData.quantity !== undefined) {
      updateData.quantity = Number(itemData.quantity);
    }
    
    if (itemData.price_per_unit !== undefined) {
      updateData.price_per_unit = Number(itemData.price_per_unit);
    }
    
    if (itemData.supplier_id) {
      updateData.supplier_id = Number(itemData.supplier_id);
    }
    
    // Handle date fields
    if (itemData.exp_date) {
      try {
        const date = new Date(itemData.exp_date);
        updateData.exp_date = date.toISOString().split('T')[0];
      } catch (e) {
        console.warn('Invalid exp_date format, skipping field');
      }
    }
    
    if (itemData.manu_date) {
      try {
        const date = new Date(itemData.manu_date);
        updateData.manu_date = date.toISOString().split('T')[0];
      } catch (e) {
        console.warn('Invalid manu_date format, skipping field');
      }
    }
    
    if (itemData.purchase_date) {
      try {
        const date = new Date(itemData.purchase_date);
        updateData.purchase_date = date.toISOString().split('T')[0];
      } catch (e) {
        console.warn('Invalid purchase_date format, skipping field');
      }
    }
    
    // Add batch_no if provided
    if (itemData.batch_no) {
      updateData.batch_no = String(itemData.batch_no);
    }
    
    // Map frontend status values to valid database ENUM values
    // The database ENUM only allows: 'available', 'expired', 'used'
    if (itemData.status) {
      console.log('Original status from frontend:', itemData.status);
      
      switch(itemData.status) {
        case 'available':
          updateData.status = 'available';
          break;
        case 'not_available':
        case 'unavailable':
          updateData.status = 'used'; // Map unavailable to used
          break;
        case 'expired':
          updateData.status = 'expired';
          break;
        case 'used':
          updateData.status = 'used'; // Explicitly handle 'used' status
          break;
        default:
          // Don't include invalid status values
          console.warn(`Status value '${itemData.status}' is not valid, using default`);
          break;
      }
      
      console.log('Mapped status for database:', updateData.status);
    }
    
    console.log('Sending update with valid data:', updateData);
    
    const token = localStorage.getItem('adminToken');
    
    // Send the update with correct status values
    const response = await fetch(`${API_URL}/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    // Log response details
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      // Handle error response
      const errorText = await response.text();
      console.error('Error response text:', errorText);
      throw new Error('Error updating inventory item');
    }
    
    // If the update was successful, log the response
    if (response.ok) {
      const responseData = await response.json();
      console.log('Update response:', responseData);
      return responseData;
    } else {
      // ...existing error handling...
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

// Get all suppliers - updated to improve error handling and server availability check
export const getSuppliers = async () => {
  try {
    // Force check server availability
    const isServerAvailable = await checkServerAvailability(true);
    
    if (!isServerAvailable) {
      console.log('Using fallback suppliers data (server unavailable)');
      return fallbackSuppliers; // Already sorted by ID
    }
    
    console.log('Fetching suppliers from database...');
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/suppliers`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server error response:', errorData);
      throw new Error(errorData.message || `Server returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched suppliers:', data);
    
    // Sort suppliers by ID before returning
    return data.sort((a, b) => a.supplier_id - b.supplier_id);
  } catch (error) {
    console.error('Get suppliers service error:', error);
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    
    // Return fallback suppliers instead of empty array
    return fallbackSuppliers; // Already sorted by ID
  }
};

// Create a new supplier - updated to use fallback implementation when server is unavailable
export const createSupplier = async (supplierData) => {
  try {
    const isServerAvailable = await checkServerAvailability();
    
    if (!isServerAvailable) {
      console.log('Simulating create supplier (server unavailable)');
      
      // Create a new supplier with mock implementation
      const newId = Math.max(...fallbackSuppliers.map(s => s.supplier_id)) + 1;
      const newSupplier = {
        ...supplierData,
        supplier_id: newId
      };
      
      // Add to fallback suppliers list
      fallbackSuppliers.push(newSupplier);
      
      return newSupplier;
    }
    
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/suppliers`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(supplierData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create supplier');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create supplier service error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Update a supplier - updated to use fallback implementation when server is unavailable
export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const isServerAvailable = await checkServerAvailability();
    
    if (!isServerAvailable) {
      console.log('Simulating update supplier (server unavailable)');
      
      const index = fallbackSuppliers.findIndex(s => s.supplier_id === parseInt(supplierId));
      if (index === -1) throw new Error('Supplier not found');
      
      // Update the supplier in fallback list
      fallbackSuppliers[index] = {
        ...fallbackSuppliers[index],
        ...supplierData,
        supplier_id: parseInt(supplierId)
      };
      
      return fallbackSuppliers[index];
    }
    
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/suppliers/${supplierId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(supplierData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update supplier');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update supplier service error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
  }
};

// Delete a supplier - updated to use fallback implementation when server is unavailable
export const deleteSupplier = async (supplierId) => {
  try {
    const isServerAvailable = await checkServerAvailability();
    
    if (!isServerAvailable) {
      console.log('Simulating delete supplier (server unavailable)');
      
      // Check if any mock inventory items use this supplier
      const isUsed = mockInventoryItems.some(item => item.supplier_id === parseInt(supplierId));
      
      if (isUsed) {
        throw new Error('Cannot delete supplier with inventory items. Reassign or delete the items first.');
      }
      
      const index = fallbackSuppliers.findIndex(s => s.supplier_id === parseInt(supplierId));
      if (index === -1) throw new Error('Supplier not found');
      
      // Remove the supplier from fallback list
      fallbackSuppliers.splice(index, 1);
      
      return { message: 'Supplier deleted successfully' };
    }
    
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_URL}/api/suppliers/${supplierId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete supplier');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Delete supplier service error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      serverStatus.isAvailable = false;
      serverStatus.lastChecked = Date.now();
    }
    
    throw error;
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
      
      // Add supplier info for consistency - use fallbackSuppliers instead of mockSuppliers
      const supplier = fallbackSuppliers.find(s => s.supplier_id === mockInventoryItems[index].supplier_id);
      
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
