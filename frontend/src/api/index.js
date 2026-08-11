/// <reference types="vite/client" />
import axios from 'axios';
const baseURL = (import.meta.env && import.meta.env.VITE_API_URL) || '/api';
const api = axios.create({ baseURL });
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    signup: (data) => api.post('/auth/signup', data),
    getUsers: () => api.get('/auth/users'),
    createUser: (data) => api.post('/auth/users', data),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
};
export const customersApi = {
    getAll: (search) => api.get('/customers', { params: search ? { search } : {} }),
    getById: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
    addFollowup: (id, note) => api.post(`/customers/${id}/followups`, { note }),
};
export const employeesApi = {
    getAll: () => api.get('/employees'),
    create: (data) => api.post('/employees', data),
    update: (id, data) => api.put(`/employees/${id}`, data),
    delete: (id) => api.delete(`/employees/${id}`),
};
export const productsApi = {
    getAll: (search) => api.get('/products', { params: search ? { search } : {} }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    addMovement: (id, data) => api.post(`/products/${id}/stock`, data),
    getMovements: () => api.get('/products/movements'),
};
export const challanApi = {
    getAll: (params) => api.get('/challans', { params }),
    getById: (id) => api.get(`/challans/${id}`),
    create: (data) => api.post('/challans', data),
    updateStatus: (id, status) => api.patch(`/challans/${id}/status`, { status }),
};
