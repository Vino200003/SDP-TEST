// config/db.js
const mysql = require('mysql2');
require('dotenv').config();  // To use environment variables from .env file

// Log database connection details (without password)
console.log('Connecting to database:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Restaurant_system'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.error('Please check your database credentials and make sure MySQL server is running');
    // Don't exit the process, just log the error
    return;
  }
  console.log('Connected to the MySQL database successfully');
  
  // Verify the users table exists
  db.query('SHOW TABLES LIKE "users"', (err, results) => {
    if (err) {
      console.error('Error checking for users table:', err);
      return;
    }
    
    if (results.length === 0) {
      console.warn('Warning: users table does not exist!');
      console.log('Creating users table...');
      
      // SQL to create the users table
      const createTableSQL = `
        CREATE TABLE users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE,
          phone_number VARCHAR(15) UNIQUE NOT NULL,
          address VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      db.query(createTableSQL, (err, result) => {
        if (err) {
          console.error('Error creating users table:', err);
          return;
        }
        console.log('Users table created successfully');
      });
    } else {
      console.log('Users table exists - database setup complete');
    }
  });
});

module.exports = db;
