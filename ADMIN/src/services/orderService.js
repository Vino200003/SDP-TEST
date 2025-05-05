import axios from 'axios';

// Set the base URL for all API requests
const API_URL = 'http://localhost:5000/api'; // Update to your backend API port

// Get all orders with optional filtering
export const getAllOrders = async (filters = {}) => {
  try {
    // Convert filters to query parameters compatible with the backend
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      status: filters.status || '',
      type: filters.orderType || '',
      // Add other filters as needed
    };
    
    const response = await axios.get(`${API_URL}/orders`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get a single order by ID with its details
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order #${orderId}:`, error);
    throw error;
  }
};

// Update an order's status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { 
      order_status: newStatus // Using the exact field name expected by the backend
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating order #${orderId} status:`, error);
    throw error;
  }
};

// Assign delivery person to an order
export const assignDeliveryPerson = async (orderId, staffId) => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/assign-delivery`, { 
      delivery_person_id: staffId 
    });
    return response.data;
  } catch (error) {
    console.error(`Error assigning delivery person to order #${orderId}:`, error);
    throw error;
  }
};

// Cancel an order
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/cancel`, { 
      reason: reason 
    });
    return response.data;
  } catch (error) {
    console.error(`Error cancelling order #${orderId}:`, error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const response = await axios.get(`${API_URL}/orders`, { 
      params: { status: status } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders with status ${status}:`, error);
    
    // Return filtered mock data for development
    return mockOrders.filter(order => order.order_status === status);
  }
};

// Get order statistics
export const getOrderStats = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axios.get(`${API_URL}/orders/stats`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

// Delete an order
export const deleteOrder = async (orderId) => {
  try {
    const response = await axios.delete(`${API_URL}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order #${orderId}:`, error);
    throw error;
  }
};

// Mock data for development/testing
const mockOrders = [
  {
    order_id: 1,
    user_id: 1,
    user_name: "John Doe",
    email: "john@example.com",
    phone_number: "555-123-4567",
    address: "123 Main St, Anytown, USA",
    order_type: "Delivery",
    order_status: "Completed",
    total_amount: 49.95,
    discount_amount: 5.00,
    created_at: "2023-10-15T12:30:00Z",
    updated_at: "2023-10-15T13:15:00Z",
    delivery_person_id: 3,
    delivery_person_name: "Mike Delivery",
    items: [
      {
        menu_id: 1,
        menu_name: "Chicken Burger",
        price: 12.99,
        quantity: 2
      },
      {
        menu_id: 5,
        menu_name: "French Fries",
        price: 4.99,
        quantity: 1
      },
      {
        menu_id: 8,
        menu_name: "Chocolate Milkshake",
        price: 5.99,
        quantity: 2
      }
    ],
    payment: {
      payment_id: 1,
      payment_type: "credit",
      payment_status: "paid",
      amount: 44.95,
      paid_at: "2023-10-15T13:10:00Z"
    }
  },
  {
    order_id: 2,
    user_id: 2,
    user_name: "Jane Smith",
    email: "jane@example.com",
    phone_number: "555-987-6543",
    address: "456 Oak Rd, Somewhere, USA",
    order_type: "Takeaway",
    order_status: "Pending",
    total_amount: 32.50,
    discount_amount: 0,
    created_at: "2023-10-15T14:45:00Z",
    updated_at: "2023-10-15T14:45:00Z",
    items: [
      {
        menu_id: 3,
        menu_name: "Margherita Pizza",
        price: 14.99,
        quantity: 1
      },
      {
        menu_id: 9,
        menu_name: "Garlic Bread",
        price: 3.99,
        quantity: 2
      },
      {
        menu_id: 12,
        menu_name: "Soda",
        price: 2.49,
        quantity: 1
      }
    ],
    payment: {
      payment_id: 2,
      payment_type: "cash",
      payment_status: "unpaid",
      amount: 32.50,
      paid_at: null
    }
  },
  {
    order_id: 3,
    user_id: 3,
    user_name: "Robert Brown",
    email: "robert@example.com",
    phone_number: "555-567-8901",
    address: "789 Pine St, Elsewhere, USA",
    order_type: "Dine-in",
    order_status: "In Progress",
    total_amount: 78.25,
    discount_amount: 0,
    created_at: "2023-10-15T18:20:00Z",
    updated_at: "2023-10-15T18:30:00Z",
    items: [
      {
        menu_id: 6,
        menu_name: "Grilled Salmon",
        price: 22.99,
        quantity: 2
      },
      {
        menu_id: 15,
        menu_name: "Caesar Salad",
        price: 9.99,
        quantity: 1
      },
      {
        menu_id: 18,
        menu_name: "Red Wine",
        price: 8.99,
        quantity: 2
      }
    ],
    payment: {
      payment_id: 3,
      payment_type: "credit",
      payment_status: "paid",
      amount: 78.25,
      paid_at: "2023-10-15T19:45:00Z"
    }
  },
  {
    order_id: 4,
    user_id: 4,
    user_name: "Emily Clark",
    email: "emily@example.com",
    phone_number: "555-345-6789",
    address: "101 Elm St, Nowhere, USA",
    order_type: "Delivery",
    order_status: "Cancelled",
    total_amount: 45.75,
    discount_amount: 0,
    created_at: "2023-10-15T19:10:00Z",
    updated_at: "2023-10-15T19:25:00Z",
    delivery_person_id: 2,
    delivery_person_name: "Sara Delivery",
    items: [
      {
        menu_id: 7,
        menu_name: "Veggie Burger",
        price: 10.99,
        quantity: 2
      },
      {
        menu_id: 11,
        menu_name: "Onion Rings",
        price: 5.99,
        quantity: 1
      },
      {
        menu_id: 14,
        menu_name: "Vanilla Ice Cream",
        price: 4.99,
        quantity: 2
      }
    ],
    payment: {
      payment_id: 4,
      payment_type: "online",
      payment_status: "refunded",
      amount: 45.75,
      paid_at: "2023-10-15T19:15:00Z"
    }
  },
  {
    order_id: 5,
    user_id: 5,
    user_name: "Michael Lee",
    email: "michael@example.com",
    phone_number: "555-234-5678",
    address: "202 Maple Ave, Anyplace, USA",
    order_type: "Dine-in",
    order_status: "Completed",
    total_amount: 63.50,
    discount_amount: 10.00,
    created_at: "2023-10-14T20:00:00Z",
    updated_at: "2023-10-14T21:30:00Z",
    items: [
      {
        menu_id: 2,
        menu_name: "Steak",
        price: 29.99,
        quantity: 1
      },
      {
        menu_id: 10,
        menu_name: "Mashed Potatoes",
        price: 6.99,
        quantity: 1
      },
      {
        menu_id: 17,
        menu_name: "Beer",
        price: 6.99,
        quantity: 2
      }
    ],
    payment: {
      payment_id: 5,
      payment_type: "credit",
      payment_status: "paid",
      amount: 53.50,
      paid_at: "2023-10-14T21:25:00Z"
    }
  },
  {
    order_id: 6,
    user_id: null,
    user_name: "Guest Customer",
    order_type: "Takeaway",
    order_status: "Pending",
    total_amount: 27.98,
    discount_amount: 0,
    created_at: "2023-10-15T20:15:00Z",
    updated_at: "2023-10-15T20:15:00Z",
    items: [
      {
        menu_id: 4,
        menu_name: "Chicken Alfredo Pasta",
        price: 15.99,
        quantity: 1
      },
      {
        menu_id: 16,
        menu_name: "Garlic Knots",
        price: 5.99,
        quantity: 2
      }
    ],
    payment: null
  }
];
