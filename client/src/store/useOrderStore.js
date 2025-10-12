import { create } from "zustand";
import { orderAPI } from "../services/api";
import { message } from "antd";

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  // Create order (Checkout)
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await orderAPI.createOrder(orderData);
      if (response.data.success) {
        message.success(response.data.message || "Order created successfully!");
        set({ currentOrder: response.data.data, loading: false });
        return response.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Failed to create order";
      message.error(errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Get user orders
  fetchOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await orderAPI.getUserOrders(params);
      if (response.data.success) {
        set({
          orders: response.data.data,
          pagination: {
            page: response.data.currentPage,
            limit: params.limit || 10,
            total: response.data.total,
            totalPages: response.data.totalPages,
          },
          loading: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch orders";
      set({ error: errorMessage, loading: false });
      message.error(errorMessage);
    }
  },

  // Get single order by ID
  fetchOrderById: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const response = await orderAPI.getOrderById(orderId);
      if (response.data.success) {
        set({ currentOrder: response.data.data, loading: false });
        return response.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch order details";
      set({ error: errorMessage, loading: false });
      message.error(errorMessage);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId, canceledReason) => {
    set({ loading: true, error: null });
    try {
      const response = await orderAPI.cancelOrder(orderId, {
        canceled_reason: canceledReason,
      });
      if (response.data.success) {
        message.success(
          response.data.message || "Order canceled successfully!"
        );

        // Update orders list if exists
        const orders = get().orders;
        const updatedOrders = orders.map((order) =>
          order._id === orderId
            ? { ...order, status: "canceled", canceled_reason: canceledReason }
            : order
        );
        set({ orders: updatedOrders, loading: false });

        // Update current order if it's the one being canceled
        const currentOrder = get().currentOrder;
        if (currentOrder?.order?._id === orderId) {
          set({
            currentOrder: {
              ...currentOrder,
              order: {
                ...currentOrder.order,
                status: "canceled",
                canceled_reason: canceledReason,
              },
            },
          });
        }

        return response.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to cancel order";
      message.error(errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update order status (Admin)
  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await orderAPI.updateOrderStatus(orderId, { status });
      if (response.data.success) {
        message.success("Order status updated successfully!");

        // Update orders list
        const orders = get().orders;
        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        );
        set({ orders: updatedOrders, loading: false });

        return response.data.data;
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update order status";
      message.error(errorMessage);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Reset current order
  resetCurrentOrder: () => set({ currentOrder: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useOrderStore;
