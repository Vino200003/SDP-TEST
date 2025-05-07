module.exports = {
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'restaurant-sdp-secret-key',
  adminJwtSecret: process.env.ADMIN_JWT_SECRET || 'restaurant-sdp-admin-secret-key',
  
  // Token expiration times
  jwtExpiration: '24h',  // 24 hours
  adminJwtExpiration: '7d',  // 7 days
  
  // Server settings
  port: process.env.PORT || 5000,
  
  // Database settings
  // These should match what you're using in your db.js
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Restaurant_system'
  }
};
