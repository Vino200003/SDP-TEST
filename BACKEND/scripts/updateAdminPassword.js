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
  
  // Get admin record for Vino
  db.query("SELECT * FROM admin WHERE email = 'jenivimaha@gmail.com'", async (err, results) => {
    if (err) {
      console.error('Error fetching admin record:', err);
      db.end();
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('Admin not found. Creating a new record...');
      createAdmin();
    } else {
      console.log('Admin found. Updating password...');
      const admin = results[0];
      updatePassword(admin);
    }
  });
  
  function createAdmin() {
    // Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error('Error generating salt:', err);
        db.end();
        process.exit(1);
      }
      
      bcrypt.hash('admin1234', salt, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          db.end();
          process.exit(1);
        }
        
        const adminUser = {
          first_name: 'Vino',
          last_name: 'Admin',
          email: 'jenivimaha@gmail.com',
          password: hash,
          phone_number: '0784214707'
        };
        
        db.query('INSERT INTO admin SET ?', adminUser, (err, result) => {
          if (err) {
            console.error('Error creating admin user:', err);
            db.end();
            process.exit(1);
          }
          
          console.log('Admin user created successfully with ID:', result.insertId);
          console.log('Email: jenivimaha@gmail.com');
          console.log('Password: admin1234 (now properly hashed)');
          db.end();
          process.exit(0);
        });
      });
    });
  }
  
  function updatePassword(admin) {
    // Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error('Error generating salt:', err);
        db.end();
        process.exit(1);
      }
      
      bcrypt.hash('admin1234', salt, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          db.end();
          process.exit(1);
        }
        
        db.query('UPDATE admin SET password = ? WHERE admin_id = ?', [hash, admin.admin_id], (err) => {
          if (err) {
            console.error('Error updating admin password:', err);
            db.end();
            process.exit(1);
          }
          
          console.log('Admin password updated successfully');
          console.log('Email: jenivimaha@gmail.com');
          console.log('Password: admin1234 (now properly hashed)');
          db.end();
          process.exit(0);
        });
      });
    });
  }
});
