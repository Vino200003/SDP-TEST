// server.js
const app = require('./app');  // Import app.js for routing and middleware

const port = process.env.PORT || 5000;

// Import routes
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Make sure this is added

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes); // Make sure this is added

console.log('User routes initialized');
console.log('Menu routes initialized');
console.log('Reservation routes initialized');
console.log('Admin routes initialized'); // Add this log

// Add more detailed logging for server startup
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API can be accessed at http://localhost:${port}/api`);
  console.log(`Test the API with: http://localhost:${port}/api/users/test`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
