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
  
  // Check if staff table exists
  db.query("SHOW TABLES LIKE 'staff'", (err, results) => {
    if (err) {
      console.error('Error checking for staff table:', err);
      db.end();
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('Staff table does not exist. Creating it...');
      
      const createTableSQL = `
        CREATE TABLE staff (
          staff_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          nic VARCHAR(20) NOT NULL UNIQUE,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone_number VARCHAR(15),
          role ENUM('waiter', 'chef', 'delivery') NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      db.query(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating staff table:', err);
          db.end();
          process.exit(1);
        }
        
        console.log('Staff table created successfully');
        createDefaultStaff();
      });
    } else {
      console.log('Staff table exists');
      createDefaultStaff();
    }
  });
  
  function createDefaultStaff() {
    // Default staff members
    const defaultStaff = [
      {
        first_name: 'John',
        last_name: 'Doe',
        nic: '123456789V',
        email: 'john.doe@restaurant.com',
        phone_number: '1234567890',
        role: 'waiter',
        active: true
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        nic: '987654321V',
        email: 'jane.smith@restaurant.com',
        phone_number: '2345678901',
        role: 'chef',
        active: true
      },
      {
        first_name: 'David',
        last_name: 'Johnson',
        nic: '567891234V',
        email: 'david.johnson@restaurant.com',
        phone_number: '3456789012',
        role: 'delivery',
        active: true
      }
    ];
    
    // Generate hashed password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error('Error generating salt:', err);
        db.end();
        process.exit(1);
      }
      
      bcrypt.hash('password123', salt, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          db.end();
          process.exit(1);
        }
        
        // Add password to each staff member
        const staffWithPasswords = defaultStaff.map(staff => ({
          ...staff,
          password: hash
        }));
        
        // Insert staff members one by one to avoid duplicates
        let inserted = 0;
        let alreadyExists = 0;
        
        staffWithPasswords.forEach(staff => {
          // Check if staff already exists
          db.query('SELECT * FROM staff WHERE email = ?', [staff.email], (err, results) => {
            if (err) {
              console.error(`Error checking for existing staff ${staff.email}:`, err);
              return;
            }
            
            if (results.length > 0) {
              console.log(`Staff member with email ${staff.email} already exists.`);
              alreadyExists++;
              checkCompletion();
            } else {
              console.log(`Creating staff member: ${staff.first_name} ${staff.last_name}`);
              
              db.query('INSERT INTO staff SET ?', staff, (err, result) => {
                if (err) {
                  console.error(`Error creating staff ${staff.email}:`, err);
                } else {
                  console.log(`Staff member created with ID: ${result.insertId}`);
                  inserted++;
                }
                checkCompletion();
              });
            }
          });
        });
        
        function checkCompletion() {
          if (inserted + alreadyExists === defaultStaff.length) {
            console.log('All default staff members have been processed.');
            console.log(`Inserted: ${inserted}, Already existed: ${alreadyExists}`);
            console.log('Default staff password: password123');
            db.end();
            process.exit(0);
          }
        }
      });
    });
  }
});
