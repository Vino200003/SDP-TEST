import { useState, useEffect } from 'react';
import { getAllMenuItems, getMenuCategories, getMenuItemsByCategory } from '../utils/api';
import MenuItem from '../components/MenuItem';
import Footer from '../components/Footer';
import { menuHeaderImage } from '../assets/imageData';
import '../styles/MenuPage.css';

const MenuPage = () => {
  // State for menu data
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filtering
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch menu data when component mounts
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        
        // Get categories
        const categoriesData = await getMenuCategories();
        
        // Sort categories to ensure promotion is first
        const sortedCategories = [...categoriesData].sort((a, b) => {
          // Check if either category is a promotion
          const aIsPromotion = a.category_name.toLowerCase().includes('promotion');
          const bIsPromotion = b.category_name.toLowerCase().includes('promotion');
          
          if (aIsPromotion && !bIsPromotion) return -1; // a comes first
          if (!aIsPromotion && bIsPromotion) return 1;  // b comes first
          return 0; // keep original order
        });
        
        setCategories(sortedCategories);
        
        // Get all menu items
        const menuData = await getAllMenuItems();
        setMenuItems(menuData);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch menu data:', err);
        setError('Failed to load menu data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMenuData();
  }, []);
  
  // Handle category change
  const handleCategoryChange = async (categoryCode) => {
    try {
      setLoading(true);
      setSelectedCategory(categoryCode);
      setError(null); // Clear any previous errors
      
      let filteredItems;
      if (categoryCode === 'all') {
        filteredItems = await getAllMenuItems();
      } else {
        filteredItems = await getMenuItemsByCategory(categoryCode);
      }
      
      setMenuItems(filteredItems);
      setLoading(false);
    } catch (err) {
      console.error('Failed to filter menu by category:', err);
      setError('Failed to filter menu. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter menu items by search term
  const filteredItems = searchTerm
    ? menuItems.filter(item => 
        item.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category_name && item.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subcategory_name && item.subcategory_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : menuItems;
  
  // Group menu items by category and subcategory for display
  const groupedMenuItems = filteredItems.reduce((acc, item) => {
    const category = item.category_name || 'Uncategorized';
    const subcategory = item.subcategory_name || 'Other';
    
    if (!acc[category]) {
      acc[category] = {};
    }
    
    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }
    
    acc[category][subcategory].push(item);
    return acc;
  }, {});

  return (
    <div className="menu-page">
      <div className="menu-header" style={{ backgroundImage: `url(${menuHeaderImage})` }}>
        <div className="menu-overlay"></div>
        <div className="menu-content">
          <h2>Our Menu</h2>
          <p>Explore our delicious offerings made with the finest ingredients</p>
        </div>
      </div>
      
      <div className="menu-container">
        <div className="menu-filters">
          <h3>Filters</h3>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="category-filters">
            <h4>Categories</h4>
            <div className="category-list">
              <button
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All Items
              </button>
              
              {categories.map(category => (
                <button
                  key={category.category_code}
                  className={`category-btn ${selectedCategory === category.category_code ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.category_code)}
                >
                  {category.category_name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="menu-items-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading menu items...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="no-items-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>No menu items found. Try adjusting your search or filters.</p>
            </div>
          ) : (
            Object.keys(groupedMenuItems).map(category => (
              <div key={category} className="menu-category-section">
                <h2 className="category-title">{category}</h2>
                
                {Object.keys(groupedMenuItems[category]).map(subcategory => (
                  <div key={`${category}-${subcategory}`} className="menu-subcategory-section">
                    <h3 className="subcategory-title">{subcategory}</h3>
                    
                    <div className="menu-items-grid">
                      {groupedMenuItems[category][subcategory].map(item => (
                        <MenuItem key={item.menu_id} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MenuPage;
