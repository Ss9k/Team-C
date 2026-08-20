import axios from 'axios';

const api = axios.create({
  baseURL: 'https://support-ai-ticket-management-agent-v2qe.onrender.com/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sams_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sams_token');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data),
};

// ─── AI Engine ───────────────────────────────────────────────────────────────
export const aiAPI = {
  /**
   * POST /ai/analyze
   * Body: { title, department, description }
   * Returns Gemini 2.5 Flash response:
   * { summary, category, priority, severity, confidence, possible_causes, resolution_steps, estimated_resolution_time, needs_escalation, escalation_reason, prevention }
   */
  analyze: (payload) =>
    api.post('/ai/analyze', payload).then((r) => r.data),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const ticketsAPI = {
  create: (data) => api.post('/tickets', data).then((r) => r.data),
  getMine: () => api.get('/tickets/mine').then((r) => r.data),
  getOne: (id) => api.get(`/tickets/${id}`).then((r) => r.data),
  getMineStats: () => api.get('/tickets/mine/stats').then((r) => r.data),
  getAll: (params) => api.get('/tickets', { params }).then((r) => r.data),
  getStats: () => api.get('/tickets/stats').then((r) => r.data),
  getRecentActivity: () => api.get('/tickets/recent-activity').then((r) => r.data),
  resolve: (id) => api.patch(`/tickets/${id}/resolve`).then((r) => r.data),
  assign: (id, engineerName) => api.patch(`/tickets/${id}/assign`, { engineerName }).then((r) => r.data),
  close: (id) => api.patch(`/tickets/${id}/close`).then((r) => r.data),
};

// ─── Admin Users Management ──────────────────────────────────────────────────
export const adminUsersAPI = {
  getStats: () => api.get('/admin/users/stats').then((r) => r.data),
  getAll: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  getOne: (userId) => api.get(`/admin/users/${userId}`).then((r) => r.data),
  getUserTickets: (userId) => api.get(`/admin/users/${userId}/tickets`).then((r) => r.data),
  update: (userId, data) => api.patch(`/admin/users/${userId}`, data).then((r) => r.data),
};

// ─── Admin Management (Super Admin) ──────────────────────────────────────────
export const adminManagementAPI = {
  getAll: () => api.get('/admin/admins').then((r) => r.data),
  create: (data) => api.post('/admin/admins', data).then((r) => r.data),
  update: (id, data) => api.put(`/admin/admins/${id}`, data).then((r) => r.data),
  resetPassword: (id, newPassword) => api.post(`/admin/admins/${id}/reset-password`, { newPassword }).then((r) => r.data),
  delete: (id) => api.delete(`/admin/admins/${id}`).then((r) => r.data),
};

export default api;
