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
  
  // Check if orders table exists
  db.query("SHOW TABLES LIKE 'orders'", (err, tables) => {
    if (err) {
      console.error('Error checking for orders table:', err);
      db.end();
      process.exit(1);
    }
    
    if (tables.length === 0) {
      console.log('Orders table does not exist. Please create the orders table first.');
      db.end();
      process.exit(1);
    } else {
      console.log('Orders table exists. Checking structure...');
      
      // Check if the zone_id column exists in orders table
      db.query("SHOW COLUMNS FROM orders LIKE 'zone_id'", (err, columns) => {
        if (err) {
          console.error('Error checking orders table structure:', err);
          db.end();
          process.exit(1);
        }
        
        if (columns.length === 0) {
          console.log('zone_id column is missing in orders table. Adding it...');
          
          // Add zone_id column with foreign key 
          db.query(`
            ALTER TABLE orders 
            ADD COLUMN zone_id INT NULL COMMENT 'References delivery_zones',
            ADD FOREIGN KEY (zone_id) REFERENCES delivery_zones(zone_id) ON DELETE SET NULL
          `, (err) => {
            if (err) {
              console.error('Error adding zone_id column:', err);
              // If the error is because delivery_zones doesn't exist, suggest creating it
              if (err.code === 'ER_CANNOT_ADD_FOREIGN' || err.code === 'ER_NO_REFERENCED_ROW_2') {
                console.error('Please run setupDeliveryZones.js script first to create the delivery_zones table.');
              }
              db.end();
              process.exit(1);
            }
            
            console.log('zone_id column added successfully to orders table!');
            checkOtherColumns();
          });
        } else {
          console.log('zone_id column already exists in orders table.');
          checkOtherColumns();
        }
      });
    }
  });
  
  function checkOtherColumns() {
    // Check if the sub_total column exists - it's used in the createOrder function
    db.query("SHOW COLUMNS FROM orders LIKE 'sub_total'", (err, columns) => {
      if (err) {
        console.error('Error checking for sub_total column:', err);
        db.end();
        process.exit(1);
      }
      
      if (columns.length === 0) {
        console.log('sub_total column is missing. Adding it...');
        
        // Add sub_total column
        db.query("ALTER TABLE orders ADD COLUMN sub_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER delivery_status", (err) => {
          if (err) {
            console.error('Error adding sub_total column:', err);
            db.end();
            process.exit(1);
          }
          
          console.log('sub_total column added successfully!');
          checkOrderTypeColumn();
        });
      } else {
        console.log('sub_total column already exists.');
        checkOrderTypeColumn();
      }
    });
  }
  
  function checkOrderTypeColumn() {
    // Check the order_type column for proper values
    db.query("SHOW COLUMNS FROM orders LIKE 'order_type'", (err, columns) => {
      if (err) {
        console.error('Error checking order_type column:', err);
        db.end();
        process.exit(1);
      }
      
      if (columns.length > 0) {
        const column = columns[0];
        // If the ENUM doesn't include 'Takeaway', update it
        if (!column.Type.includes('Takeaway')) {
          console.log('Updating order_type ENUM to include Takeaway...');
          
          db.query("ALTER TABLE orders MODIFY COLUMN order_type ENUM('Dine-in', 'Takeaway', 'Delivery') NOT NULL", (err) => {
            if (err) {
              console.error('Error updating order_type ENUM:', err);
              db.end();
              process.exit(1);
            }
            
            console.log('order_type ENUM updated to include Takeaway.');
            displayOrdersTable();
          });
        } else {
          console.log('order_type column has correct ENUM values.');
          displayOrdersTable();
        }
      } else {
        console.error('order_type column is missing!');
        db.end();
        process.exit(1);
      }
    });
  }
  
  function displayOrdersTable() {
    // Show the orders table structure
    db.query("DESCRIBE orders", (err, description) => {
      if (err) {
        console.error('Error describing orders table:', err);
        db.end();
        process.exit(1);
      }
      
      console.log('Orders table structure:');
      console.table(description);
      
      console.log('Update completed successfully!');
      db.end();
      process.exit(0);
    });
  }
});
