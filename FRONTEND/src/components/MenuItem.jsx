import React, { useState, useEffect } from 'react';
import '../styles/MenuItem.css';
import { defaultFoodImage } from '../assets/imageData';

const MenuItem = ({ item }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(0);

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.src = defaultFoodImage;
  };

  // Format price to always show 2 decimal places
  const formattedPrice = parseFloat(item.price).toFixed(2);

  // Check if the item is already in the cart
  useEffect(() => {
    const checkCart = () => {
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = currentCart.find(cartItem => cartItem.id === item.menu_id);
      if (existingItem) {
        setQuantity(existingItem.quantity);
      } else {
        setQuantity(0);
      }
    };

    checkCart();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', checkCart);
    
    return () => {
      window.removeEventListener('cartUpdated', checkCart);
    };
  }, [item.menu_id]);

  // Add to cart function
  const addToCart = () => {
    setIsAddingToCart(true);
    
    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.menu_id);
    
    if (existingItemIndex >= 0) {
      // Item exists, increase quantity
      currentCart[existingItemIndex].quantity += 1;
    } else {
      // Item doesn't exist, add new item
      currentCart.push({
        id: item.menu_id,
        name: item.menu_name,
        price: item.price,
        image_url: item.image_url || defaultFoodImage,
        quantity: 1,
        category: item.category_name,
        subcategory: item.subcategory_name
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Dispatch custom event to notify other components (like Navbar) that cart has been updated
    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
    
    // Reset button state after a short delay
    setTimeout(() => {
      setIsAddingToCart(false);
      setQuantity(1);
    }, 1000);
  };

  // Update item quantity
  const updateQuantity = (newQuantity) => {
    // Prevent negative quantities
    if (newQuantity < 0) return;
    
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.menu_id);
    
    if (existingItemIndex >= 0) {
      if (newQuantity === 0) {
        // Remove item if quantity is 0
        currentCart.splice(existingItemIndex, 1);
      } else {
        // Update quantity
        currentCart[existingItemIndex].quantity = newQuantity;
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      // Update local state
      setQuantity(newQuantity);
      
      // Notify other components
      const event = new Event('cartUpdated');
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="menu-item">
      <div className="menu-item-image">
        <img 
          src={item.image_url || defaultFoodImage} 
          alt={item.menu_name} 
          onError={handleImageError}
        />
        {item.status === 'out_of_stock' && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
      </div>
      <div className="menu-item-content">
        <h3 className="menu-item-name">{item.menu_name}</h3>
        <div className="menu-item-categories">
          <span className="menu-category">{item.category_name}</span>
          {item.subcategory_name && (
            <span className="menu-subcategory">{item.subcategory_name}</span>
          )}
        </div>
        <div className="menu-item-price-row">
          <span className="menu-item-price">LKR {formattedPrice}</span>
          {item.status === 'available' ? (
            quantity > 0 ? (
              <div className="menu-quantity-controls">
                <button 
                  className="menu-quantity-btn"
                  onClick={() => updateQuantity(quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="menu-quantity">{quantity}</span>
                <button 
                  className="menu-quantity-btn"
                  onClick={() => updateQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            ) : (
              <button 
                className={`add-to-cart-btn ${isAddingToCart ? 'adding' : ''}`}
                onClick={addToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <>Adding <i className="fas fa-circle-notch fa-spin"></i></>
                ) : (
                  <>Add to Cart <i className="fas fa-cart-plus"></i></>
                )}
              </button>
            )
          ) : (
            <button className="add-to-cart-btn disabled" disabled>
              Unavailable <i className="fas fa-ban"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
