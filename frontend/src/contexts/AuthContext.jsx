import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, plansAPI, widgetAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [clientId, setClientId] = useState(localStorage.getItem('clientId'));
  const [hasPlan, setHasPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('clientId');
    localStorage.removeItem('selectedWidgetId');
    setToken(null);
    setClientId(null);
    setUser(null);
    setHasPlan(false);
    setWidgets([]);
    setSelectedWidget(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      setUser(userData);
      
      // Update clientId if it exists in the response
      if (userData.clientId) {
        localStorage.setItem('clientId', userData.clientId);
        setClientId(userData.clientId);
      }
      
      // Check current plan status
      try {
        const planResponse = await plansAPI.getCurrentPlan();
        setHasPlan(!!planResponse.data);
      } catch (error) {
        console.error('Error fetching plan status:', error);
        setHasPlan(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      clearAuth();
      setLoading(false);
    }
  }, [clearAuth]);

  // Add method to refresh plan status
  const refreshPlanStatus = useCallback(async () => {
    if (!token) return;
    
    try {
      const planResponse = await plansAPI.getCurrentPlan();
      setHasPlan(!!planResponse.data);
      return true;
    } catch (error) {
      console.error('Error refreshing plan status:', error);
      setHasPlan(false);
      return false;
    }
  }, [token]);

  // Fetch user widgets
  const fetchWidgets = useCallback(async () => {
    if (!token) return;

    try {
      const response = await widgetAPI.getWidgets();
      setWidgets(response.data.widgets || []);
      
      // Set selected widget if not already set
      if (!selectedWidget && response.data.widgets && response.data.widgets.length > 0) {
        const savedWidgetId = localStorage.getItem('selectedWidgetId');
        const widgetToSelect = savedWidgetId 
          ? response.data.widgets.find(w => w.widgetId === savedWidgetId)
          : response.data.widgets[0];
        
        if (widgetToSelect) {
          setSelectedWidget(widgetToSelect);
          localStorage.setItem('selectedWidgetId', widgetToSelect.widgetId);
        }
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
    }
  }, [token, selectedWidget]);

  // Update selected widget
  const updateSelectedWidget = useCallback((widget) => {
    setSelectedWidget(widget);
    if (widget) {
      localStorage.setItem('selectedWidgetId', widget.widgetId);
    } else {
      localStorage.removeItem('selectedWidgetId');
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchWidgets();
    } else {
      setLoading(false);
    }
  }, [token, fetchUserData, fetchWidgets]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, clientId } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('clientId', clientId);
      
      setToken(token);
      setClientId(clientId);
      
      await fetchUserData();
      await fetchWidgets();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      const response = await authAPI.googleLogin(googleToken);
      const { token, clientId } = response.data;
      
      // Set token and clientId in localStorage and state
      localStorage.setItem('token', token);
      localStorage.setItem('clientId', clientId);
      
      setToken(token);
      setClientId(clientId);
      
      // Fetch user data and wait for it to complete
      await fetchUserData();
      await fetchWidgets();
      
      // Return success only after everything is complete
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      // Clear any partial auth state
      clearAuth();
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, clientId } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('clientId', clientId);
      
      setToken(token);
      setClientId(clientId);
      
      await fetchUserData();
      await fetchWidgets();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const value = {
    user,
    token,
    clientId,
    hasPlan,
    loading,
    widgets,
    selectedWidget,
    login,
    googleLogin,
    register,
    logout,
    refreshPlanStatus,
    fetchWidgets,
    updateSelectedWidget,
    setToken,
    setClientId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 