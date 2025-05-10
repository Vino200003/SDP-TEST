require('dotenv').config();
const mysql = require('mysql2');

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
    process.exit(1);
  }
  
  console.log('Connected to the database');
  
  // Check if staff table exists
  db.query("SHOW TABLES LIKE 'staff'", (err, results) => {
    if (err) {
      console.error('Error checking for staff table:', err);
      db.end();
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('Staff table does not exist. Please run createStaffTable.js first.');
      db.end();
      process.exit(1);
    } else {
      console.log('Staff table exists. Checking structure...');
      
      // Check if it has the 'active' column
      db.query("SHOW COLUMNS FROM staff LIKE 'active'", (err, columns) => {
        if (err) {
          console.error('Error checking staff table structure:', err);
          db.end();
          process.exit(1);
        }
        
        if (columns.length === 0) {
          console.log('Active column is missing. Adding it...');
          
          // Add active column
          db.query("ALTER TABLE staff ADD COLUMN active BOOLEAN DEFAULT TRUE", (err) => {
            if (err) {
              console.error('Error adding active column:', err);
              db.end();
              process.exit(1);
            }
            
            console.log('Active column added successfully!');
            
            // List all staff members
            listStaffMembers();
          });
        } else {
          console.log('Staff table structure is correct.');
          
          // List all staff members
          listStaffMembers();
        }
      });
    }
  });
  
  function listStaffMembers() {
    db.query('SELECT * FROM staff', (err, staff) => {
      if (err) {
        console.error('Error listing staff members:', err);
        db.end();
        process.exit(1);
      }
      
      console.log('Current staff members:');
      console.table(staff);
      
      db.end();
      process.exit(0);
    });
  }
});
