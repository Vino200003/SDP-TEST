import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getAllReservations, updateReservationStatus, getReservationStats } from '../services/reservationService';
import '../styles/ReservationManagement.css';

function ReservationManagement() {
  // State for reservations
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [reservationStats, setReservationStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Filter states - removed dateRange
  const [filters, setFilters] = useState({
    status: '',
    searchTerm: '',
    page: 1,
    limit: 10
  });

  // Simple notification function
  const notify = (message, type = 'info') => {
    console.log(`[${type}] ${message}`);
    alert(message);
  };

  // Fetch reservations and stats on component mount
  useEffect(() => {
    fetchReservations();
    fetchReservationStats();
  }, []);

  // Fetch reservations when filters change - removed dateRange dependencies
  useEffect(() => {
    fetchReservations();
  }, [filters.page, filters.limit, filters.status]);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      // Removed startDate and endDate parameters
      console.log('Fetching reservations with filters:', {
        page: filters.page,
        limit: filters.limit,
        status: filters.status
      });
      
      const data = await getAllReservations({
        page: filters.page,
        limit: filters.limit,
        status: filters.status
      });
      
      if (data.reservations) {
        setReservations(data.reservations);
        setFilteredReservations(data.reservations);
        
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setReservations(data);
        setFilteredReservations(data);
      }
    } catch (error) {
      notify(`Error fetching reservations: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReservationStats = async () => {
    try {
      // Removed startDate and endDate parameters
      const data = await getReservationStats();
      
      setReservationStats({
        total: data.total_reservations || 0,
        upcoming: data.upcoming_reservations || 0,
        completed: data.completed_reservations || 0,
        cancelled: data.cancelled_reservations || 0
      });
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      setReservationStats({
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0
      });
    }
  };

  // Apply search filter locally
  useEffect(() => {
    if (filters.searchTerm) {
      applySearchFilter();
    } else {
      setFilteredReservations(reservations);
    }
  }, [filters.searchTerm, reservations]);

  const applySearchFilter = () => {
    const searchLower = filters.searchTerm.toLowerCase();
    const result = reservations.filter(reservation => {
      // Search by reservation ID
      if (reservation.reservation_id && 
          reservation.reservation_id.toString().toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by user ID
      if (reservation.user_id && 
          reservation.user_id.toString().toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by customer name if available
      if (reservation.customer_name && 
          reservation.customer_name.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by email if available
      if (reservation.email && 
          reservation.email.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by phone number if available
      if (reservation.phone_number && 
          reservation.phone_number.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search by table number
      if (reservation.table_no && 
          reservation.table_no.toString().toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });
    
    setFilteredReservations(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Removed date handling condition
    setFilters({
      ...filters,
      [name]: value,
      page: 1
    });
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      searchTerm: '',
      page: 1,
      limit: 10
    });
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = async (reservationId, newStatus) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
      
      // Update local state
      const updatedReservations = reservations.map(reservation => 
        reservation.reservation_id === reservationId 
          ? { ...reservation, status: newStatus } 
          : reservation
      );
      
      setReservations(updatedReservations);
      setFilteredReservations(updatedReservations.filter(reservation => 
        !filters.status || reservation.status === filters.status
      ));
      
      // If we're viewing this reservation in the modal, update it there too
      if (selectedReservation && selectedReservation.reservation_id === reservationId) {
        setSelectedReservation({ ...selectedReservation, status: newStatus });
      }
      
      // Refresh reservation stats
      fetchReservationStats();
      
      notify(`Reservation #${reservationId} status updated to ${newStatus}`, 'success');
    } catch (error) {
      notify(`Error updating reservation status: ${error.message}`, 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmed': return 'status-confirmed';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      case 'No-Show': return 'status-no-show';
      default: return '';
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

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <Header title="Table Reservations" />
        
        <div className="reservations-overview">
          <div className="reservation-stat-card upcoming">
            <h3>Upcoming</h3>
            <p className="stat-number">{reservationStats.upcoming}</p>
          </div>
          <div className="reservation-stat-card completed">
            <h3>Completed</h3>
            <p className="stat-number">{reservationStats.completed}</p>
          </div>
          <div className="reservation-stat-card cancelled">
            <h3>Cancelled</h3>
            <p className="stat-number">{reservationStats.cancelled}</p>
          </div>
          <div className="reservation-stat-card total">
            <h3>Total</h3>
            <p className="stat-number">{reservationStats.total}</p>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange(e)}
              placeholder="Search by ID, customer, or table number"
            />
          </div>
          
          <div className="filter-options">
            <select 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-Show">No-Show</option>
            </select>
            
            {/* Removed date filters section */}
            
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading">Loading reservations...</div>
        ) : (
          <div className="reservations-table-container">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Date & Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.reservation_id}>
                      <td>{reservation.reservation_id}</td>
                      <td>{reservation.customer_name || `User ${reservation.user_id}` || 'Guest'}</td>
                      <td>Table {reservation.table_no}</td>
                      <td>{formatDate(reservation.date_time)}</td>
                      <td>{reservation.guests || reservation.capacity || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td>
                        <div className="reservation-actions">
                          <button 
                            className="view-btn"
                            onClick={() => handleViewDetails(reservation)}
                          >
                            View Details
                          </button>
                          
                          <select 
                            className="status-update-select"
                            value={reservation.status}
                            onChange={(e) => handleUpdateStatus(reservation.reservation_id, e.target.value)}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="No-Show">No-Show</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-reservations">
                      No reservations match the current filters
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
                  Previous
                </button>
                <span>Page {filters.page} of {pagination.pages}</span>
                <button 
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Reservation Details Modal */}
        {isDetailsModalOpen && selectedReservation && (
          <div className="modal-overlay">
            <div className="modal-content reservation-details-modal">
              <div className="modal-header">
                <h2>Reservation #{selectedReservation.reservation_id} Details</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className="reservation-details-content">
                <div className="reservation-info-section">
                  <div className="reservation-info-group">
                    <h3>Reservation Information</h3>
                    <p><strong>Status:</strong> {selectedReservation.status}</p>
                    <p><strong>Date & Time:</strong> {formatDate(selectedReservation.date_time)}</p>
                    <p><strong>Table Number:</strong> {selectedReservation.table_no}</p>
                    <p><strong>Guests:</strong> {selectedReservation.guests || selectedReservation.capacity || 'N/A'}</p>
                    <p><strong>Created:</strong> {formatDate(selectedReservation.created_at)}</p>
                  </div>
                  
                  <div className="reservation-info-group">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {selectedReservation.customer_name || 'N/A'}</p>
                    <p><strong>User ID:</strong> {selectedReservation.user_id || 'Guest'}</p>
                    <p><strong>Email:</strong> {selectedReservation.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedReservation.phone_number || 'N/A'}</p>
                  </div>
                </div>
                
                {selectedReservation.special_requests && (
                  <div className="special-requests-section">
                    <h3>Special Requests</h3>
                    <p>{selectedReservation.special_requests}</p>
                  </div>
                )}
                
                <div className="reservation-actions-footer">
                  <select 
                    value={selectedReservation.status}
                    onChange={(e) => {
                      handleUpdateStatus(selectedReservation.reservation_id, e.target.value);
                      setSelectedReservation({...selectedReservation, status: e.target.value});
                    }}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No-Show">No-Show</option>
                  </select>
                  
                  <button className="print-reservation-btn">
                    Print Details
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
      </main>
    </div>
  );
}

export default ReservationManagement;
