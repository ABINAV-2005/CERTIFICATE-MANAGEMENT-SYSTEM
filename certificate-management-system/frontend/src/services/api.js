
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
const BACKEND_BASE = API_BASE.replace(/\/api\/?$/, '');


const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export as default and named export
export default api;
export { api };
export { API_BASE, BACKEND_BASE };

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateStatus: (id) => api.put(`/users/${id}/status`),
  getStats: () => api.get('/users/stats'),
};

// Certificates API
export const certificatesAPI = {
  upload: (data) => api.post('/certificates/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/certificates/all', { params }),
  getMine: () => api.get('/certificates/my'),
  getAdminAll: (params) => api.get('/certificates/all', { params }),
  getById: (id) => api.get(`/certificates/${id}`),
  update: (id, data) => api.put(`/certificates/${id}`, data),
  delete: (id) => api.delete(`/certificates/${id}`),
  approve: (id) => api.put(`/certificates/${id}/approve`),
  reject: (id) => api.put(`/certificates/${id}/reject`),
  getStats: () => api.get('/certificates/stats'),
  getEmployeeStats: () => api.get('/certificates/stats/employees'),
  getCertificateStats: () => api.get('/certificates/stats/certificates'),
  exportCsv: () => api.get('/certificates/export/csv', { responseType: 'blob' }),
  importCsv: (formData) => api.post('/certificates/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const templatesAPI = {
  create: (formData) => api.post('/templates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  update: (id, formData) => api.put(`/templates/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/templates/${id}`),
};

// Verification API
export const verifyAPI = {
  verifyById: (certificateId) => api.get(`/verify/${certificateId}`),
  verifyByQR: (qrData) => api.post('/verify/qr', { qrData }),
};

export const activityAPI = {
  getMy: (params) => api.get('/activity/my', { params }),
  getAll: (params) => api.get('/activity/all', { params })
};

export const socialAPI = {
  searchUsers: (search) => api.get('/social/users', { params: { search } }),
  sendRequest: (toUserId) => api.post(`/social/requests/${toUserId}`),
  getRequests: () => api.get('/social/requests'),
  acceptRequest: (requestId) => api.post(`/social/requests/${requestId}/accept`),
  rejectRequest: (requestId) => api.post(`/social/requests/${requestId}/reject`),
  getFriends: () => api.get('/social/friends'),
  getMyDocs: () => api.get('/social/docs/my'),
  getMessages: (friendId) => api.get(`/social/messages/${friendId}`),
  sendMessage: (friendId, payload) => api.post(`/social/messages/${friendId}`, payload),
};
