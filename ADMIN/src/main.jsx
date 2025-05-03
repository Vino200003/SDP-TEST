import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Comment out toast imports until you install react-toastify
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* Add ToastContainer after installing react-toastify */}
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </BrowserRouter>
  </React.StrictMode>
);
