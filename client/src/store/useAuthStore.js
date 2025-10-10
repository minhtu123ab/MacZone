import { create } from "zustand";
import { authAPI } from "../services/api";
import { STORAGE_KEYS } from "../constants";

// Helper function to safely parse user from localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    // Check if userStr is null, undefined, or the string "undefined" or "null"
    if (!userStr || userStr === "undefined" || userStr === "null") {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getUserFromStorage(),
  token: localStorage.getItem(STORAGE_KEYS.TOKEN) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
  loading: false,

  // Login
  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await authAPI.login(credentials);

      // Backend returns: { success: true, data: { user, token } }
      const { token, user } = response.data.data;

      // Save token and user to localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Update state
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return { success: true, user };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  // Register
  register: async (data) => {
    set({ loading: true });
    try {
      const response = await authAPI.register(data);
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },

  // Get profile
  fetchProfile: async () => {
    try {
      const response = await authAPI.getProfile();

      // Backend returns: { success: true, data: { user } }
      const user = response.data.data.user;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      set({ user });
      return { success: true };
    } catch (error) {
      // If failed to get profile, clear auth state
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      return { success: false };
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const response = await authAPI.updateProfile(data);

      // Backend returns: { success: true, data: { user details } }
      const updatedUser = response.data.data;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Update failed",
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
