import { API_URL } from '../config/constants';

export const checkServerAvailability = async () => {
  try {
    // Try to reach the server health endpoint
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout to avoid hanging
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      console.log('Backend server is available');
      return true;
    } else {
      console.warn(`Server returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error checking server availability:', error);
    
    // Show helpful message for common errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('Backend server appears to be offline or inaccessible');
      
      // Log additional help about CORS if that might be the issue
      console.log('Tip: If running locally, ensure CORS is enabled on your backend server');
      console.log(`Check that your backend is running at: ${API_URL}`);
    }
    
    return false;
  }
};

// Auto-run check when imported in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Checking server availability...');
  checkServerAvailability()
    .then(isAvailable => {
      if (!isAvailable) {
        console.log('Server unavailable - UI will use mock data if configured');
      }
    });
}
