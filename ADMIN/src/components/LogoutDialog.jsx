import { useState } from 'react';
import '../styles/Dialog.css';

function LogoutDialog({ onConfirm, onCancel }) {
  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutDialog;
