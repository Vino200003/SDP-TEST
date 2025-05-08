// Mock data to use when the server is unavailable
import { API_URL } from '../config/constants';

// Server status properties
export const serverStatus = {
  isAvailable: true,  // Set to true to prevent server down notifications
  lastChecked: 0,
  checkInterval: 30000, // 30 seconds between retry checks
  checkInProgress: false
};

// Check if server is available
export const checkServerAvailability = async () => {
  if (serverStatus.checkInProgress) return serverStatus.isAvailable;
  
  const now = Date.now();
  // Only check if enough time has passed since last check
  if (now - serverStatus.lastChecked < serverStatus.checkInterval) {
    return serverStatus.isAvailable;
  }
  
  serverStatus.checkInProgress = true;
  
  try {
    // Attempt to connect to server with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    serverStatus.isAvailable = response.ok;
    serverStatus.lastChecked = Date.now();
    return serverStatus.isAvailable;
  } catch (error) {
    console.log('Server availability check failed:', error.message);
    serverStatus.isAvailable = false;
    serverStatus.lastChecked = Date.now();
    return false;
  } finally {
    serverStatus.checkInProgress = false;
  }
};

export const mockReservations = [
  {
    reserve_id: 1,
    user_id: 2,
    table_no: 5,
    date_time: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    special_requests: "Need high chair for baby",
    status: "Confirmed",
    customer_name: "John Doe",
    email: "john.doe@example.com",
    phone_number: "555-123-4567",
    capacity: 4
  },
  {
    reserve_id: 2,
    user_id: 3,
    table_no: 8,
    date_time: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // day after tomorrow
    special_requests: "Window seat preferred",
    status: "Confirmed",
    customer_name: "Jane Smith",
    email: "jane.smith@example.com",
    phone_number: "555-987-6543",
    capacity: 2
  },
  {
    reserve_id: 3,
    user_id: 1,
    table_no: 3,
    date_time: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    special_requests: null,
    status: "Completed",
    customer_name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone_number: "555-246-8101",
    capacity: 6
  },
  {
    reserve_id: 4,
    user_id: 5,
    table_no: 9,
    date_time: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
    special_requests: "Celebrating anniversary",
    status: "Cancelled",
    customer_name: "Alice Brown",
    email: "alice.brown@example.com",
    phone_number: "555-369-2581",
    capacity: 2
  },
  {
    reserve_id: 5,
    user_id: 6,
    table_no: 2,
    date_time: new Date().toISOString(), // today
    special_requests: "Allergic to nuts",
    status: "Confirmed",
    customer_name: "Charlie Davis",
    email: "charlie.davis@example.com",
    phone_number: "555-789-4561",
    capacity: 4
  }
];

export const mockStats = {
  total_reservations: 5,
  upcoming_reservations: 3,
  completed_reservations: 1,
  cancelled_reservations: 1
};

export const generateMockReservations = (count = 10) => {
  const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
  const tableNos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const specialRequests = [
    "Window seat preferred", 
    "Need high chair for baby", 
    "Allergic to nuts", 
    "Celebrating anniversary", 
    null
  ];
  
  const reservations = [];
  
  for (let i = 1; i <= count; i++) {
    // Random date within -5 to +10 days from today
    const daysOffset = Math.floor(Math.random() * 16) - 5;
    const randomDate = new Date(new Date().getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    // Random time between 11am and 9pm
    randomDate.setHours(11 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    reservations.push({
      reserve_id: i,
      user_id: Math.floor(Math.random() * 10) + 1,
      table_no: tableNos[Math.floor(Math.random() * tableNos.length)],
      date_time: randomDate.toISOString(),
      special_requests: specialRequests[Math.floor(Math.random() * specialRequests.length)],
      status: status,
      customer_name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      phone_number: `555-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
      capacity: Math.floor(Math.random() * 6) + 2
    });
  }
  
  return reservations;
};

export const generateMockStats = (reservations) => {
  if (!reservations || reservations.length === 0) {
    return mockStats;
  }
  
  const now = new Date();
  
  const total = reservations.length;
  const upcoming = reservations.filter(r => 
    r.status === "Confirmed" && new Date(r.date_time) > now
  ).length;
  const completed = reservations.filter(r => 
    r.status === "Completed"
  ).length;
  const cancelled = reservations.filter(r => 
    r.status === "Cancelled" || r.status === "No-Show"
  ).length;
  
  return {
    total_reservations: total,
    upcoming_reservations: upcoming,
    completed_reservations: completed,
    cancelled_reservations: cancelled
  };
};
