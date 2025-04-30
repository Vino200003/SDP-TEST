import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>VANNI INN</h3>
          <p>Experience the finest dining with our authentic cuisine and exceptional service.</p>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p><i className="fas fa-map-marker-alt"></i> Ganavairavar Kovil Lane, Vavuniya,<br/> Northern Province <br/>43000 </p>
          <p><i className="fas fa-phone"></i> 024 456-7890</p>
          <p><i className="fas fa-envelope"></i> info@vanniinn.com</p>
        </div>
        
        <div className="footer-section">
          <h3>Opening Hours</h3>
          <p>Monday - Friday: 12PM - 10PM</p>
          <p>Saturday - Sunday: 10AM - 11PM</p>
        </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2023 VANNI INN Restaurant. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
