import React from 'react';
import '../../styles/MapView.css';

const MapView = ({ selectedDelivery }) => {
  return (
    <div className="map-container">
      <div className="map-header">
        <h3>Delivery Map</h3>
        <div className="map-controls">
          <button className="map-button">
            <i className="fas fa-location-arrow"></i>
          </button>
          <button className="map-button">
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      
      {selectedDelivery ? (
        <>
          <div className="map-placeholder">
            <i className="fas fa-map-marked-alt"></i>
            <p>Map visualization would show here</p>
            <p className="map-destination">{selectedDelivery.customer.address}</p>
          </div>
          
          <div className="delivery-details">
            <div className="detail-row">
              <span className="detail-label">Customer:</span>
              <span className="detail-value">{selectedDelivery.customer.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">
                <a href={`tel:${selectedDelivery.customer.phone}`}>
                  {selectedDelivery.customer.phone}
                </a>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Order ID:</span>
              <span className="detail-value">{selectedDelivery.orderId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Est. Time:</span>
              <span className="detail-value">{selectedDelivery.estimatedDeliveryTime}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount:</span>
              <span className="detail-value">{selectedDelivery.totalAmount}</span>
            </div>
            <div className="delivery-actions">
              <button className="action-button call">
                <i className="fas fa-phone"></i> Call Customer
              </button>
              <button className="action-button navigate">
                <i className="fas fa-directions"></i> Navigate
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="no-selection">
          <i className="fas fa-hand-pointer"></i>
          <p>Select a delivery to view details and map</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
