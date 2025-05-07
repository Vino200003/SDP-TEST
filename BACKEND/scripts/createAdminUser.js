require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Restaurant_system'
});

// Connect to the database
db.connect(async (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  
  console.log('Connected to the database');
  
  // Check if admin table exists
  db.query("SHOW TABLES LIKE 'admin'", (err, results) => {
    if (err) {
      console.error('Error checking for admin table:', err);
      db.end();
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('Admin table does not exist. Creating it...');
      
      const createTableSQL = `
        CREATE TABLE admin (
          admin_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone_number VARCHAR(15),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      db.query(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating admin table:', err);
          db.end();
          process.exit(1);
        }
        
        console.log('Admin table created successfully');
        createAdmin();
      });
    } else {
      console.log('Admin table exists');
      createAdmin();
    }
  });
  
  function createAdmin() {
    // Default admin credentials
    const adminUser = {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@restaurant.com',
      phone_number: '1234567890'
    };
    
    // Generate hashed password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error('Error generating salt:', err);
        db.end();
        process.exit(1);
      }
      
      bcrypt.hash('admin123', salt, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          db.end();
          process.exit(1);
        }
        
        adminUser.password = hash;
        
        // Check if admin already exists
        db.query('SELECT * FROM admin WHERE email = ?', [adminUser.email], (err, results) => {
          if (err) {
            console.error('Error checking for existing admin:', err);
            db.end();
            process.exit(1);
          }
          
          if (results.length > 0) {
            console.log('Admin user already exists. Updating password...');
            
            db.query('UPDATE admin SET password = ? WHERE email = ?', [adminUser.password, adminUser.email], (err) => {
              if (err) {
                console.error('Error updating admin password:', err);
                db.end();
                process.exit(1);
              }
              
              console.log('Admin password updated successfully');
              console.log('Admin email: admin@restaurant.com');
              console.log('Admin password: admin123');
              db.end();
              process.exit(0);
            });
          } else {
            console.log('Creating new admin user...');
            
            db.query('INSERT INTO admin SET ?', adminUser, (err, result) => {
              if (err) {
                console.error('Error creating admin user:', err);
                db.end();
                process.exit(1);
              }
              
              console.log('Admin user created successfully with ID:', result.insertId);
              console.log('Admin email: admin@restaurant.com');
              console.log('Admin password: admin123');
              db.end();
              process.exit(0);
            });
          }
        });
      });
    });
  }
});
