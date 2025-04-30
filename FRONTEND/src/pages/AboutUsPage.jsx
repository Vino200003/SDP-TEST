import React from 'react';
import Footer from '../components/Footer';
import '../styles/AboutUsPage.css';
import rest1Image from '../assets/rest1.avif';

const AboutUsPage = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <div className="about-overlay"></div>
        <div className="about-content">
          <h2>About VANNI INN</h2>
          <p>Discover our story and our commitment to culinary excellence</p>
        </div>
      </div>
      
      <div className="about-container">
        <section className="about-story">
          <div className="story-content">
            <h3>Our Story</h3>
            <div className="section-underline"></div>
            <p>
              Founded in 2015, VANNI INN began with a simple vision: to create an exceptional 
              dining experience that combines authentic flavors with modern culinary techniques.
            </p>
            <p>
              What started as a small family restaurant has grown into one of the most beloved 
              dining destinations in the area, known for our warm hospitality and exceptional cuisine.
            </p>
            <p>
              Over the years, we've remained true to our roots while continuously evolving our menu 
              to incorporate fresh, seasonal ingredients and innovative cooking methods.
            </p>
          </div>
          <div className="story-image">
            <img src={rest1Image} alt="VANNI INN Restaurant Interior" />
          </div>
        </section>
        
        <section className="about-philosophy">
          <div className="philosophy-container">
            <h3>Our Philosophy</h3>
            <div className="section-underline"></div>
            <div className="philosophy-cards">
              <div className="philosophy-card">
                <div className="philosophy-icon">
                  <i className="fas fa-seedling"></i>
                </div>
                <h4>Fresh Ingredients</h4>
                <p>
                  We source the freshest ingredients from local farmers and suppliers, 
                  ensuring that every dish we serve is of the highest quality.
                </p>
              </div>
              
              <div className="philosophy-card">
                <div className="philosophy-icon">
                  <i className="fas fa-utensils"></i>
                </div>
                <h4>Culinary Excellence</h4>
                <p>
                  Our chefs are dedicated to their craft, combining traditional techniques 
                  with innovative approaches to create unforgettable dining experiences.
                </p>
              </div>
              
              <div className="philosophy-card">
                <div className="philosophy-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <h4>Warm Hospitality</h4>
                <p>
                  We believe that great food tastes even better when served with genuine care 
                  and attention. Our staff is dedicated to making you feel at home.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="about-values">
          <div className="values-container">
            <h3>Our Values</h3>
            <div className="section-underline"></div>
            
            <div className="values-content">
              <div className="values-text">
                <p>
                  At VANNI INN, we believe that a truly exceptional restaurant experience 
                  goes beyond just serving delicious food. We are committed to:
                </p>
                <ul className="values-list">
                  <li><span>Sustainability</span> - We strive to minimize our environmental impact through responsible sourcing and waste reduction practices.</li>
                  <li><span>Community</span> - We actively support local farmers, producers, and charitable organizations in our community.</li>
                  <li><span>Innovation</span> - We continuously explore new ingredients, techniques, and presentation styles to surprise and delight our guests.</li>
                  <li><span>Inclusivity</span> - We create a welcoming environment where everyone can enjoy exceptional dining experiences.</li>
                </ul>
              </div>
              <div className="values-stats">
                <div className="stat-item">
                  <span className="stat-number">8+</span>
                  <span className="stat-text">Years of Excellence</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">15k+</span>
                  <span className="stat-text">Happy Customers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">30+</span>
                  <span className="stat-text">Team Members</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">100+</span>
                  <span className="stat-text">Unique Dishes</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="about-cta">
          <div className="cta-content">
            <h3>Come Experience VANNI INN</h3>
            <p>
              We invite you to join us for an unforgettable dining experience. 
              Whether you're celebrating a special occasion or simply enjoying a meal with loved ones, 
              we look forward to serving you.
            </p>
            <div className="cta-buttons">
              <button 
                className="cta-button reservation"
                onClick={() => {
                  if (window.navigateTo) {
                    window.navigateTo('/reservation');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.location.href = '/reservation';
                  }
                }}
              >
                Make a Reservation
              </button>
              <button 
                className="cta-button menu"
                onClick={() => {
                  if (window.navigateTo) {
                    window.navigateTo('/menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.location.href = '/menu';
                  }
                }}
              >
                View Our Menu
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
