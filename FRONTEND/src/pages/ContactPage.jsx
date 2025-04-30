import { useState } from 'react';
import Footer from '../components/Footer';
import '../styles/ContactPage.css';

const ContactPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real application, you would send this data to your backend
      // For this example, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Message sent successfully
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitError('An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="contact-overlay"></div>
        <div className="contact-content">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you. Your feedback matters to us!</p>
        </div>
      </div>
      
      <div className="contact-container">
        <div className="contact-columns">
          <div className="contact-form-column">
            <div className="contact-form-container">
              <h3>Send Us a Message</h3>
              
              {submitSuccess ? (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  <h4>Thank You!</h4>
                  <p>Your message has been sent successfully. We'll get back to you soon.</p>
                  <button 
                    className="send-another-btn"
                    onClick={() => setSubmitSuccess(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  {submitError && (
                    <div className="error-message">
                      {submitError}
                    </div>
                  )}
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                        placeholder="Your name"
                      />
                      {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? 'error' : ''}
                      placeholder="What is this regarding?"
                    />
                    {errors.subject && <span className="error-text">{errors.subject}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? 'error' : ''}
                      rows="5"
                      placeholder="How can we help you?"
                    ></textarea>
                    {errors.message && <span className="error-text">{errors.message}</span>}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="contact-button" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="button-spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="contact-info-column">
            <div className="contact-info-container">
              <h3>Contact Information</h3>
              <p className="contact-intro">
                Feel free to contact us using any of the methods below. We'll respond to you as quickly as possible.
              </p>
              
              <div className="contact-info-items">
                <div className="contact-info-item">
                  <div className="info-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="info-content">
                    <h4>Our Location</h4>
                    <p>Ganavairavar Kovil Lane, Vavuniya<br />Northern Province 43000</p>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <div className="info-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div className="info-content">
                    <h4>Phone Numbers</h4>
                    <p>
                      <a href="tel:+94244567890">024 456-7890</a>
                    </p>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <div className="info-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="info-content">
                    <h4>Email Us</h4>
                    <p>
                      <a href="mailto:vanniinninfo@gmail.com">vanniinninfo@gmail.com</a>
                    </p>
                  </div>
                </div>
                
                <div className="contact-info-item">
                  <div className="info-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="info-content">
                    <h4>Opening Hours</h4>
                    <p>Monday - Friday: 12:00 PM - 10:00 PM<br />
                      Saturday - Sunday: 10:00 AM - 11:00 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="contact-social-icons">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
