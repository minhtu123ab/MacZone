// App constants
export const APP_NAME = "MacZone";
export const APP_DESCRIPTION = "Premium Apple Products Store";

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",
  PRODUCTS: "/products",
  CART: "/cart",
  ORDERS: "/orders",
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
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};
