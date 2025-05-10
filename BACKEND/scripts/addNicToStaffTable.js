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
      console.log('Staff table does not exist. Run createStaffTable.js first.');
      db.end();
      process.exit(1);
    }
    
    // Check if nic column exists
    db.query("SHOW COLUMNS FROM staff LIKE 'nic'", (err, columns) => {
      if (err) {
        console.error('Error checking for nic column:', err);
        db.end();
        process.exit(1);
      }
      
      if (columns.length === 0) {
        console.log('Adding nic column to staff table...');
        
        // Add nic column
        db.query("ALTER TABLE staff ADD COLUMN nic VARCHAR(20) NULL", (err) => {
          if (err) {
            console.error('Error adding nic column:', err);
            db.end();
            process.exit(1);
          }
          
          console.log('NIC column added. Updating existing staff with default NICs...');
          
          // Get all staff members that need NICs
          db.query("SELECT staff_id FROM staff WHERE nic IS NULL", (err, staffToUpdate) => {
            if (err) {
              console.error('Error fetching staff:', err);
              db.end();
              process.exit(1);
            }
            
            if (staffToUpdate.length === 0) {
              console.log('No staff members need NIC updates.');
              makeNicUnique();
              return;
            }
            
            console.log(`Updating ${staffToUpdate.length} staff members with default NICs...`);
            
            let updated = 0;
            
            staffToUpdate.forEach((staff, index) => {
              // Generate a default NIC with staff_id to ensure uniqueness
              const defaultNic = `TEMP${staff.staff_id.toString().padStart(6, '0')}V`;
              
              db.query('UPDATE staff SET nic = ? WHERE staff_id = ?', [defaultNic, staff.staff_id], (err) => {
                if (err) {
                  console.error(`Error updating staff ${staff.staff_id}:`, err);
                } else {
                  updated++;
                  console.log(`Updated staff ${staff.staff_id} with NIC: ${defaultNic}`);
                }
                
                if (updated === staffToUpdate.length) {
                  console.log('All staff members updated with default NICs.');
                  makeNicUnique();
                }
              });
            });
          });
        });
      } else {
        console.log('NIC column already exists.');
        makeNicUnique();
      }
    });
  });
  
  function makeNicUnique() {
    // Make nic column UNIQUE and NOT NULL
    db.query("SHOW INDEX FROM staff WHERE Key_name = 'nic'", (err, indexes) => {
      if (err) {
        console.error('Error checking for nic index:', err);
        db.end();
        process.exit(1);
      }
      
      if (indexes.length === 0) {
        console.log('Making NIC column UNIQUE and NOT NULL...');
        
        // First, ensure no NULLs exist
        db.query("UPDATE staff SET nic = CONCAT('TEMP', staff_id, 'V') WHERE nic IS NULL", (err) => {
          if (err) {
            console.error('Error updating NULL NICs:', err);
            db.end();
            process.exit(1);
          }
          
          // Now add the UNIQUE constraint
          db.query("ALTER TABLE staff MODIFY nic VARCHAR(20) NOT NULL UNIQUE", (err) => {
            if (err) {
              console.error('Error making nic column UNIQUE and NOT NULL:', err);
              db.end();
              process.exit(1);
            }
            
            console.log('NIC column is now UNIQUE and NOT NULL.');
            displayStaff();
          });
        });
      } else {
        console.log('NIC column is already UNIQUE.');
        displayStaff();
      }
    });
  }
  
  function displayStaff() {
    // Show the staff table structure
    db.query("DESCRIBE staff", (err, description) => {
      if (err) {
        console.error('Error describing staff table:', err);
        db.end();
        process.exit(1);
      }
      
      console.log('Staff table structure:');
      console.table(description);
      
      // Show staff records
      db.query("SELECT * FROM staff", (err, staff) => {
        if (err) {
          console.error('Error fetching staff:', err);
          db.end();
          process.exit(1);
        }
        
        console.log('Staff records:');
        console.table(staff);
        
        console.log('Migration completed successfully!');
        db.end();
        process.exit(0);
      });
    });
  }
});
