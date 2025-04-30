/**
 * Script to create menu-related tables and seed with sample data
 * Run this script to initialize the database with menu tables and sample data
 */

const mysql = require('mysql2');
require('dotenv').config({ path: '../.env' });

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
  console.log('Connected to the MySQL database successfully');
  
  // Create tables
  createTables()
    .then(() => {
      console.log('Tables created successfully');
      return seedData();
    })
    .then(() => {
      console.log('Sample data inserted successfully');
      db.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error setting up database:', err);
      db.end();
      process.exit(1);
    });
});

// Create tables
async function createTables() {
  // Create categories table
  await queryPromise(`
    CREATE TABLE IF NOT EXISTS categories (
      category_code INT AUTO_INCREMENT PRIMARY KEY,
      category_name VARCHAR(100) NOT NULL
    )
  `);
  
  // Create subcategories table
  await queryPromise(`
    CREATE TABLE IF NOT EXISTS subcategories (
      subcategory_code INT AUTO_INCREMENT PRIMARY KEY,
      subcategory_name VARCHAR(100) NOT NULL,
      category_code INT,
      FOREIGN KEY (category_code) REFERENCES categories(category_code)
        ON DELETE CASCADE
    )
  `);
  
  // Create menu table
  await queryPromise(`
    CREATE TABLE IF NOT EXISTS menu (
      menu_id INT AUTO_INCREMENT PRIMARY KEY,
      menu_name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      status ENUM('available', 'out_of_stock') DEFAULT 'available',
      category_code INT,
      subcategory_code INT,
      image_url VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_code) REFERENCES categories(category_code)
        ON DELETE SET NULL,
      FOREIGN KEY (subcategory_code) REFERENCES subcategories(subcategory_code)
        ON DELETE SET NULL
    )
  `);
}

// Seed sample data
async function seedData() {
  // Check if categories table is empty
  const categoriesCount = await getTableCount('categories');
  
  if (categoriesCount === 0) {
    // Insert sample categories
    const categories = [
      { category_name: 'Appetizers' },
      { category_name: 'Main Courses' },
      { category_name: 'Desserts' },
      { category_name: 'Beverages' }
    ];
    
    for (const category of categories) {
      await queryPromise('INSERT INTO categories SET ?', category);
    }
    
    console.log('Inserted sample categories');
    
    // Get the inserted category IDs
    const categoryResults = await queryPromise('SELECT * FROM categories');
    
    // Insert sample subcategories
    const subcategories = [
      { subcategory_name: 'Soups', category_code: getCategoryCodeByName(categoryResults, 'Appetizers') },
      { subcategory_name: 'Salads', category_code: getCategoryCodeByName(categoryResults, 'Appetizers') },
      { subcategory_name: 'Pasta', category_code: getCategoryCodeByName(categoryResults, 'Main Courses') },
      { subcategory_name: 'Steaks', category_code: getCategoryCodeByName(categoryResults, 'Main Courses') },
      { subcategory_name: 'Seafood', category_code: getCategoryCodeByName(categoryResults, 'Main Courses') },
      { subcategory_name: 'Cakes', category_code: getCategoryCodeByName(categoryResults, 'Desserts') },
      { subcategory_name: 'Ice Cream', category_code: getCategoryCodeByName(categoryResults, 'Desserts') },
      { subcategory_name: 'Hot Beverages', category_code: getCategoryCodeByName(categoryResults, 'Beverages') },
      { subcategory_name: 'Cold Beverages', category_code: getCategoryCodeByName(categoryResults, 'Beverages') }
    ];
    
    for (const subcategory of subcategories) {
      await queryPromise('INSERT INTO subcategories SET ?', subcategory);
    }
    
    console.log('Inserted sample subcategories');
    
    // Get the inserted subcategory IDs
    const subcategoryResults = await queryPromise('SELECT * FROM subcategories');
    
    // Insert sample menu items
    const menuItems = [
      {
        menu_name: 'Tomato Soup',
        price: 6.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Appetizers'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Soups'),
        image_url: 'https://example.com/tomato-soup.jpg'
      },
      {
        menu_name: 'Caesar Salad',
        price: 8.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Appetizers'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Salads'),
        image_url: 'https://example.com/caesar-salad.jpg'
      },
      {
        menu_name: 'Spaghetti Carbonara',
        price: 14.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Main Courses'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Pasta'),
        image_url: 'https://example.com/spaghetti-carbonara.jpg'
      },
      {
        menu_name: 'Ribeye Steak',
        price: 24.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Main Courses'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Steaks'),
        image_url: 'https://example.com/ribeye-steak.jpg'
      },
      {
        menu_name: 'Grilled Salmon',
        price: 19.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Main Courses'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Seafood'),
        image_url: 'https://example.com/grilled-salmon.jpg'
      },
      {
        menu_name: 'Chocolate Cake',
        price: 7.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Desserts'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Cakes'),
        image_url: 'https://example.com/chocolate-cake.jpg'
      },
      {
        menu_name: 'Vanilla Ice Cream',
        price: 5.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Desserts'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Ice Cream'),
        image_url: 'https://example.com/vanilla-ice-cream.jpg'
      },
      {
        menu_name: 'Coffee',
        price: 3.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Beverages'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Hot Beverages'),
        image_url: 'https://example.com/coffee.jpg'
      },
      {
        menu_name: 'Iced Tea',
        price: 2.99,
        status: 'available',
        category_code: getCategoryCodeByName(categoryResults, 'Beverages'),
        subcategory_code: getSubcategoryCodeByName(subcategoryResults, 'Cold Beverages'),
        image_url: 'https://example.com/iced-tea.jpg'
      }
    ];
    
    for (const menuItem of menuItems) {
      await queryPromise('INSERT INTO menu SET ?', menuItem);
    }
    
    console.log('Inserted sample menu items');
  } else {
    console.log('Tables already contain data, skipping seed');
  }
}

// Helper function to get category code by name
function getCategoryCodeByName(categories, name) {
  const category = categories.find(c => c.category_name === name);
  return category ? category.category_code : null;
}

// Helper function to get subcategory code by name
function getSubcategoryCodeByName(subcategories, name) {
  const subcategory = subcategories.find(s => s.subcategory_name === name);
  return subcategory ? subcategory.subcategory_code : null;
}

// Helper function to get table row count
function getTableCount(tableName) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT COUNT(*) AS count FROM ${tableName}`, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results[0].count);
    });
  });
}

// Helper function to promisify database queries
function queryPromise(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(results);
    });
  });
}
