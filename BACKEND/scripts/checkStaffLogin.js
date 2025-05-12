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
      console.log('Staff table does not exist. Please run createStaffTable.js first.');
      db.end();
      process.exit(1);
    } else {
      console.log('Staff table exists. Checking for demo accounts...');
      
      // Check for demo kitchen account
      db.query("SELECT * FROM staff WHERE email = 'kitchen@restaurant.com'", async (err, kitchenResults) => {
        if (err) {
          console.error('Error checking for kitchen staff:', err);
          db.end();
          process.exit(1);
        }
        
        // Check for demo delivery account
        db.query("SELECT * FROM staff WHERE email = 'delivery@restaurant.com'", async (err, deliveryResults) => {
          if (err) {
            console.error('Error checking for delivery staff:', err);
            db.end();
            process.exit(1);
          }
          
          // Create any missing demo accounts
          try {
            // Hash the demo password
            const salt = await bcrypt.genSalt(10);
            const kitchenPassword = await bcrypt.hash('kitchen123', salt);
            const deliveryPassword = await bcrypt.hash('delivery123', salt);
            
            // Array to track pending operations
            const promises = [];
            
            // Add kitchen staff if missing
            if (kitchenResults.length === 0) {
              console.log('Creating demo kitchen staff account...');
              
              const kitchenStaff = {
                first_name: 'Kitchen',
                last_name: 'Staff',
                nic: 'K10012345',
                email: 'kitchen@restaurant.com',
                password: kitchenPassword,
                phone_number: '1234567890',
                role: 'chef',
                active: true
              };
              
              promises.push(
                new Promise((resolve, reject) => {
                  db.query('INSERT INTO staff SET ?', kitchenStaff, (err, result) => {
                    if (err) {
                      console.error('Error creating kitchen staff:', err);
                      reject(err);
                    } else {
                      console.log('Demo kitchen staff created successfully!');
                      resolve();
                    }
                  });
                })
              );
            } else {
              console.log('Demo kitchen staff account already exists.');
            }
            
            // Add delivery staff if missing
            if (deliveryResults.length === 0) {
              console.log('Creating demo delivery staff account...');
              
              const deliveryStaff = {
                first_name: 'Delivery',
                last_name: 'Staff',
                nic: 'D20015678',
                email: 'delivery@restaurant.com',
                password: deliveryPassword,
                phone_number: '9876543210',
                role: 'delivery',
                active: true
              };
              
              promises.push(
                new Promise((resolve, reject) => {
                  db.query('INSERT INTO staff SET ?', deliveryStaff, (err, result) => {
                    if (err) {
                      console.error('Error creating delivery staff:', err);
                      reject(err);
                    } else {
                      console.log('Demo delivery staff created successfully!');
                      resolve();
                    }
                  });
                })
              );
            } else {
              console.log('Demo delivery staff account already exists.');
            }
            
            // Wait for all operations to complete
            if (promises.length > 0) {
              await Promise.all(promises);
              console.log('All demo accounts have been set up.');
            } else {
              console.log('All demo accounts are already set up.');
            }
            
            // Test login for each demo account to ensure passwords work
            console.log('\nTesting login functionality:');
            
            db.query('SELECT * FROM staff WHERE email = ?', ['kitchen@restaurant.com'], async (err, results) => {
              if (err || results.length === 0) {
                console.error('Error retrieving kitchen staff for login test:', err);
              } else {
                const staff = results[0];
                try {
                  const isMatch = await bcrypt.compare('kitchen123', staff.password);
                  console.log(`Kitchen staff login test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
                } catch (error) {
                  console.error('Error testing kitchen staff login:', error);
                }
              }
              
              db.query('SELECT * FROM staff WHERE email = ?', ['delivery@restaurant.com'], async (err, results) => {
                if (err || results.length === 0) {
                  console.error('Error retrieving delivery staff for login test:', err);
                } else {
                  const staff = results[0];
                  try {
                    const isMatch = await bcrypt.compare('delivery123', staff.password);
                    console.log(`Delivery staff login test: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
                  } catch (error) {
                    console.error('Error testing delivery staff login:', error);
                  }
                }
                
                console.log('\nDemo Credentials:');
                console.log('Kitchen Staff - Email: kitchen@restaurant.com, Password: kitchen123');
                console.log('Delivery Staff - Email: delivery@restaurant.com, Password: delivery123');
                
                db.end();
              });
            });
          } catch (error) {
            console.error('Error setting up demo accounts:', error);
            db.end();
            process.exit(1);
          }
        });
      });
    }
  });
});
