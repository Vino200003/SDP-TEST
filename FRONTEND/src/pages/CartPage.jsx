import { useState, useEffect } from 'react';
import '../styles/CartPage.css';
import Footer from '../components/Footer';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on component mount
  useEffect(() => {
    setIsLoading(true);
    try {
      // Load cart
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    }
    setIsLoading(false);
  }, []);

  // Calculate subtotal whenever cart items change
  useEffect(() => {
    // Calculate subtotal
    const newSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
  }, [cart]);

  // Format price to always show 2 decimal places
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    
    // Navigate to checkout page
    if (window.navigateTo) {
      window.navigateTo('/checkout');
    } else {
      window.location.href = '/checkout';
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (index, change) => {
    const updatedCart = [...cart];
    const newQuantity = updatedCart[index].quantity + change;
    
    if (newQuantity <= 0) {
      // Remove item if quantity becomes zero or negative
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQuantity;
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Dispatch cart updated event for navbar counter
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Handle removal of item
  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Dispatch cart updated event for navbar counter
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Dispatch cart updated event for navbar counter
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Continue shopping
  const handleContinueShopping = () => {
    if (window.navigateTo) {
      window.navigateTo('/menu');
    } else {
      window.location.href = '/menu';
    }
  };

  if (isLoading) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <div className="cart-overlay"></div>
          <div className="cart-content">
            <h2>Your Cart</h2>
            <p>Review your items before checkout</p>
          </div>
        </div>
        <div className="cart-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <div className="cart-overlay"></div>
          <div className="cart-content">
            <h2>Your Cart</h2>
            <p>Review your items before checkout</p>
          </div>
        </div>
        <div className="cart-container">
          <div className="empty-cart">
            <i className="fas fa-shopping-cart"></i>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <button 
              className="continue-shopping-btn"
              onClick={handleContinueShopping}
            >
              <i className="fas fa-utensils"></i> Browse Menu
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="cart-overlay"></div>
        <div className="cart-content">
          <h2>Your Cart</h2>
          <p>Review your items before checkout</p>
        </div>
      </div>
      
      <div className="cart-container">
        <div className="cart-content-wrapper">
          <div className="cart-items-container">
            <h3>Cart Items ({cart.length})</h3>
            
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image_url || 'https://via.placeholder.com/100x100'} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <div className="item-price">LKR {formatPrice(item.price)} each</div>
                  {item.special_instructions && (
                    <div className="special-instructions">
                      <span>Special Instructions:</span> {item.special_instructions}
                    </div>
                  )}
                </div>
                <div className="cart-item-actions">
                  <div className="item-total">LKR {formatPrice(item.price * item.quantity)}</div>
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(index, -1)}
                    >-</button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(index, 1)}
                    >+</button>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <i className="fas fa-trash-alt"></i> Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="cart-actions">
              <button 
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </button>
              <button 
                className="clear-cart-btn"
                onClick={handleClearCart}
              >
                <i className="fas fa-trash"></i> Clear Cart
              </button>
            </div>
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-row total">
                <span className="summary-label">Subtotal:</span>
                <span className="summary-value">LKR {formatPrice(subtotal)}</span>
              </div>
            </div>
            
            <button className="checkout-btn" onClick={proceedToCheckout}>
              Proceed to Checkout
            </button>
            
            <button 
              className="continue-shopping"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
