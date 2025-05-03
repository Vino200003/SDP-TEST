import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../styles/MenuManagement.css';

function MenuManagement() {
  // State for menu items
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'categories', 'subcategories'
  
  // State for forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  // New menu item form state
  const [newItem, setNewItem] = useState({
    menu_name: '',
    price: '',
    status: 'available',
    category_code: '',
    subcategory_code: '',
    image_url: ''
  });

  // Additional state for category management
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ category_name: '' });
  
  // Additional state for subcategory management
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [isEditSubcategoryModalOpen, setIsEditSubcategoryModalOpen] = useState(false);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [newSubcategory, setNewSubcategory] = useState({ 
    subcategory_name: '', 
    category_code: '' 
  });

  // Fetch menu items, categories, and subcategories (mock data for now)
  useEffect(() => {
    // Simulating API calls - replace with actual API calls to your backend
    const fetchMenuData = () => {
      // Mock data - replace with API calls
      const mockMenuItems = [
        { menu_id: 1, menu_name: 'Margherita Pizza', price: 12.99, status: 'available', category_code: 1, subcategory_code: 1, image_url: 'pizza1.jpg' },
        { menu_id: 2, menu_name: 'Pepperoni Pizza', price: 14.99, status: 'available', category_code: 1, subcategory_code: 1, image_url: 'pizza2.jpg' },
        { menu_id: 3, menu_name: 'Caesar Salad', price: 8.99, status: 'available', category_code: 2, subcategory_code: 3, image_url: 'salad1.jpg' },
        { menu_id: 4, menu_name: 'Chocolate Cake', price: 6.99, status: 'available', category_code: 3, subcategory_code: 5, image_url: 'dessert1.jpg' },
      ];
      
      const mockCategories = [
        { category_code: 1, category_name: 'Main Course' },
        { category_code: 2, category_name: 'Appetizers' },
        { category_code: 3, category_name: 'Desserts' },
      ];
      
      const mockSubcategories = [
        { subcategory_code: 1, subcategory_name: 'Pizza', category_code: 1 },
        { subcategory_code: 2, subcategory_name: 'Pasta', category_code: 1 },
        { subcategory_code: 3, subcategory_name: 'Salads', category_code: 2 },
        { subcategory_code: 4, subcategory_name: 'Soups', category_code: 2 },
        { subcategory_code: 5, subcategory_name: 'Cakes', category_code: 3 },
      ];
      
      setMenuItems(mockMenuItems);
      setCategories(mockCategories);
      setSubcategories(mockSubcategories);
    };
    
    fetchMenuData();
  }, []);
  
  // Handle adding a new menu item
  const handleAddItem = () => {
    // In a real app, you would send this to your API
    const newId = menuItems.length + 1;
    const itemToAdd = { ...newItem, menu_id: newId };
    setMenuItems([...menuItems, itemToAdd]);
    setIsAddModalOpen(false);
    setNewItem({
      menu_name: '',
      price: '',
      status: 'available',
      category_code: '',
      subcategory_code: '',
      image_url: ''
    });
  };
  
  // Handle editing a menu item
  const handleEditItem = () => {
    if (!currentItem) return;
    
    // In a real app, you would send this to your API
    const updatedItems = menuItems.map(item => 
      item.menu_id === currentItem.menu_id ? currentItem : item
    );
    
    setMenuItems(updatedItems);
    setIsEditModalOpen(false);
    setCurrentItem(null);
  };
  
  // Handle deleting a menu item
  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      // In a real app, you would send this to your API
      const filteredItems = menuItems.filter(item => item.menu_id !== id);
      setMenuItems(filteredItems);
    }
  };
  
  // Handle adding a new category
  const handleAddCategory = () => {
    // In a real app, you would send this to your API
    const newId = categories.length + 1;
    const categoryToAdd = { ...newCategory, category_code: newId };
    setCategories([...categories, categoryToAdd]);
    setIsAddCategoryModalOpen(false);
    setNewCategory({ category_name: '' });
  };
  
  // Handle editing a category
  const handleEditCategory = () => {
    if (!currentCategory) return;
    
    // In a real app, you would send this to your API
    const updatedCategories = categories.map(category => 
      category.category_code === currentCategory.category_code ? currentCategory : category
    );
    
    setCategories(updatedCategories);
    setIsEditCategoryModalOpen(false);
    setCurrentCategory(null);
  };
  
  // Handle deleting a category
  const handleDeleteCategory = (id) => {
    // Check if category has menu items
    const hasItems = menuItems.some(item => item.category_code === id);
    if (hasItems) {
      alert('Cannot delete category that has menu items. Please reassign or delete the items first.');
      return;
    }
    
    // Check if category has subcategories
    const hasSubcategories = subcategories.some(sub => sub.category_code === id);
    if (hasSubcategories) {
      alert('Cannot delete category that has subcategories. Please reassign or delete the subcategories first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      // In a real app, you would send this to your API
      const filteredCategories = categories.filter(category => category.category_code !== id);
      setCategories(filteredCategories);
    }
  };
  
  // Handle adding a new subcategory
  const handleAddSubcategory = () => {
    // In a real app, you would send this to your API
    const newId = subcategories.length + 1;
    const subcategoryToAdd = { ...newSubcategory, subcategory_code: newId };
    setSubcategories([...subcategories, subcategoryToAdd]);
    setIsAddSubcategoryModalOpen(false);
    setNewSubcategory({ subcategory_name: '', category_code: '' });
  };
  
  // Handle editing a subcategory
  const handleEditSubcategory = () => {
    if (!currentSubcategory) return;
    
    // In a real app, you would send this to your API
    const updatedSubcategories = subcategories.map(subcategory => 
      subcategory.subcategory_code === currentSubcategory.subcategory_code ? currentSubcategory : subcategory
    );
    
    setSubcategories(updatedSubcategories);
    setIsEditSubcategoryModalOpen(false);
    setCurrentSubcategory(null);
  };
  
  // Handle deleting a subcategory
  const handleDeleteSubcategory = (id) => {
    // Check if subcategory has menu items
    const hasItems = menuItems.some(item => item.subcategory_code === id);
    if (hasItems) {
      alert('Cannot delete subcategory that has menu items. Please reassign or delete the items first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      // In a real app, you would send this to your API
      const filteredSubcategories = subcategories.filter(subcategory => subcategory.subcategory_code !== id);
      setSubcategories(filteredSubcategories);
    }
  };
  
  // Get category/subcategory name by code
  const getCategoryName = (code) => {
    const category = categories.find(cat => cat.category_code === code);
    return category ? category.category_name : 'Unknown';
  };
  
  const getSubcategoryName = (code) => {
    const subcategory = subcategories.find(sub => sub.subcategory_code === code);
    return subcategory ? subcategory.subcategory_name : 'Unknown';
  };

  return (
    <div className="menu-management-container">
      <Sidebar />
      <main className="menu-management-content">
        <Header title="Menu Management" />
        
        <div className="view-buttons">
          <button 
            className={`view-button ${currentView === 'menu' ? 'active' : ''}`}
            onClick={() => setCurrentView('menu')}
          >
            Menu Items
          </button>
          <button 
            className={`view-button ${currentView === 'categories' ? 'active' : ''}`}
            onClick={() => setCurrentView('categories')}
          >
            Categories
          </button>
          <button 
            className={`view-button ${currentView === 'subcategories' ? 'active' : ''}`}
            onClick={() => setCurrentView('subcategories')}
          >
            Subcategories
          </button>
        </div>
        
        {/* Menu Items View */}
        {currentView === 'menu' && (
          <div className="menu-items-section">
            <div className="section-header">
              <h2>Menu Items</h2>
              <button 
                className="add-button"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add New Item
              </button>
            </div>
            
            <div className="menu-items-list">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.menu_id}>
                      <td>{item.menu_id}</td>
                      <td>
                        <div className="menu-item-image">
                          {item.image_url ? (
                            <img src={`/src/assets/menu/${item.image_url}`} alt={item.menu_name} />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </div>
                      </td>
                      <td>{item.menu_name}</td>
                      <td>${item.price}</td>
                      <td>{getCategoryName(item.category_code)}</td>
                      <td>{getSubcategoryName(item.subcategory_code)}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'available' ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-button"
                            onClick={() => {
                              setCurrentItem(item);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteItem(item.menu_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Updated Categories View */}
        {currentView === 'categories' && (
          <div className="categories-section">
            <div className="section-header">
              <h2>Categories</h2>
              <button 
                className="add-button" 
                onClick={() => setIsAddCategoryModalOpen(true)}
              >
                Add Category
              </button>
            </div>
            
            <div className="categories-list">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Items Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.category_code}>
                      <td>{category.category_code}</td>
                      <td>{category.category_name}</td>
                      <td>
                        {menuItems.filter(item => item.category_code === category.category_code).length}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-button"
                            onClick={() => {
                              setCurrentCategory(category);
                              setIsEditCategoryModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteCategory(category.category_code)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Updated Subcategories View */}
        {currentView === 'subcategories' && (
          <div className="subcategories-section">
            <div className="section-header">
              <h2>Subcategories</h2>
              <button 
                className="add-button"
                onClick={() => setIsAddSubcategoryModalOpen(true)}
              >
                Add Subcategory
              </button>
            </div>
            
            <div className="subcategories-list">
              <table className="subcategory-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Parent Category</th>
                    <th>Items Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.map(subcategory => (
                    <tr key={subcategory.subcategory_code}>
                      <td>{subcategory.subcategory_code}</td>
                      <td>{subcategory.subcategory_name}</td>
                      <td>{getCategoryName(subcategory.category_code)}</td>
                      <td>
                        {menuItems.filter(item => item.subcategory_code === subcategory.subcategory_code).length}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-button"
                            onClick={() => {
                              setCurrentSubcategory(subcategory);
                              setIsEditSubcategoryModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteSubcategory(subcategory.subcategory_code)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Add Item Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Menu Item</h2>
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={newItem.menu_name}
                  onChange={(e) => setNewItem({...newItem, menu_name: e.target.value})}
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="form-group">
                <label>Price</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  placeholder="Enter price"
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newItem.category_code}
                  onChange={(e) => setNewItem({...newItem, category_code: parseInt(e.target.value)})}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.category_code} value={category.category_code}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Subcategory</label>
                <select
                  value={newItem.subcategory_code}
                  onChange={(e) => setNewItem({...newItem, subcategory_code: parseInt(e.target.value)})}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories
                    .filter(sub => !newItem.category_code || sub.category_code === newItem.category_code)
                    .map(subcategory => (
                      <option key={subcategory.subcategory_code} value={subcategory.subcategory_code}>
                        {subcategory.subcategory_name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="text" 
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                  placeholder="Enter image URL"
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleAddItem}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Item Modal */}
        {isEditModalOpen && currentItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Menu Item</h2>
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={currentItem.menu_name}
                  onChange={(e) => setCurrentItem({...currentItem, menu_name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Price</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({...currentItem, price: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={currentItem.category_code}
                  onChange={(e) => setCurrentItem({...currentItem, category_code: parseInt(e.target.value)})}
                >
                  {categories.map(category => (
                    <option key={category.category_code} value={category.category_code}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Subcategory</label>
                <select
                  value={currentItem.subcategory_code}
                  onChange={(e) => setCurrentItem({...currentItem, subcategory_code: parseInt(e.target.value)})}
                >
                  {subcategories
                    .filter(sub => sub.category_code === currentItem.category_code)
                    .map(subcategory => (
                      <option key={subcategory.subcategory_code} value={subcategory.subcategory_code}>
                        {subcategory.subcategory_name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={currentItem.status}
                  onChange={(e) => setCurrentItem({...currentItem, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="text" 
                  value={currentItem.image_url}
                  onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleEditItem}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Category Modal */}
        {isAddCategoryModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Category</h2>
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={newCategory.category_name}
                  onChange={(e) => setNewCategory({...newCategory, category_name: e.target.value})}
                  placeholder="Enter category name"
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleAddCategory}
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Category Modal */}
        {isEditCategoryModalOpen && currentCategory && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Category</h2>
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={currentCategory.category_name}
                  onChange={(e) => setCurrentCategory({...currentCategory, category_name: e.target.value})}
                  placeholder="Enter category name"
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setIsEditCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleEditCategory}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Subcategory Modal */}
        {isAddSubcategoryModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Subcategory</h2>
              <div className="form-group">
                <label>Subcategory Name</label>
                <input 
                  type="text" 
                  value={newSubcategory.subcategory_name}
                  onChange={(e) => setNewSubcategory({...newSubcategory, subcategory_name: e.target.value})}
                  placeholder="Enter subcategory name"
                />
              </div>
              
              <div className="form-group">
                <label>Parent Category</label>
                <select
                  value={newSubcategory.category_code}
                  onChange={(e) => setNewSubcategory({...newSubcategory, category_code: parseInt(e.target.value)})}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.category_code} value={category.category_code}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setIsAddSubcategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleAddSubcategory}
                >
                  Add Subcategory
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Subcategory Modal */}
        {isEditSubcategoryModalOpen && currentSubcategory && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Subcategory</h2>
              <div className="form-group">
                <label>Subcategory Name</label>
                <input 
                  type="text" 
                  value={currentSubcategory.subcategory_name}
                  onChange={(e) => setCurrentSubcategory({...currentSubcategory, subcategory_name: e.target.value})}
                  placeholder="Enter subcategory name"
                />
              </div>
              
              <div className="form-group">
                <label>Parent Category</label>
                <select
                  value={currentSubcategory.category_code}
                  onChange={(e) => setCurrentSubcategory({...currentSubcategory, category_code: parseInt(e.target.value)})}
                >
                  {categories.map(category => (
                    <option key={category.category_code} value={category.category_code}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setIsEditSubcategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleEditSubcategory}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MenuManagement;
