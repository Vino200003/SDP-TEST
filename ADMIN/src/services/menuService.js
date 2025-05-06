import axios from 'axios';

// Update the API_URL to match your backend and export it
export const API_URL = 'http://localhost:5000/api'; // Ensure this matches your backend URL

// If your backend doesn't include '/api' prefix, change this to:
// export const API_URL = 'http://localhost:5000';

// Create axios instance with base settings
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Menu Items
export const getAllMenuItems = async () => {
  try {
    console.log('Fetching menu items from:', `${API_URL}/menu`); // Add this for debugging
    const response = await apiClient.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    // More detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    }
    throw error;
  }
};

export const getMenuItemById = async (id) => {
  try {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu item ${id}:`, error);
    throw error;
  }
};

// Update the createMenuItem function to include image_path
export const createMenuItem = async (menuItemData) => {
  try {
    // Ensure both image fields are included if they exist
    const dataToSend = {
      ...menuItemData,
      image_url: menuItemData.image_url || null,
      image_path: menuItemData.image_path || null
    };
    
    const response = await apiClient.post('/menu', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }
};

// Update the updateMenuItem function to include image_path and handle nulls
export const updateMenuItem = async (id, menuItemData) => {
  try {
    // Clean the data to prevent null values
    const cleanedData = {
      menu_name: menuItemData.menu_name || '',
      price: menuItemData.price || 0,
      status: menuItemData.status || 'available',
      // Convert empty strings to null for foreign keys to avoid DB errors
      category_code: menuItemData.category_code || null,
      subcategory_code: menuItemData.subcategory_code || null,
      image_url: menuItemData.image_url || null,
      image_path: menuItemData.image_path || null
    };
    
    console.log('Updating menu item with data:', cleanedData);
    
    const response = await apiClient.put(`/menu/${id}`, cleanedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating menu item ${id}:`, error);
    // Enhanced error logging
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

export const deleteMenuItem = async (id) => {
  try {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting menu item ${id}:`, error);
    throw error;
  }
};

// Update the updateMenuItemStatus function with better error handling
export const updateMenuItemStatus = async (id, status) => {
  try {
    // Validate status
    if (!['available', 'out_of_stock'].includes(status)) {
      throw new Error('Invalid status. Status must be either "available" or "out_of_stock"');
    }
    
    const response = await apiClient.patch(`/menu/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating menu item status for item ${id}:`, error);
    // Enhanced error logging
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

export const getMenuItemsByStatus = async (status) => {
  try {
    const response = await apiClient.get(`/menu?status=${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu items with status ${status}:`, error);
    throw error;
  }
};

// Categories
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/menu/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/menu/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/menu/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await apiClient.delete(`/menu/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};

// Subcategories
export const getSubcategoriesByCategory = async (categoryCode) => {
  try {
    const response = await apiClient.get(`/menu/subcategories/${categoryCode}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching subcategories for category ${categoryCode}:`, error);
    throw error;
  }
};

export const getAllSubcategories = async () => {
  try {
    const response = await apiClient.get('/menu/subcategories');
    return response.data;
  } catch (error) {
    console.error('Error fetching all subcategories:', error);
    throw error;
  }
};

export const createSubcategory = async (subcategoryData) => {
  try {
    const response = await apiClient.post('/menu/subcategories', subcategoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }
};

export const updateSubcategory = async (id, subcategoryData) => {
  try {
    const response = await apiClient.put(`/menu/subcategories/${id}`, subcategoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating subcategory ${id}:`, error);
    throw error;
  }
};

export const deleteSubcategory = async (id) => {
  try {
    const response = await apiClient.delete(`/menu/subcategories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting subcategory ${id}:`, error);
    throw error;
  }
};
