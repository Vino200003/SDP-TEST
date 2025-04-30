import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [serviceFee, setServiceFee] = useState(2.50);
  const [total, setTotal] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      setIsLoading(true);
      try {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        setCart([]);
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Calculate totals whenever cart or discount changes
  useEffect(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
    
    const newTotal = newSubtotal + serviceFee - discount;
    setTotal(newTotal);
  }, [cart, discount, serviceFee]);

  // Format price for display
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
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

  // Handle coupon code application
  const handleApplyCoupon = () => {
    setCouponError('');
    
    // Simple coupon validation logic
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Example coupon codes
    const validCoupons = {
      'WELCOME10': 10, // 10% discount
      'SAVE20': 20,    // 20% discount
      'SPECIAL15': 15  // 15% discount
    };
    
    if (validCoupons[couponCode.toUpperCase()]) {
      const discountPercent = validCoupons[couponCode.toUpperCase()];
      const discountAmount = (subtotal * discountPercent) / 100;
      setDiscount(discountAmount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  // Handle coupon code removal
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setCouponApplied(false);
    setCouponError('');
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Dispatch cart updated event for navbar counter
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Proceed to checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Continue shopping
  const handleContinueShopping = () => {
    navigate('/menu');
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
            
            <div className="coupon-section">
              <h4>Have a coupon?</h4>
              {!couponApplied ? (
                <>
                  <div className="coupon-input">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button 
                      className="apply-coupon-btn"
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <div className="error-text">{couponError}</div>}
                </>
              ) : (
                <>
                  <div className="coupon-applied">
                    <i className="fas fa-check-circle"></i>
                    Coupon "{couponCode}" applied successfully!
                  </div>
                  <button 
                    className="remove-coupon-btn"
                    onClick={handleRemoveCoupon}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>LKR {formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>- LKR {formatPrice(discount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Service Fee</span>
                <span>LKR {formatPrice(serviceFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>LKR {formatPrice(total)}</span>
              </div>
            </div>
            
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              <i className="fas fa-lock"></i> Proceed to Checkout
            </button>
            
            <div className="payment-methods">
              <p>We accept</p>
              <div className="payment-icons">
                <i className="fab fa-cc-visa"></i>
                <i className="fab fa-cc-mastercard"></i>
                <i className="fab fa-cc-amex"></i>
                <i className="fab fa-cc-paypal"></i>
              </div>
              <p className="payment-note">Secure payment processing</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
