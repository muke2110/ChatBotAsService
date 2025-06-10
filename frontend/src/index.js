import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Initialize Google OAuth
// window.onload = () => {
//   window.gapi.load('auth2', async () => {
//     try {
//       await window.gapi.auth2.init({
//         client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '1033880884479-k8qnfdpj24inf0e7337njutvj29jq4nr.apps.googleusercontent.com',
//         scope: 'email profile',
//         plugin_name: 'chatbot_service'
//       });
//     } catch (error) {
//       console.error('Google OAuth initialization failed:', error);
//     }
//   });
// };

reportWebVitals();
