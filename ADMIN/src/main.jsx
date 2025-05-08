import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Debug logging
console.log('Starting Admin app render...');
console.log('React version:', React.version);

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('Admin app rendered successfully');
} catch (error) {
  console.error('Error rendering Admin app:', error);
}
