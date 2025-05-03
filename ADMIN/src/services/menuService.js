import axios from 'axios';

// Update the API_URL to match your backend
const API_URL = 'http://localhost:5000/api'; // Ensure this matches your backend URL

// If your backend doesn't include '/api' prefix, change this to:
// const API_URL = 'http://localhost:5000';

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
    const response = await apiClient.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
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

export const createMenuItem = async (menuItemData) => {
  try {
    const response = await apiClient.post('/menu', menuItemData);
    return response.data;
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }
};

export const updateMenuItem = async (id, menuItemData) => {
  try {
    const response = await apiClient.put(`/menu/${id}`, menuItemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating menu item ${id}:`, error);
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
