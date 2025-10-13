import { create } from "zustand";
import { reviewAPI } from "../services/api";

const useReviewStore = create((set, get) => ({
  // State
  reviewableItems: [],
  reviewableCount: 0,
  isDrawerOpen: false,
  selectedOrderForReview: null,
  loading: false,
  error: null,

  // Fetch reviewable items (items that can be reviewed)
  fetchReviewableItems: async () => {
    try {
      set({ loading: true, error: null });
      const response = await reviewAPI.getReviewableItems();

      // Group items by order
      const itemsByOrder = {};
      response.data.data.forEach((item) => {
        const orderId = item.order_date; // We'll use order_date as grouping key for now
        if (!itemsByOrder[orderId]) {
          itemsByOrder[orderId] = [];
        }
        itemsByOrder[orderId].push(item);
      });

      set({
        reviewableItems: response.data.data,
        reviewableCount: response.data.count,
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch reviewable items",
        loading: false,
      });
    }
  },

  // Mark items as prompted (when user opens review popup)
  markAsPrompted: async (orderItemIds) => {
    try {
      await reviewAPI.markReviewPrompted(orderItemIds);
      // Refresh reviewable items
      get().fetchReviewableItems();
    } catch (error) {
      console.error("Failed to mark as prompted:", error);
    }
  },

  // Create review
  createReview: async (orderItemId, data) => {
    try {
      set({ loading: true, error: null });
      const response = await reviewAPI.createReview(orderItemId, data);
      set({ loading: false });
      // Refresh reviewable items
      get().fetchReviewableItems();
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create review",
        loading: false,
      });
      throw error;
    }
  },

  // Update review
  updateReview: async (reviewId, data) => {
    try {
      set({ loading: true, error: null });
      const response = await reviewAPI.updateReview(reviewId, data);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update review",
        loading: false,
      });
      throw error;
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      set({ loading: true, error: null });
      await reviewAPI.deleteReview(reviewId);
      set({ loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete review",
        loading: false,
      });
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await reviewAPI.getProductReviews(productId, params);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch product reviews:", error);
      return null;
    }
  },

  // Drawer controls
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedOrderForReview: null }),

  // Order review modal controls
  selectOrderForReview: (order) => set({ selectedOrderForReview: order }),
  clearSelectedOrder: () => set({ selectedOrderForReview: null }),

  // Reset error
  clearError: () => set({ error: null }),
}));

export default useReviewStore;
