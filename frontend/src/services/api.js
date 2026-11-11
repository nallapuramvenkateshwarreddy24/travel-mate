import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  // If requesting admin endpoints, prefer admin token if available
  const isAdminReq = config.url && config.url.includes('/admin') && !config.url.includes('/admin/login');
  let token = isAdminReq
    ? localStorage.getItem('travel_mate_admin_token') || localStorage.getItem('travel_mate_token')
    : localStorage.getItem('travel_mate_token');

  if (token) {
    token = token.replace(/^"(.*)"$/, '$1').trim();
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Handle global responses & authentication expirations
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('travel_mate_token');
        localStorage.removeItem('travel_mate_user');
      }
    }
    return Promise.reject(error);
  }
);

export const travelApi = {
  // Authentication
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (email, name, password) => {
    const res = await apiClient.post('/auth/register', { email, name, password });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (email, new_password, reset_code = 'TRAVELMATE2026') => {
    const res = await apiClient.post('/auth/reset-password', { email, new_password, reset_code });
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // User Travel Preferences
  getPreferences: async () => {
    const res = await apiClient.get('/preferences');
    return res.data;
  },

  savePreferences: async (prefData) => {
    const res = await apiClient.post('/preferences', prefData);
    return res.data;
  },

  // Day-wise Itinerary Planner
  generateItinerary: async (prefData) => {
    const res = await apiClient.post('/itineraries/generate', prefData);
    return res.data;
  },

  saveItinerary: async (title, itineraryData) => {
    const res = await apiClient.post('/itineraries/save', { title, itinerary_data: itineraryData });
    return res.data;
  },

  getMyTrips: async () => {
    const res = await apiClient.get('/itineraries/my-trips');
    return res.data;
  },

  getTripById: async (tripId) => {
    const res = await apiClient.get(`/itineraries/${tripId}`);
    return res.data;
  },

  deleteTrip: async (tripId) => {
    const res = await apiClient.delete(`/itineraries/${tripId}`);
    return res.data;
  },

  // Admin Portal
  adminLogin: async (email, password) => {
    const res = await apiClient.post('/admin/login', { email, password });
    return res.data;
  },

  getAdminStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  getAdminUsers: async (params = {}) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },

  getAdminUserDetail: async (userId) => {
    const res = await apiClient.get(`/admin/users/${userId}`);
    return res.data;
  },

  updateAdminUserStatus: async (userId, isActive, reason = 'Administrative update') => {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive, reason });
    return res.data;
  },

  getAdminAuditLogs: async (params = {}) => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return res.data;
  },

  // Destinations & Popularity Recommendations
  getDestinations: async (params = {}) => {
    const res = await apiClient.get('/destinations', { params });
    return res.data;
  },

  getDestinationById: async (id) => {
    const res = await apiClient.get(`/destinations/${id}`);
    return res.data;
  },

  getDatasetStats: async () => {
    const res = await apiClient.get('/destinations/stats/summary');
    return res.data;
  },

  getFilterMetadata: async () => {
    const res = await apiClient.get('/destinations/metadata/filters');
    return res.data;
  },

  getTopPopular: async (limit = 10) => {
    const res = await apiClient.get('/recommendations/popular', { params: { limit } });
    return res.data;
  },

  getStateWisePopular: async (state = null, topK = 3) => {
    const params = { top_k: topK };
    if (state) params.state = state;
    const res = await apiClient.get('/recommendations/by-state', { params });
    return res.data;
  },

  getCityWisePopular: async (city = null, topK = 3) => {
    const params = { top_k: topK };
    if (city) params.city = city;
    const res = await apiClient.get('/recommendations/by-city', { params });
    return res.data;
  },

  getCategoryWisePopular: async (category = null, topK = 5) => {
    const params = { top_k: topK };
    if (category) params.category = category;
    const res = await apiClient.get('/recommendations/by-category', { params });
    return res.data;
  },

  getSeasonalPopular: async (bestTime = null, topK = 5) => {
    const params = { top_k: topK };
    if (bestTime) params.best_time = bestTime;
    const res = await apiClient.get('/recommendations/seasonal', { params });
    return res.data;
  },
};

export default apiClient;
