import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (data: object) => api.post('/auth/login', data),
  signup: (data: object) => api.post('/auth/signup', data),
  getUsers: () => api.get('/auth/users'),
  createUser: (data: object) => api.post('/auth/users', data),
  deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
};

export const customersApi = {
  getAll: (search?: string) => api.get('/customers', { params: search ? { search } : {} }),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: object) => api.post('/customers', data),
  update: (id: number, data: object) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  addFollowup: (id: number, note: string) => api.post(`/customers/${id}/followups`, { note }),
};

export const employeesApi = {
  getAll: () => api.get('/employees'),
  create: (data: object) => api.post('/employees', data),
  update: (id: number, data: object) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

export const productsApi = {
  getAll: (search?: string) => api.get('/products', { params: search ? { search } : {} }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: object) => api.post('/products', data),
  update: (id: number, data: object) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  addMovement: (id: number, data: object) => api.post(`/products/${id}/stock`, data),
  getMovements: () => api.get('/products/movements'),
};

export const challanApi = {
  getAll: (params?: object) => api.get('/challans', { params }),
  getById: (id: number) => api.get(`/challans/${id}`),
  create: (data: object) => api.post('/challans', data),
  updateStatus: (id: number, status: string) => api.patch(`/challans/${id}/status`, { status }),
};
