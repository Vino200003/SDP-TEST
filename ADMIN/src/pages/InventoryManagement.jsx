import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  getAllInventoryItems, 
  getInventoryStats, 
  getSuppliers,
  updateInventoryQuantity,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../services/inventoryService';
import { serverStatus, checkServerAvailability } from '../utils/mockData';
import '../styles/InventoryManagement.css';

function InventoryManagement() {
  // State for inventory items
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isServerDown, setIsServerDown] = useState(false);
  const [inventoryStats, setInventoryStats] = useState({
    total_items: 0,
    available: 0,
    not_available: 0,
    expired: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // State for modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  // New inventory item form state
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0.00,
    unit: 'kg',
    price_per_unit: 0.00,
    manu_date: '',
    exp_date: '',
    purchase_date: '',
    batch_no: '',
    status: 'available',
    supplier_id: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    supplier_id: '',
    sortBy: 'inventory_id', // Changed from 'name' to 'inventory_id'
    sortOrder: 'asc',
    page: 1,
    limit: 10
  });

  // Simple notification function
  const notify = (message, type = 'info') => {
    console.log(`[${type}] ${message}`);
    alert(message);
  };

  // Fetch inventory items and stats on component mount
  useEffect(() => {
    fetchInventoryItems();
    fetchInventoryStats();
    fetchSuppliers();
  }, []);

  // Fetch inventory items when filters change
  useEffect(() => {
    fetchInventoryItems();
  }, [filters.page, filters.limit, filters.status, filters.supplier_id, filters.sortBy, filters.sortOrder]);

  // Apply search filter locally
  useEffect(() => {
    if (filters.search) {
      applySearchFilter();
    } else {
      setFilteredItems(inventoryItems);
    }
  }, [filters.search, inventoryItems]);

  // Update server status state when the status changes
  useEffect(() => {
    setIsServerDown(!serverStatus.isAvailable);
  }, [serverStatus.isAvailable]);

  const fetchInventoryItems = async () => {
    setIsLoading(true);
    try {
      const data = await getAllInventoryItems({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        supplier_id: filters.supplier_id,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      // Update server status based on if we got mock data or real data
      setIsServerDown(!serverStatus.isAvailable);
      
      if (data.items) {
        setInventoryItems(data.items);
        setFilteredItems(data.items);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        // If the API returns an array instead of an object with pagination
        setInventoryItems(Array.isArray(data) ? data : []);
        setFilteredItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      notify(`Error fetching inventory items: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      const data = await getInventoryStats();
      // Update server status based on result
      setIsServerDown(!serverStatus.isAvailable);
      setInventoryStats({
        total_items: data.total_items || 0,
        available: data.available || 0,
        not_available: data.not_available || 0,
        expired: data.expired || 0
      });
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      setInventoryStats({
        total_items: 0,
        available: 0,
        not_available: 0,
        expired: 0
      });
    }
  };

  // Update the fetchSuppliers function to include better error handling and feedback
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching suppliers...');
      const suppliersData = await getSuppliers();
      console.log('Suppliers data received:', suppliersData);
      setSuppliers(suppliersData);
      
      if (suppliersData.length === 0) {
        notify('No suppliers found. You may need to add some suppliers.', 'warning');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      notify(`Failed to load suppliers: ${error.message}`, 'error');
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry connection button from the notifier
  const handleRetryConnection = async () => {
    console.log('Retrying server connection...');
    const isAvailable = await checkServerAvailability();
    setIsServerDown(!isAvailable);
    if (isAvailable) {
      // Refresh data with real data from server
      await fetchInventoryItems();
      await fetchInventoryStats();
      notify('Server connection restored! Using real data now.', 'success');
    } else {
      notify('Server is still unavailable. Continuing with mock data.', 'warning');
    }
  };

  const handleRetrySuppliers = async () => {
    notify('Retrying connection to supplier service...', 'info');
    setIsLoading(true);
    
    try {
      const isAvailable = await checkServerAvailability();
      if (isAvailable) {
        await fetchSuppliers();
        notify('Successfully connected to supplier service!', 'success');
      } else {
        notify('Server is still unavailable. Please try again later.', 'warning');
      }
    } catch (error) {
      console.error('Error in retry:', error);
      notify('Connection failed. Please check server status.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchFilter = () => {
    const searchLower = filters.search.toLowerCase();
    
    const result = inventoryItems.filter(item => {
      // If empty search term, return all results
      if (!searchLower.trim()) return true;
      
      // Search in item name and supplier
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.supplier_name.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredItems(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      // Reset to page 1 when changing filters (except when changing the page itself)
      page: name === 'page' ? value : 1
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      supplier_id: '',
      sortBy: 'inventory_id', // Changed from 'name' to 'inventory_id'
      sortOrder: 'asc',
      page: 1,
      limit: 10
    });
  };

  // Handle sorting when clicking on table headers
  const handleSort = (column) => {
    setFilters({
      ...filters,
      sortBy: column,
      sortOrder: filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    });
  };

  // Handle quantity adjustment
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 0) return; // Prevent negative quantities
    
    try {
      setIsLoading(true);
      await updateInventoryQuantity(itemId, newQuantity);
      
      // Update local state
      const updatedItems = inventoryItems.map(item => 
        item.inventory_id === itemId 
          ? {
              ...item,
              quantity: newQuantity,
              status: newQuantity === 0 
                ? 'not_available' 
                : newQuantity <= item.reorder_level 
                  ? 'low_stock' 
                  : 'available'
            } 
          : item
      );
      
      setInventoryItems(updatedItems);
      setFilteredItems(updatedItems);
      
      // Refresh stats
      fetchInventoryStats();
      
      notify(`Quantity updated successfully`, 'success');
    } catch (error) {
      console.error('Error updating quantity:', error);
      notify(`Error updating quantity: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add new item
  const handleAddItem = async () => {
    try {
      // Validate form
      if (!newItem.name || !newItem.supplier_id || !newItem.unit) {
        notify('Please fill in all required fields.', 'error');
        return;
      }
      
      setIsLoading(true);
      const result = await createInventoryItem(newItem);
      
      // Add the new item to the list
      setInventoryItems([...inventoryItems, result]);
      setFilteredItems([...inventoryItems, result]);
      
      // Reset form
      setNewItem({
        name: '',
        quantity: 0,
        unit: 'kg',
        manu_date: '',
        exp_date: '',
        status: 'available',
        supplier_id: ''
      });
      
      // Close modal
      setIsAddModalOpen(false);
      
      // Refresh stats
      fetchInventoryStats();
      
      notify('Item added successfully', 'success');
    } catch (error) {
      console.error('Error adding item:', error);
      notify(`Error adding item: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Improve the handleEditItem function to ensure status is properly included
const handleEditItem = async () => {
  try {
    // Validate form
    if (!selectedItem.name || !selectedItem.supplier_id || !selectedItem.unit) {
      notify('Please fill in all required fields.', 'error');
      return;
    }
    
    setIsLoading(true);
    
    // Create a clean object with only the necessary fields
    const cleanedItem = {
      name: selectedItem.name,
      quantity: selectedItem.quantity,
      unit: selectedItem.unit,
      price_per_unit: selectedItem.price_per_unit,
      supplier_id: selectedItem.supplier_id,
      // Explicitly include the status to ensure it gets updated
      status: selectedItem.status
    };
    
    // Log what status we're sending
    console.log('Sending status update:', selectedItem.status);
    
    // Only include optional fields if they have values
    if (selectedItem.manu_date) {
      cleanedItem.manu_date = selectedItem.manu_date;
    }
    
    if (selectedItem.exp_date) {
      cleanedItem.exp_date = selectedItem.exp_date;
    }
    
    if (selectedItem.purchase_date) {
      cleanedItem.purchase_date = selectedItem.purchase_date;
    }
    
    if (selectedItem.batch_no) {
      cleanedItem.batch_no = selectedItem.batch_no;
    }
    
    if (selectedItem.reorder_level !== undefined) {
      cleanedItem.reorder_level = selectedItem.reorder_level;
    }
    
    // Log data being sent
    console.log('Sending update with data:', cleanedItem);
    
    // Make the API call with the cleaned data
    await updateInventoryItem(selectedItem.inventory_id, cleanedItem);
    
    // Close modal first to avoid any state issues
    setIsEditModalOpen(false);
    
    // Refresh the inventory list to get the updated item
    await fetchInventoryItems();
    
    // Refresh stats
    await fetchInventoryStats();
    
    notify('Item updated successfully', 'success');
  } catch (error) {
    console.error('Error updating item:', error);
    notify(`Error updating item: ${error.message || 'Unknown error occurred'}`, 'error');
  } finally {
    setIsLoading(false);
  }
};

  // Handle delete item
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      setIsLoading(true);
      await deleteInventoryItem(itemId);
      
      // Remove the item from the list
      const updatedItems = inventoryItems.filter(item => item.inventory_id !== itemId);
      setInventoryItems(updatedItems);
      setFilteredItems(updatedItems);
      
      // Refresh stats
      fetchInventoryStats();
      
      notify('Item deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      notify(`Error deleting item: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setFilters({
      ...filters,
      page: newPage
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  // Format date from ISO string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a date is expired
  const isExpired = (dateString) => {
    if (!dateString) return false;
    
    const expDate = new Date(dateString);
    const today = new Date();
    return expDate < today;
  };

  // Check if a date is approaching expiration (within 7 days)
  const isNearExpiry = (dateString) => {
    if (!dateString) return false;
    
    const expDate = new Date(dateString);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  // Get status badge class based on the status field
  const getStatusClass = (status) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'not_available': return 'status-not_available';
      case 'expired': return 'status-expired';
      default: return '';
    }
  };

  // Get date class based on expiry
  const getDateClass = (dateString) => {
    if (isExpired(dateString)) return 'date-expired';
    if (isNearExpiry(dateString)) return 'date-warning';
    return '';
  };
  
  // Find supplier name by ID
  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.supplier_id === parseInt(supplierId));
    return supplier ? supplier.name : 'Unknown';
  };

  // Add supplier management state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierView, setSupplierView] = useState('list'); // 'list', 'add', 'edit'
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact_number: '',
    email: '',
    address: '',
    status: 'active' // Default to active
  });

  // Add a specific function for the supplier management modal to refresh suppliers
  const refreshSuppliers = async () => {
    try {
      setIsLoading(true);
      await fetchSuppliers();
      notify('Supplier list refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing suppliers:', error);
      notify('Failed to refresh suppliers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this new function to handle opening the supplier modal with a fresh supplier list
  const handleOpenSupplierModal = async () => {
    setIsLoading(true);
    setSupplierView('list');
    setIsSupplierModalOpen(true);
    
    try {
      await fetchSuppliers();
    } catch (error) {
      console.error('Error fetching suppliers for modal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add these new functions for supplier management
  const handleAddSupplier = async () => {
    try {
      // Validate form
      if (!newSupplier.name || !newSupplier.contact_number) {
        notify('Supplier name and contact number are required.', 'error');
        return;
      }
      
      setIsLoading(true);
      
      // Create supplier using the API
      const result = await createSupplier(newSupplier);
      
      // Refresh suppliers from server
      await fetchSuppliers();
      
      // Reset form and go back to list view
      setNewSupplier({
        name: '',
        contact_number: '',
        email: '',
        address: '',
        status: 'active'
      });
      setSupplierView('list');
      
      notify('Supplier added successfully', 'success');
    } catch (error) {
      console.error('Error adding supplier:', error);
      notify(`Error adding supplier: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSupplier = async () => {
    try {
      // Validate form
      if (!selectedSupplier.name || !selectedSupplier.contact_number) {
        notify('Supplier name and contact number are required.', 'error');
        return;
      }
      
      setIsLoading(true);
      
      // Update supplier using the API
      await updateSupplier(selectedSupplier.supplier_id, selectedSupplier);
      
      // Refresh suppliers from server
      await fetchSuppliers();
      
      setSupplierView('list');
      
      notify('Supplier updated successfully', 'success');
    } catch (error) {
      console.error('Error updating supplier:', error);
      notify(`Error updating supplier: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    // Check if supplier is used by any inventory items
    const isUsed = inventoryItems.some(item => item.supplier_id === supplierId);
    
    if (isUsed) {
      notify('Cannot delete supplier that is used by inventory items. Please reassign the items first.', 'warning');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      setIsLoading(true);
      
      // Delete supplier using the API
      await deleteSupplier(supplierId);
      
      // Refresh suppliers from server
      await fetchSuppliers();
      
      notify('Supplier deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      
      // Special handling for backend constraint error
      if (error.message.includes('inventory items')) {
        notify('This supplier cannot be deleted because it has inventory items assigned to it.', 'error');
      } else {
        notify(`Error deleting supplier: ${error.message}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inventory-management-container">
      <Sidebar />
      <main className="inventory-management-content">
        <div className="inventory-page-header">
          <h1>Inventory Management</h1>
          <p className="inventory-page-subheader">Track and manage your restaurant's inventory items</p>
        </div>
        
        {/* Server Status Notifier */}
        {isServerDown && (
          <div className="server-status-notification">
            <p>
              <strong>Notice:</strong> Unable to connect to the server. Showing mock data. Real inventory data might differ.
            </p>
            <button onClick={handleRetryConnection}>
              Retry Connection
            </button>
          </div>
        )}
        
        <div className="inventory-overview">
          <div className="inventory-stat-card healthy">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Available</h3>
            <p className="stat-number">{inventoryStats.available}</p>
          </div>
          <div className="inventory-stat-card low">
            <div className="stat-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Not Available</h3>
            <p className="stat-number">{inventoryStats.not_available}</p>
          </div>
          <div className="inventory-stat-card out">
            <div className="stat-icon">
              <i className="fas fa-times-circle"></i>
            </div>
            <h3>Expired</h3>
            <p className="stat-number">{inventoryStats.expired}</p>
          </div>
          <div className="inventory-stat-card total">
            <div className="stat-icon">
              <i className="fas fa-boxes"></i>
            </div>
            <h3>Total Items</h3>
            <p className="stat-number">{inventoryStats.total_items}</p>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <input 
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search inventory by name..."
            />
          </div>
          
          <div className="filter-options">
            <select 
              name="status" 
              value={filters.status}  
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="not_available">Not Available</option>
              <option value="expired">Expired</option>
            </select>
            
            <select 
              name="supplier_id" 
              value={filters.supplier_id}  
              onChange={handleFilterChange}
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            
            <button 
              className="add-inventory-btn" 
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fas fa-plus"></i> Add New Item
            </button>

            {/* Add button for managing suppliers */}
            <button 
              className="manage-suppliers-btn" 
              onClick={handleOpenSupplierModal}
            >
              <i className="fas fa-users"></i> Manage Suppliers
            </button>
            
            <button className="reset-filters-btn" onClick={resetFilters}>
              <i className="fas fa-redo"></i> Reset Filters
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading inventory items...</p>
          </div>
        ) : (
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('inventory_id')} 
                      className={filters.sortBy === 'inventory_id' ? `active-sort ${filters.sortOrder}` : ''}>
                    ID
                  </th>
                  <th onClick={() => handleSort('name')} 
                      className={filters.sortBy === 'name' ? `active-sort ${filters.sortOrder}` : ''}>
                    Item Name
                  </th>
                  <th onClick={() => handleSort('quantity')} 
                      className={filters.sortBy === 'quantity' ? `active-sort ${filters.sortOrder}` : ''}>
                    Quantity
                  </th>
                  <th>Unit</th>
                  <th onClick={() => handleSort('price_per_unit')} 
                      className={filters.sortBy === 'price_per_unit' ? `active-sort ${filters.sortOrder}` : ''}>
                    Price Per Unit
                  </th>
                  <th onClick={() => handleSort('batch_no')} 
                      className={filters.sortBy === 'batch_no' ? `active-sort ${filters.sortOrder}` : ''}>
                    Batch No
                  </th>
                  <th onClick={() => handleSort('purchase_date')} 
                      className={filters.sortBy === 'purchase_date' ? `active-sort ${filters.sortOrder}` : ''}>
                    Purchase Date
                  </th>
                  <th onClick={() => handleSort('exp_date')} 
                      className={filters.sortBy === 'exp_date' ? `active-sort ${filters.sortOrder}` : ''}>
                    Expiry Date
                  </th>
                  <th onClick={() => handleSort('supplier_id')} 
                      className={filters.sortBy === 'supplier_id' ? `active-sort ${filters.sortOrder}` : ''}>
                    Supplier
                  </th>
                  <th onClick={() => handleSort('status')} 
                      className={filters.sortBy === 'status' ? `active-sort ${filters.sortOrder}` : ''}>
                    Status
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.inventory_id}>
                      <td>{item.inventory_id}</td>
                      <td>{item.name}</td>
                      <td className="quantity-value">
                        {parseFloat(item.quantity).toFixed(2)}
                      </td>
                      <td>{item.unit}</td>
                      <td>{formatCurrency(item.price_per_unit)}</td>
                      <td>{item.batch_no || "-"}</td>
                      <td className="date-field">
                        {formatDate(item.purchase_date)}
                      </td>
                      <td className={`date-field ${getDateClass(item.exp_date)}`}>
                        {formatDate(item.exp_date)}
                      </td>
                      <td>{item.supplier_name || getSupplierName(item.supplier_id)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(item.status)}`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="inventory-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteItem(item.inventory_id)}
                          >
                            <i className="fas fa-trash-alt"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="no-items">
                      <div className="no-items-message">
                        No inventory items match the current filters.
                      </div>
                      <button 
                        className="reset-filters-btn" 
                        onClick={resetFilters}
                        style={{ margin: '0 auto', display: 'block' }}
                      >
                        <i className="fas fa-redo"></i> Reset Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {pagination.pages > 1 && (
              <div className="pagination-controls">
                <button 
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <span>Page {filters.page} of {pagination.pages}</span>
                <button 
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Add Item Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add New Inventory Item</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className="modal-body">
                <div className="inventory-form">
                  <div className="form-group">
                    <label>Item Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="E.g., Basmati Rice"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity <span className="required">*</span></label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Unit <span className="required">*</span></label>
                    <select
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      required
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="L">Liter (L)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="box">Box</option>
                      <option value="m">Meter (m)</option>
                      <option value="cm">Centimeter (cm)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Price Per Unit (Rs.) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={newItem.price_per_unit}
                      onChange={(e) => setNewItem({...newItem, price_per_unit: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Batch Number <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={newItem.batch_no}
                      onChange={(e) => setNewItem({...newItem, batch_no: e.target.value})}
                      placeholder="E.g., BT2023-001"
                      required
                    />
                    <div className="form-hint">Must be unique for each inventory item</div>
                  </div>
                  
                  <div className="form-group">
                    <label>Manufacturing Date</label>
                    <input 
                      type="date" 
                      value={newItem.manu_date}
                      onChange={(e) => setNewItem({...newItem, manu_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="date" 
                      value={newItem.exp_date}
                      onChange={(e) => setNewItem({...newItem, exp_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input 
                      type="date" 
                      value={newItem.purchase_date}
                      onChange={(e) => setNewItem({...newItem, purchase_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Status <span className="required">*</span></label>
                    <select
                      value={newItem.status}
                      onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="not_available">Not Available</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Supplier <span className="required">*</span></label>
                    <select
                      value={newItem.supplier_id}
                      onChange={(e) => setNewItem({...newItem, supplier_id: parseInt(e.target.value)})}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-btn"
                      onClick={handleAddItem}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Adding...' : 'Add Item'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Item Modal */}
        {isEditModalOpen && selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit Inventory Item</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className="modal-body">
                <div className="inventory-form">
                  <div className="form-group">
                    <label>Item Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={selectedItem.name}
                      onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity <span className="required">*</span></label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={selectedItem.quantity}
                      onChange={(e) => setSelectedItem({...selectedItem, quantity: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Unit <span className="required">*</span></label>
                    <select
                      value={selectedItem.unit}
                      onChange={(e) => setSelectedItem({...selectedItem, unit: e.target.value})}
                      required
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="L">Liter (L)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="box">Box</option>
                      <option value="m">Meter (m)</option>
                      <option value="cm">Centimeter (cm)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Price Per Unit (Rs.) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={selectedItem.price_per_unit}
                      onChange={(e) => setSelectedItem({...selectedItem, price_per_unit: parseFloat(e.target.value)})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Batch Number <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={selectedItem.batch_no || ''}
                      onChange={(e) => setSelectedItem({...selectedItem, batch_no: e.target.value})}
                      placeholder="E.g., BT2023-001"
                      required
                    />
                    <div className="form-hint">Must be unique for each inventory item</div>
                  </div>
                  
                  <div className="form-group">
                    <label>Manufacturing Date</label>
                    <input 
                      type="date" 
                      value={selectedItem.manu_date ? selectedItem.manu_date.substring(0, 10) : ''}
                      onChange={(e) => setSelectedItem({...selectedItem, manu_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="date" 
                      value={selectedItem.exp_date ? selectedItem.exp_date.substring(0, 10) : ''}
                      onChange={(e) => setSelectedItem({...selectedItem, exp_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input 
                      type="date" 
                      value={selectedItem.purchase_date ? selectedItem.purchase_date.substring(0, 10) : ''}
                      onChange={(e) => setSelectedItem({...selectedItem, purchase_date: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      value={selectedItem.status || 'available'}
                      onChange={(e) => setSelectedItem({...selectedItem, status: e.target.value})}
                      className="form-control"
                    >
                      <option value="available">Available</option>
                      <option value="expired">Expired</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Supplier <span className="required">*</span></label>
                    <select
                      value={selectedItem.supplier_id}
                      onChange={(e) => setSelectedItem({...selectedItem, supplier_id: parseInt(e.target.value)})}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="save-btn"
                      onClick={handleEditItem}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Supplier Management Modal */}
        {isSupplierModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  {supplierView === 'list' && 'Manage Suppliers'}
                  {supplierView === 'add' && 'Add New Supplier'}
                  {supplierView === 'edit' && 'Edit Supplier'}
                </h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsSupplierModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className="modal-body">
                {supplierView === 'list' && (
                  <>
                    <div className="supplier-list-header">
                      <div>
                        <button 
                          className="refresh-button"
                          onClick={refreshSuppliers}
                          disabled={isLoading}
                        >
                          <i className="fas fa-sync-alt"></i> Refresh
                        </button>
                      </div>
                      <button 
                        className="add-button"
                        onClick={() => setSupplierView('add')}
                      >
                        <i className="fas fa-plus"></i> Add New Supplier
                      </button>
                    </div>
                    
                    {isLoading ? (
                      <div className="loading-spinner-container">
                        <div className="loading-spinner"></div>
                        <p>Loading suppliers...</p>
                      </div>
                    ) : suppliers.length === 0 ? (
                      <div className="no-suppliers-message">
                        <p>No suppliers found. You can add a new supplier or check your connection to the server.</p>
                        <button 
                          className="retry-button"
                          onClick={refreshSuppliers}
                        >
                          Retry Connection
                        </button>
                      </div>
                    ) : (
                      <div className="supplier-table-container">
                        <table className="supplier-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Contact Number</th>
                              <th>Email</th>
                              <th>Address</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {suppliers.length > 0 ? (
                              suppliers.map((supplier) => (
                                <tr key={supplier.supplier_id}>
                                  <td>{supplier.supplier_id}</td>
                                  <td>{supplier.name}</td>
                                  <td>{supplier.contact_number}</td>
                                  <td>{supplier.email || "-"}</td>
                                  <td>{supplier.address || "-"}</td>
                                  <td>
                                    <span className={`status-badge ${supplier.status === 'active' ? 'status-available' : 'status-not_available'}`}>
                                      {supplier.status ? supplier.status.toUpperCase() : 'ACTIVE'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="supplier-actions">
                                      <button 
                                        className="edit-btn"
                                        onClick={() => {
                                          setSelectedSupplier(supplier);
                                          setSupplierView('edit');
                                        }}
                                      >
                                        <i className="fas fa-edit"></i> Edit
                                      </button>
                                      <button 
                                        className="delete-btn"
                                        onClick={() => handleDeleteSupplier(supplier.supplier_id)}
                                      >
                                        <i className="fas fa-trash-alt"></i> Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="no-items">
                                  <div className="no-items-message">
                                    No suppliers found.
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
                
                {supplierView === 'add' && (
                  <div className="supplier-form">
                    <div className="form-group">
                      <label>Supplier Name <span className="required">*</span></label>
                      <input 
                        type="text" 
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                        placeholder="Enter supplier name"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact Number <span className="required">*</span></label>
                      <input 
                        type="text" 
                        value={newSupplier.contact_number}
                        onChange={(e) => setNewSupplier({...newSupplier, contact_number: e.target.value})}
                        placeholder="Enter contact number"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Status <span className="required">*</span></label>
                      <select
                        value={newSupplier.status}
                        onChange={(e) => setNewSupplier({...newSupplier, status: e.target.value})}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea 
                        value={newSupplier.address}
                        onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                        placeholder="Enter complete address"
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => setSupplierView('list')}
                      >
                        Cancel
                      </button>
                      <button 
                        className="save-btn"
                        onClick={handleAddSupplier}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Adding...' : 'Add Supplier'}
                      </button>
                    </div>
                  </div>
                )}
                
                {supplierView === 'edit' && selectedSupplier && (
                  <div className="supplier-form">
                    <div className="form-group">
                      <label>Supplier Name <span className="required">*</span></label>
                      <input 
                        type="text" 
                        value={selectedSupplier.name}
                        onChange={(e) => setSelectedSupplier({...selectedSupplier, name: e.target.value})}
                        placeholder="Enter supplier name"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact Number <span className="required">*</span></label>
                      <input 
                        type="text" 
                        value={selectedSupplier.contact_number}
                        onChange={(e) => setSelectedSupplier({...selectedSupplier, contact_number: e.target.value})}
                        placeholder="Enter contact number"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        value={selectedSupplier.email || ''}
                        onChange={(e) => setSelectedSupplier({...selectedSupplier, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Status <span className="required">*</span></label>
                      <select
                        value={selectedSupplier.status || 'active'}
                        onChange={(e) => setSelectedSupplier({...selectedSupplier, status: e.target.value})}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea 
                        value={selectedSupplier.address || ''}
                        onChange={(e) => setSelectedSupplier({...selectedSupplier, address: e.target.value})}
                        placeholder="Enter complete address"
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => setSupplierView('list')}
                      >
                        Cancel
                      </button>
                      <button 
                        className="save-btn"
                        onClick={handleEditSupplier}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default InventoryManagement;
