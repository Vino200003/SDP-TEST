// Mock data to use when the server is unavailable
import { API_URL } from '../config/constants';

// Server status properties
export const serverStatus = {
  isAvailable: false,
  lastChecked: null,
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

// Mock inventory data updated to match the revised database schema
export const mockInventoryItems = [
  {
    inventory_id: 1,
    name: "Rice",
    quantity: 50.0,
    unit: "kg",
    price_per_unit: 120.50,
    manu_date: "2023-09-15",
    exp_date: "2024-09-15",
    purchase_date: "2023-10-01",
    batch_no: "BR2023-001",
    status: "available",
    supplier_id: 1
  },
  {
    inventory_id: 2,
    name: "Chicken",
    quantity: 25.5,
    unit: "kg",
    price_per_unit: 450.00,
    manu_date: "2023-11-01",
    exp_date: "2023-11-15",
    purchase_date: "2023-11-02",
    batch_no: "CH2023-112",
    status: "available",
    supplier_id: 2
  },
  {
    inventory_id: 3,
    name: "Tomatoes",
    quantity: 15.75,
    unit: "kg",
    price_per_unit: 180.25,
    manu_date: "2023-11-05",
    exp_date: "2023-11-20",
    purchase_date: "2023-11-06",
    batch_no: "TM2023-045",
    status: "available",
    supplier_id: 3
  },
  {
    inventory_id: 4,
    name: "Olive Oil",
    quantity: 10.0,
    unit: "L",
    price_per_unit: 850.00,
    manu_date: "2023-06-10",
    exp_date: "2024-06-10",
    purchase_date: "2023-07-15",
    batch_no: "OL2023-007",
    status: "available",
    supplier_id: 4
  },
  {
    inventory_id: 5,
    name: "Flour",
    quantity: 2.5,
    unit: "kg",
    price_per_unit: 95.50,
    manu_date: "2023-08-10",
    exp_date: "2024-02-10",
    purchase_date: "2023-09-01",
    batch_no: "FL2023-089",
    status: "not_available",
    supplier_id: 5
  },
  {
    inventory_id: 6,
    name: "Sugar",
    quantity: 8.0,
    unit: "kg",
    price_per_unit: 110.00,
    manu_date: "2023-07-15",
    exp_date: "2024-07-15",
    purchase_date: "2023-08-01",
    batch_no: "SG2023-067",
    status: "available",
    supplier_id: 5
  },
  {
    inventory_id: 7,
    name: "Potatoes",
    quantity: 40.5,
    unit: "kg",
    price_per_unit: 120.00,
    manu_date: "2023-10-20",
    exp_date: "2023-12-20",
    purchase_date: "2023-10-22",
    batch_no: "PT2023-102",
    status: "available",
    supplier_id: 3
  },
  {
    inventory_id: 8,
    name: "Milk",
    quantity: 0.0,
    unit: "L",
    price_per_unit: 160.00,
    manu_date: "2023-11-01",
    exp_date: "2023-11-10",
    purchase_date: "2023-11-02",
    batch_no: "ML2023-115",
    status: "not_available",
    supplier_id: 6
  },
  {
    inventory_id: 9,
    name: "Black Pepper",
    quantity: 1.2,
    unit: "kg",
    price_per_unit: 1200.00,
    manu_date: "2023-05-10",
    exp_date: "2024-05-10",
    purchase_date: "2023-06-01",
    batch_no: "BP2023-034",
    status: "available",
    supplier_id: 7
  },
  {
    inventory_id: 10,
    name: "Cheese",
    quantity: 3.0,
    unit: "kg",
    price_per_unit: 950.00,
    manu_date: "2023-10-25",
    exp_date: "2023-11-25",
    purchase_date: "2023-10-27",
    batch_no: "CH2023-108",
    status: "available",
    supplier_id: 6
  }
];

export const mockInventoryCategories = [
  { id: 1, name: "Grains" },
  { id: 2, name: "Meat" },
  { id: 3, name: "Vegetables" },
  { id: 4, name: "Fruits" },
  { id: 5, name: "Dairy" },
  { id: 6, name: "Spices" },
  { id: 7, name: "Baking" },
  { id: 8, name: "Oils" },
  { id: 9, name: "Beverages" }
];

export const mockSuppliers = [
  { supplier_id: 1, name: "Quality Foods Ltd", contact_number: "0112345678", email: "info@qualityfoods.com", address: "123 Main St, Colombo" },
  { supplier_id: 2, name: "Fresh Farms Inc", contact_number: "0775566778", email: "orders@freshfarms.lk", address: "45 Farm Road, Kandy" },
  { supplier_id: 3, name: "Green Harvest Ltd", contact_number: "0114567890", email: "sales@greenharvest.com", address: "78 Garden Ave, Galle" },
  { supplier_id: 4, name: "Mediterranean Imports", contact_number: "0776655443", email: "imports@mediterranean.lk", address: "90 Import Drive, Colombo" },
  { supplier_id: 5, name: "Bakers Supply Co", contact_number: "0112223344", email: "supply@bakerssupply.com", address: "12 Baker Street, Negombo" },
  { supplier_id: 6, name: "Dairy Delights", contact_number: "0778889900", email: "orders@dairydelights.lk", address: "34 Dairy Road, Jaffna" },
  { supplier_id: 7, name: "Spice Traders", contact_number: "0114443322", email: "sales@spicetraders.com", address: "56 Spice Lane, Matara" }
];

export const generateMockInventoryStats = () => {
  // Calculate stats from mockInventoryItems
  const total_items = mockInventoryItems.length;
  const available = mockInventoryItems.filter(item => item.status === 'available').length;
  const not_available = mockInventoryItems.filter(item => item.status === 'not_available').length;
  
  // Calculate expired items by checking exp_date
  const today = new Date();
  const expired = mockInventoryItems.filter(item => {
    if (!item.exp_date) return false;
    return new Date(item.exp_date) < today;
  }).length;
  
  return {
    total_items,
    available,
    not_available,
    expired
  };
};
