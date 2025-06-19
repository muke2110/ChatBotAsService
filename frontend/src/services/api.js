import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const clientId = localStorage.getItem('clientId');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (clientId) {
      config.headers['X-Client-ID'] = clientId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('clientId');
        window.location.href = '/login';
      }
      
      // Handle rate limiting
      if (error.response.status === 429) {
        const resetTime = error.response.headers['x-ratelimit-reset'];
        if (resetTime) {
          const waitTime = new Date(resetTime) - new Date();
          console.warn(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (token) => api.post('/auth/google', { token }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const plansAPI = {
  getPlans: () => api.get('/plans'),
  subscribeToPlan: (planId) => api.post('/plans/subscribe', { planId }),
  getCurrentPlan: () => api.get('/plans/current'),
};

export const subscriptionsAPI = {
  subscribe: (planId) => api.post('/subscriptions', { planId }),
  cancel: () => api.delete('/subscriptions/current'),
  getStatus: () => api.get('/subscriptions/status'),
};

export const paymentsAPI = {
  createOrder: (planId, billingCycle) => api.post('/payments/order', { planId, billingCycle }),
  verifyPayment: (paymentDetails) => api.post('/payments/verify', paymentDetails),
  getPaymentStatus: (paymentId) => api.get(`/payments/status/${paymentId}`),
  getPaymentHistory: () => api.get('/payments/history')
};

export const embedAPI = {
  uploadDocument: (formData) => api.post('/embed/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getDocuments: () => api.get('/embed/documents'),
  deleteDocument: (documentId) => api.delete(`/embed/documents/${documentId}`),
};

export const queryAPI = {
  askQuestion: (question) => api.post('/query', { question }),
  getHistory: () => api.get('/query/history'),
};

export const widgetAPI = {
  getWidgets: () => api.get('/widgets'),
  createWidget: (data) => api.post('/widgets', data),
  updateWidget: (widgetId, data) => api.put(`/widgets/${widgetId}`, data),
  deleteWidget: (widgetId) => api.delete(`/widgets/${widgetId}`),
  getWidget: (widgetId) => api.get(`/widgets/${widgetId}`),
  reorderWidgets: (data) => api.post('/widgets/reorder', data),
};

export const analyticsAPI = {
  getWidgetAnalytics: (widgetId) => api.get(`/analytics/widgets/${widgetId}`),
  getWidgetHistory: (widgetId, params = {}) => {
    const search = new URLSearchParams(params).toString();
    return api.get(`/analytics/widgets/${widgetId}/history${search ? `?${search}` : ''}`);
  },
};

export default api; 