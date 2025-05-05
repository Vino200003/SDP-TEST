const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const path = require('path');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reservationRoutes = require('./routes/reservationRoutes'); // Add reservation routes
const orderRoutes = require('./routes/orderRoutes'); // Add order routes

const app = express();

// Ensure CORS is correctly configured
app.use(cors({
  origin: '*', // For testing, allow all origins (restrict this in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware for debugging request bodies
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  console.log(`${req.method} request for ${req.url}`);
  next();
});

// Serve static files from the frontend's public directory
app.use('/images', express.static(path.join(__dirname, '../FRONTEND/public')));

// API Routes - make sure this is correctly configured
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes); // This is important - ensure it's '/api/menu'
app.use('/api/reservations', reservationRoutes); // Add reservation routes
app.use('/api/orders', orderRoutes); // Add order routes

// Default route - add more logging to help with debugging
app.get('/', (req, res) => {
  console.log('Default route accessed');
  res.send('Welcome to the VANNI INN Restaurant API - API is running correctly');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// For debugging: Display all registered routes
console.log('Registered routes:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path);
  }
});

module.exports = app;