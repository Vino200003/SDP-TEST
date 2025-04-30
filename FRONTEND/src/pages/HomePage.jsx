import React from 'react';
import Footer from '../components/Footer';
import '../styles/HomePage.css';
import rest1Image from '../assets/rest1.avif';
import rest3Image from '../assets/rest3.jpg';

const HomePage = () => {
  const handleNavigation = (path) => {
    if (window.navigateTo) {
      window.navigateTo(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <>
      <div className="home-page">
        <header className="hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Welcome to VANNI INN</h1>
            <h2>Great Food, Great Times</h2>
            <p className="hero-description">
              We serve tasty food made with fresh ingredients. Come visit us or order online!
            </p>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={() => handleNavigation('/menu')}>Order Now</button>
              <button className="cta-button secondary" onClick={() => handleNavigation('/reservation')}>Book Table</button>
            </div>
          </div>
        </header>
        
        <section className="services">
          <div className="section-title">
            <h2>What We Offer</h2>
          </div>
          
          <div className="services-container">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-truck"></i>
              </div>
              <h3>Delivery</h3>
              <p>We'll bring the food to you. Quick and reliable delivery to your door.</p>
              <a href="/menu" className="service-link">Order Delivery</a>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <h3>Takeout</h3>
              <p>Call ahead and pick up your food without waiting in line.</p>
              <a href="/menu" className="service-link">Order Takeout</a>
            </div>
            
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>Table Booking</h3>
              <p>Book a table for your special occasion or just a nice meal out.</p>
              <a href="/reservation" className="service-link">Reserve Now</a>
            </div>
          </div>
        </section>
        
        <section className="special-offers" style={{ backgroundImage: `url(${rest3Image})` }}>
          <div className="offers-overlay"></div>
          <div className="offers-content">
            <h2>Today's Specials</h2>
            <p>Check out our daily deals and weekend offers</p>
            <button className="offers-button">See Specials</button>
          </div>
        </section>
        
        <section className="our-story">
          <div className="section-title">
            <h2>Our Story</h2>
          </div>
          
          <div className="story-container">
            <div className="story-image">
              <img src={rest1Image} alt="Restaurant Interior" />
            </div>
            <div className="story-content">
              <h3>Family Owned Since 2015</h3>
              <p>
                We started our restaurant with one simple goal - to serve good food that makes people happy.
              </p>
              <p>
                Our chef has been cooking for over 15 years and puts love into every dish. We use ingredients from local farms whenever possible.
              </p>
              <p>
                When you eat at VANNI INN, you're not just a customer - you're part of our family.
              </p>
              <button className="story-button" onClick={() => handleNavigation('/about')}>Read More</button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;

