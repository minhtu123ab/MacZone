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

// Cart APIs
export const cartAPI = {
  getCart: () => api.get("/cart"),
  getCartCount: () => api.get("/cart/count"),
  addToCart: (data) => api.post("/cart", data),
  updateCartItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeCartItem: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete("/cart"),
};

// Chatbot APIs
export const chatbotAPI = {
  start: () => api.post("/chatbot/start"),
  getPriceRanges: (categoryId) =>
    api.get("/chatbot/price-ranges", { params: { categoryId } }),
  getStoryRequest: (data) => api.post("/chatbot/story-request", data),
  getRecommendations: (data) => api.post("/chatbot/recommend", data),
  getHistory: (params) => api.get("/chatbot/history", { params }),
  getHistoryDetail: (id) => api.get(`/chatbot/history/${id}`),
};

// Order APIs
export const orderAPI = {
  createOrder: (data) => api.post("/orders", data),
  getUserOrders: (params) => api.get("/orders", { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId, data) => api.put(`/orders/${orderId}/cancel`, data),
  updateOrderStatus: (orderId, data) =>
    api.put(`/orders/${orderId}/status`, data),
  updatePaymentStatus: (orderId, data) =>
    api.put(`/orders/${orderId}/payment`, data),
  updateTrackingCode: (orderId, data) =>
    api.put(`/orders/${orderId}/tracking`, data),
  getAllOrders: (params) => api.get("/orders/admin/all", { params }),
};

// Review APIs
export const reviewAPI = {
  createReview: (orderItemId, data) =>
    api.post(`/reviews/order-item/${orderItemId}`, data),
  getProductReviews: (productId, params) =>
    api.get(`/reviews/product/${productId}`, { params }),
  getFeaturedReviews: (params) => api.get("/reviews/featured", { params }),
  getMyReviews: (params) => api.get("/reviews/my-reviews", { params }),
  getReviewableItems: () => api.get("/reviews/reviewable-items"),
  markReviewPrompted: (orderItemIds) =>
    api.post("/reviews/mark-prompted", { orderItemIds }),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Admin APIs
export const adminAPI = {
  // Dashboard Stats
  getOrderStats: () => api.get("/orders/admin/stats"),
  getUserStats: () => api.get("/users/stats"),
  getProductStats: () => api.get("/products/admin/stats"),

  // User Management
  getAllUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserRole: (id, data) => api.put(`/users/${id}/role`, data),

  // Product Management
  getAllProducts: (params) => api.get("/products/admin/all", { params }),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Category Management
  getAllCategories: () => api.get("/categories"),
  createCategory: (data) => api.post("/categories", data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Order Management
  getAllOrders: (params) => api.get("/orders/admin/all", { params }),
  updateOrderStatus: (orderId, data) =>
    api.put(`/orders/${orderId}/status`, data),
  updatePaymentStatus: (orderId, data) =>
    api.put(`/orders/${orderId}/payment`, data),
  updateTrackingCode: (orderId, data) =>
    api.put(`/orders/${orderId}/tracking`, data),

  // Review Management
  getAllReviews: (params) => api.get("/reviews", { params }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export default api;
