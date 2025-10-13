// App constants
export const APP_NAME = "MacZone";
export const APP_DESCRIPTION = "Premium Apple Products Store";

// Routes
export const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId) => `/products?category=${categoryId}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ORDER_DETAIL: (id) => `/orders/${id}`,
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_RESET_CODE: "/auth/verify-reset-code",
    RESET_PASSWORD: "/auth/reset-password",
  },
  CATEGORIES: {
    GET_ALL: "/categories",
    GET_BY_ID: (id) => `/categories/${id}`,
    CREATE: "/categories",
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },
  PRODUCTS: {
    GET_ALL: "/products",
    GET_BY_ID: (id) => `/products/${id}`,
    GET_BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
    CREATE: "/products",
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
  },
  VARIANTS: {
    GET_BY_PRODUCT: (productId) => `/products/${productId}/variants`,
    GET_BY_ID: (id) => `/variants/${id}`,
    CREATE: (productId) => `/products/${productId}/variants`,
    UPDATE: (id) => `/variants/${id}`,
    DELETE: (id) => `/variants/${id}`,
    UPDATE_STOCK: (id) => `/variants/${id}/stock`,
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};
