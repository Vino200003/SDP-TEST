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
  
  // Check if delivery_zones table exists
  db.query("SHOW TABLES LIKE 'delivery_zones'", (err, results) => {
    if (err) {
      console.error('Error checking for delivery_zones table:', err);
      db.end();
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('Delivery zones table does not exist. Creating it...');
      
      const createTableSQL = `
        CREATE TABLE delivery_zones (
          zone_id INT AUTO_INCREMENT PRIMARY KEY,
          gs_division VARCHAR(50) UNIQUE NOT NULL,
          delivery_fee DECIMAL(10, 2) NOT NULL,
          estimated_delivery_time_min INT NOT NULL COMMENT 'Estimated minutes for delivery',
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_gs_division (gs_division)
        ) ENGINE=InnoDB;
      `;
      
      db.query(createTableSQL, (err) => {
        if (err) {
          console.error('Error creating delivery_zones table:', err);
          db.end();
          process.exit(1);
        }
        
        console.log('Delivery zones table created successfully');
        addDefaultDeliveryZones();
      });
    } else {
      console.log('Delivery zones table exists');
      addDefaultDeliveryZones();
    }
  });
  
  function addDefaultDeliveryZones() {
    // Default delivery zones
    const defaultZones = [
      {
        gs_division: 'Vavuniya South',
        delivery_fee: 5.00,
        estimated_delivery_time_min: 30,
        is_active: true
      },
      {
        gs_division: 'Vavuniya North',
        delivery_fee: 6.50,
        estimated_delivery_time_min: 40,
        is_active: true
      },
      {
        gs_division: 'Vavuniya',
        delivery_fee: 4.50,
        estimated_delivery_time_min: 25,
        is_active: true
      },
      {
        gs_division: 'Vengalacheddikulam',
        delivery_fee: 8.00,
        estimated_delivery_time_min: 50,
        is_active: true
      },
      {
        gs_division: 'Nedunkeni',
        delivery_fee: 7.50,
        estimated_delivery_time_min: 45,
        is_active: true
      },
      {
        gs_division: 'Cheddikulam',
        delivery_fee: 7.00,
        estimated_delivery_time_min: 45,
        is_active: true
      }
    ];
    
    // Insert each zone one by one to avoid duplicates
    let inserted = 0;
    let alreadyExists = 0;
    
    defaultZones.forEach(zone => {
      // Check if zone already exists
      db.query('SELECT * FROM delivery_zones WHERE gs_division = ?', [zone.gs_division], (err, results) => {
        if (err) {
          console.error(`Error checking for existing zone ${zone.gs_division}:`, err);
          return;
        }
        
        if (results.length > 0) {
          console.log(`Zone with gs_division ${zone.gs_division} already exists.`);
          alreadyExists++;
          checkCompletion();
        } else {
          console.log(`Creating delivery zone: ${zone.gs_division}`);
          
          db.query('INSERT INTO delivery_zones SET ?', zone, (err, result) => {
            if (err) {
              console.error(`Error creating zone ${zone.gs_division}:`, err);
            } else {
              console.log(`Delivery zone created with ID: ${result.insertId}`);
              inserted++;
            }
            checkCompletion();
          });
        }
      });
    });
    
    function checkCompletion() {
      if (inserted + alreadyExists === defaultZones.length) {
        console.log('All default delivery zones have been processed.');
        console.log(`Inserted: ${inserted}, Already existed: ${alreadyExists}`);
        
        // Show all zones
        db.query('SELECT * FROM delivery_zones', (err, zones) => {
          if (err) {
            console.error('Error fetching zones:', err);
          } else {
            console.log('Current delivery zones:');
            console.table(zones);
          }
          
          db.end();
          process.exit(0);
        });
      }
    }
  }
});
