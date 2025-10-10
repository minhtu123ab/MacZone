// App constants
export const APP_NAME = "MacZone";
export const APP_DESCRIPTION = "Premium Apple Products Store";

// Product categories with images
export const PRODUCT_CATEGORIES = [
  {
    name: "MacBook",
    description: "Powerful laptops for professionals",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop",
  },
  {
    name: "iPhone",
    description: "The ultimate smartphone experience",
    image:
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&auto=format&fit=crop",
  },
  {
    name: "iPad",
    description: "Versatile tablet for work and play",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop",
  },
  {
    name: "AirPods",
    description: "Wireless audio perfection",
    image:
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&auto=format&fit=crop",
  },
];

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
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};
