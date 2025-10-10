import { create } from "zustand";
import { cartAPI } from "../services/api";
import { message } from "antd";

const useCartStore = create((set, get) => ({
  // State
  cart: null,
  cartCount: 0,
  loading: false,
  drawerVisible: false,

  // Set drawer visibility
  setDrawerVisible: (visible) => set({ drawerVisible: visible }),

  // Fetch cart
  fetchCart: async () => {
    try {
      set({ loading: true });
      const response = await cartAPI.getCart();
      const cartData = response.data.data;
      set({
        cart: cartData,
        cartCount: cartData.total_items || 0,
        loading: false,
      });
      return { success: true, data: cartData };
    } catch (error) {
      set({ loading: false });
      // Don't show error for 401 (user not logged in)
      if (error.response?.status !== 401) {
        console.error("Failed to fetch cart:", error);
      }
      return { success: false, error };
    }
  },

  // Fetch cart count only (lightweight)
  fetchCartCount: async () => {
    try {
      const response = await cartAPI.getCartCount();
      const count = response.data.data.count;
      set({ cartCount: count });
      return { success: true, count };
    } catch (error) {
      // Silent fail for cart count
      if (error.response?.status !== 401) {
        console.error("Failed to fetch cart count:", error);
      }
      return { success: false, error };
    }
  },

  // Add item to cart
  addToCart: async (productId, variantId, quantity = 1) => {
    try {
      set({ loading: true });
      const response = await cartAPI.addToCart({
        product_id: productId,
        variant_id: variantId,
        quantity,
      });

      // Refresh cart data
      await get().fetchCart();

      message.success("Item added to cart successfully!");
      set({ loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message || "Failed to add item to cart";
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      set({ loading: true });
      await cartAPI.updateCartItem(itemId, { quantity });

      // Refresh cart data
      await get().fetchCart();

      message.success("Cart updated successfully!");
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message || "Failed to update cart";
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Remove item from cart
  removeCartItem: async (itemId) => {
    try {
      set({ loading: true });
      await cartAPI.removeCartItem(itemId);

      // Refresh cart data
      await get().fetchCart();

      message.success("Item removed from cart");
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message || "Failed to remove item";
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      set({ loading: true });
      await cartAPI.clearCart();

      set({
        cart: {
          items: [],
          total_items: 0,
          total_price: 0,
        },
        cartCount: 0,
        loading: false,
      });

      message.success("Cart cleared successfully");
      return { success: true };
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message || "Failed to clear cart";
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Reset cart (on logout)
  resetCart: () => {
    set({
      cart: null,
      cartCount: 0,
      loading: false,
      drawerVisible: false,
    });
  },
}));

export default useCartStore;
