import axios from "axios";
import { STORAGE_KEYS } from "../constants";

const API_URL = "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If 401 Unauthorized, clear token
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Only clear token and redirect if not on auth pages
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        // Use a flag to prevent multiple redirects
        if (!window.__isRedirecting__) {
          window.__isRedirecting__ = true;
          setTimeout(() => {
            window.location.href = "/login";
            window.__isRedirecting__ = false;
          }, 100);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.post("/auth/change-password", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  verifyResetCode: (data) => api.post("/auth/verify-reset-code", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId, params) =>
    api.get(`/products/category/${categoryId}`, { params }),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Variant APIs
export const variantAPI = {
  getByProduct: (productId, params) =>
    api.get(`/products/${productId}/variants`, { params }),
  getById: (id) => api.get(`/variants/${id}`),
  create: (productId, data) =>
    api.post(`/products/${productId}/variants`, data),
  update: (id, data) => api.put(`/variants/${id}`, data),
  delete: (id) => api.delete(`/variants/${id}`),
  updateStock: (id, stock) => api.patch(`/variants/${id}/stock`, { stock }),
};

export default api;
