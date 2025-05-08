import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getAllTables, createTable, updateTable, deleteTable } from '../services/tableService';
import { serverStatus, checkServerAvailability } from '../utils/mockData';
import '../styles/TableManagement.css';

function TableManagement() {
  // State for tables data
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerDown, setIsServerDown] = useState(false);
  
  // State for table operations
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form state for adding/editing tables
  const [tableForm, setTableForm] = useState({
    table_no: '',
    capacity: '',
    status: 'Available'
  });
  
  // Load tables on component mount
  useEffect(() => {
    fetchTables();
    checkServerConnection();
  }, []);
  
  // Update filtered tables when search or filter changes
  useEffect(() => {
    filterTables();
  }, [searchTerm, statusFilter, tables]);
  
  // Check server status
  const checkServerConnection = async () => {
    const isAvailable = await checkServerAvailability();
    setIsServerDown(!isAvailable);
  };
  
  // Fetch all tables
  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTables();
      
      // Add status field if it doesn't exist (for mock data)
      const tablesWithStatus = data.map(table => ({
        ...table,
        status: table.status || 'Available'
      }));
      
      setTables(tablesWithStatus);
      setIsServerDown(!serverStatus.isAvailable);
    } catch (error) {
      console.error('Error fetching tables:', error);
      // In case of error, generate mock data
      const mockTables = Array.from({ length: 10 }, (_, i) => ({
        table_no: i + 1,
        capacity: Math.floor(Math.random() * 6) + 2,
        status: ['Available', 'Available', 'Available', 'Reserved'][Math.floor(Math.random() * 4)]
      }));
      setTables(mockTables);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter tables based on search term and status filter
  const filterTables = () => {
    let filtered = [...tables];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(table => 
        table.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(table => 
        table.table_no.toString().includes(searchTerm) ||
        table.capacity.toString().includes(searchTerm)
      );
    }
    
    setFilteredTables(filtered);
  };
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTableForm({
      ...tableForm,
      [name]: value
    });
  };
  
  // Handle add table submit
  const handleAddTable = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const newTable = await createTable({
        capacity: parseInt(tableForm.capacity),
        status: tableForm.status
      });
      
      setTables([...tables, newTable]);
      setIsAddModalOpen(false);
      resetForm();
      alert('Table added successfully!');
    } catch (error) {
      console.error('Error adding table:', error);
      alert(`Failed to add table: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit table submit
  const handleEditTable = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const updatedTable = await updateTable(tableForm.table_no, {
        capacity: parseInt(tableForm.capacity),
        status: tableForm.status
      });
      
      // Update tables array with the edited table
      setTables(tables.map(table => 
        table.table_no === updatedTable.table_no ? updatedTable : table
      ));
      
      setIsEditModalOpen(false);
      resetForm();
      alert('Table updated successfully!');
    } catch (error) {
      console.error('Error updating table:', error);
      alert(`Failed to update table: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete table
  const handleDeleteTable = async () => {
    try {
      setIsLoading(true);
      await deleteTable(selectedTable.table_no);
      
      // Remove the deleted table from the tables array
      setTables(tables.filter(table => table.table_no !== selectedTable.table_no));
      setIsDeleteModalOpen(false);
      alert('Table deleted successfully!');
    } catch (error) {
      console.error('Error deleting table:', error);
      alert(`Failed to delete table: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle opening the edit modal
  const openEditModal = (table) => {
    setTableForm({
      table_no: table.table_no,
      capacity: table.capacity,
      status: table.status || 'Available'
    });
    setIsEditModalOpen(true);
  };
  
  // Handle opening the delete modal
  const openDeleteModal = (table) => {
    setSelectedTable(table);
    setIsDeleteModalOpen(true);
  };
  
  // Reset form state
  const resetForm = () => {
    setTableForm({
      table_no: '',
      capacity: '',
      status: 'Available'
    });
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return 'status-available';
      case 'reserved': return 'status-reserved';
      default: return '';
    }
  };
  
  // Generate table stats
  const tableStats = {
    total: tables.length,
    available: tables.filter(t => t.status?.toLowerCase() === 'available').length,
    reserved: tables.filter(t => t.status?.toLowerCase() === 'reserved').length
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <Header title="Table Management" />
        
        {/* Server status warning */}
        {isServerDown && (
          <div className="server-status-notification warning">
            <p>
              <strong>Notice:</strong> Cannot connect to the server. Showing mock data that may not reflect your actual table configuration.
            </p>
            <button onClick={checkServerConnection}>
              Retry Connection
            </button>
          </div>
        )}
        
        {/* Tables statistics */}
        <div className="tables-overview">
          <div className="table-stat-card available">
            <h3>Available</h3>
            <p className="stat-number">{tableStats.available}</p>
          </div>
          <div className="table-stat-card reserved">
            <h3>Reserved</h3>
            <p className="stat-number">{tableStats.reserved}</p>
          </div>
          <div className="table-stat-card total">
            <h3>Total Tables</h3>
            <p className="stat-number">{tableStats.total}</p>
          </div>
        </div>
        
        {/* Filters and actions */}
        <div className="filters-section">
          <div className="search-and-filter">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by table number or capacity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="status-filter">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="add-table-btn"
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
            >
              Add New Table
            </button>
          </div>
        </div>
        
        {/* Tables display */}
        {isLoading ? (
          <div className="loading">Loading tables...</div>
        ) : (
          <div className="tables-grid">
            {filteredTables.length > 0 ? (
              filteredTables.map((table) => (
                <div 
                  key={table.table_no} 
                  className={`table-card ${getStatusClass(table.status || 'Available')}`}
                >
                  <h3>Table {table.table_no}</h3>
                  <p className="capacity">Capacity: {table.capacity} guests</p>
                  <p className={`status ${getStatusClass(table.status || 'Available')}`}>
                    {table.status || 'Available'}
                  </p>
                  <div className="table-card-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => {
                        setSelectedTable(table);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="edit-table-btn"
                      onClick={() => openEditModal(table)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-table-btn"
                      onClick={() => openDeleteModal(table)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tables">
                No tables match your search or filter criteria.
              </div>
            )}
          </div>
        )}
        
        {/* Add Table Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content table-form-modal">
              <div className="modal-header">
                <h2>Add New Table</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              <form className="table-form" onSubmit={handleAddTable}>
                <div className="form-group">
                  <label htmlFor="capacity">Capacity (number of guests)</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={tableForm.capacity}
                    onChange={handleFormChange}
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Initial Status</label>
                  <select
                    id="status"
                    name="status"
                    value={tableForm.status}
                    onChange={handleFormChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit Table Modal */}
        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content table-form-modal">
              <div className="modal-header">
                <h2>Edit Table {tableForm.table_no}</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              <form className="table-form" onSubmit={handleEditTable}>
                <div className="form-group">
                  <label htmlFor="capacity">Capacity (number of guests)</label>
                  <input
                    type="number"
                    id="edit-capacity"
                    name="capacity"
                    value={tableForm.capacity}
                    onChange={handleFormChange}
                    min="1"
                    max="20"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={tableForm.status}
                    onChange={handleFormChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Table Details Modal */}
        {isDetailsModalOpen && selectedTable && (
          <div className="modal-overlay">
            <div className="modal-content table-details-modal">
              <div className="modal-header">
                <h2>Table {selectedTable.table_no} Details</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              <div className="table-details-content">
                <div className="table-info-section">
                  <p><strong>Table Number:</strong> {selectedTable.table_no}</p>
                  <p><strong>Capacity:</strong> {selectedTable.capacity} guests</p>
                  <p><strong>Status:</strong> {selectedTable.status || 'Available'}</p>
                </div>
                <div className="table-actions-footer">
                  <button 
                    className="edit-table-btn"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      openEditModal(selectedTable);
                    }}
                  >
                    Edit Table
                  </button>
                  <button 
                    className="delete-table-btn"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      openDeleteModal(selectedTable);
                    }}
                  >
                    Delete Table
                  </button>
                  <button 
                    className="close-details-btn"
                    onClick={() => setIsDetailsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedTable && (
          <div className="modal-overlay">
            <div className="modal-content delete-confirmation-modal">
              <div className="modal-header">
                <h2>Confirm Delete</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              <div className="delete-confirmation-content">
                <p>Are you sure you want to delete Table {selectedTable.table_no}?</p>
                <p>This action cannot be undone.</p>
                
                <div className="delete-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="delete-confirm-btn"
                    onClick={handleDeleteTable}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Table'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TableManagement;
