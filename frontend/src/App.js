import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Script from './pages/Script';
import Plans from './pages/Plans';
import Buy from './pages/Buy';
import Settings from './pages/Settings';
import Documentation from './pages/Documentation';
import Profile from './pages/Profile';
import TestQuery from './pages/TestQuery';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Widgets from './pages/Widgets';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/upload"
            element={
              <PrivateRoute requirePlan={true}>
                <Upload />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/script"
            element={
              <PrivateRoute requirePlan={true}>
                <Script />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/test-query"
            element={
              <PrivateRoute requirePlan={true}>
                <TestQuery />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/plans"
            element={
              <PrivateRoute>
                <Plans />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/buy"
            element={
              <PrivateRoute>
                <Buy />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <PrivateRoute requirePlan={true}>
                <Settings />
              </PrivateRoute>
            }
          />

          <Route
            path="/documentation"
            element={
              <PrivateRoute>
                <Documentation />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/widgets"
            element={
              <PrivateRoute requirePlan={true}>
                <Widgets />
              </PrivateRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <PrivateRoute requirePlan={true}>
                <Analytics />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
