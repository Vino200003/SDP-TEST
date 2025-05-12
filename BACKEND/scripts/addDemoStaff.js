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
  
  // Demo staff members
  const demoStaff = [
    {
      first_name: 'Kitchen',
      last_name: 'Staff',
      nic: 'K1001-123456',
      email: 'kitchen@restaurant.com',
      phone_number: '1234567890',
      role: 'chef',
      active: true
    },
    {
      first_name: 'Delivery',
      last_name: 'Staff',
      nic: 'D2001-654321',
      email: 'delivery@restaurant.com',
      phone_number: '0987654321',
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
    
    // Hash kitchen123 password
    bcrypt.hash('kitchen123', salt, (err, kitchenHash) => {
      if (err) {
        console.error('Error hashing kitchen password:', err);
        db.end();
        process.exit(1);
      }
      
      // Hash delivery123 password
      bcrypt.hash('delivery123', salt, (err, deliveryHash) => {
        if (err) {
          console.error('Error hashing delivery password:', err);
          db.end();
          process.exit(1);
        }
        
        // Add passwords to staff objects
        demoStaff[0].password = kitchenHash;
        demoStaff[1].password = deliveryHash;
        
        // Insert or update demo staff
        let processed = 0;
        
        demoStaff.forEach(staff => {
          // Check if staff email already exists
          db.query('SELECT staff_id FROM staff WHERE email = ?', [staff.email], (err, results) => {
            if (err) {
              console.error(`Error checking for staff ${staff.email}:`, err);
              checkCompletion();
              return;
            }
            
            if (results.length > 0) {
              // Update existing staff
              const staffId = results[0].staff_id;
              const { email, ...updateData } = staff;
              
              db.query('UPDATE staff SET ? WHERE staff_id = ?', [updateData, staffId], (err) => {
                if (err) {
                  console.error(`Error updating staff ${staff.email}:`, err);
                } else {
                  console.log(`Updated demo staff: ${staff.email}`);
                }
                checkCompletion();
              });
            } else {
              // Insert new staff
              db.query('INSERT INTO staff SET ?', staff, (err) => {
                if (err) {
                  console.error(`Error inserting staff ${staff.email}:`, err);
                } else {
                  console.log(`Created demo staff: ${staff.email}`);
                }
                checkCompletion();
              });
            }
          });
        });
        
        function checkCompletion() {
          processed++;
          if (processed === demoStaff.length) {
            console.log('Demo staff setup complete!');
            console.log('\nDemo credentials:');
            console.log('Kitchen Staff - Email: kitchen@restaurant.com, Password: kitchen123');
            console.log('Delivery Staff - Email: delivery@restaurant.com, Password: delivery123');
            db.end();
          }
        }
      });
    });
  });
});
