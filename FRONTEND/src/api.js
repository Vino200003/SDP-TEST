/**
 * Get user reservations
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of reservations
 */
export const getUserReservations = async (userId) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Set up headers based on token availability
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Always include userId in the query parameter for robustness
    const response = await fetch(`${API_URL}/api/reservations/user?userId=${userId}`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch reservations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    return [];
  }
};
