import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  login: (regdid, password) => api.post('/auth/login', { regdid, password }),
  register: (data) => api.post('/auth/register', data)
};

// Student API calls
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getTasks: () => api.get('/student/tasks'),
  startTask: (taskId) => api.post(`/student/tasks/${taskId}/start`),
  submitTask: (taskId, answer) => api.post(`/student/tasks/${taskId}/submit`, { answer }),
  getPerformance: () => api.get('/student/performance'),
  getTests: () => api.get('/student/tests'),
  getLeaderboard: (search, sort) => api.get('/student/leaderboard', { params: { search, sort } })
};

// Admin API calls
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  createTask: (data) => api.post('/admin/tasks', data),
  getTasks: () => api.get('/admin/tasks'),
  getTaskStudents: (taskId) => api.get(`/admin/tasks/${taskId}/students`),
  getPerformance: () => api.get('/admin/performance'),
  createTest: (data) => api.post('/admin/tests', data),
  addTestQuestion: (testId, data) => api.post(`/admin/tests/${testId}/questions`, data)
};

// Super Admin API calls
export const superAdminAPI = {
  getDashboard: () => api.get('/superadmin/dashboard'),
  getAdmins: () => api.get('/superadmin/admins'),
  createAdmin: (data) => api.post('/superadmin/admins', data),
  getStudents: () => api.get('/superadmin/students'),
  getStudentPerformance: (studentId) => api.get(`/superadmin/students/${studentId}/performance`),
  getAllTasks: () => api.get('/superadmin/tasks'),
  getTaskStudents: (taskId) => api.get(`/superadmin/tasks/${taskId}/students`),
  createTest: (data) => api.post('/superadmin/tests', data)
};
