import { STORAGE_KEYS } from "../constants";

// Utility functions for authentication

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Get token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Save token to localStorage
 */
export const saveToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

/**
 * Get user from localStorage
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user:", error);
    return null;
  }
};

/**
 * Save user to localStorage
 */
export const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};
