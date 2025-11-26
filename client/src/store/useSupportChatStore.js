import { create } from "zustand";
import { supportChatAPI } from "../services/api";
import {
  initSocket,
  joinRoom,
  leaveRoom,
  sendSocketMessage,
  sendTyping,
  sendStopTyping,
  markSocketRead,
  onNewMessage,
  offNewMessage,
  onUserTyping,
  offUserTyping,
  onUserStopTyping,
  offUserStopTyping,
  onMessagesRead,
  offMessagesRead,
  onAdminOnline,
  offAdminOnline,
  onAdminOffline,
  offAdminOffline,
  onRoomJoined,
  offRoomJoined,
} from "../services/socket";

const useSupportChatStore = create((set, get) => ({
  // State
  room: null,
  messages: [],
  loading: false,
  sending: false,
  typing: null, // { userId, userName, role }
  adminOnline: false,
  unreadCount: 0,
  error: null,

  // Internal state for preventing race conditions
  fetchingRoomPromise: null,

  // Actions
  /**
   * Initialize socket and setup event listeners
   */
  initializeSocket: () => {
    const socket = initSocket();

    if (!socket) {
      set({ error: "Could not initialize socket connection" });
      return;
    }

    // Listen for new messages
    onNewMessage((data) => {
      const state = get();
      const { message } = data;

      // Don't add if message already exists
      const exists = state.messages.some((m) => m._id === message._id);
      if (!exists) {
        set({
          messages: [...state.messages, message],
          unreadCount:
            message.role === "admin" ? state.unreadCount + 1 : state.unreadCount,
        });

        // Scroll to bottom (will be handled by component)
      }
    });

    // Listen for typing
    onUserTyping((data) => {
      if (data.role === "admin") {
        set({
          typing: {
            userId: data.userId,
            userName: data.userName,
            role: data.role,
          },
        });
      }
    });

    // Listen for stop typing
    onUserStopTyping((data) => {
      set({ typing: null });
    });

    // Listen for messages read
    onMessagesRead((data) => {
      const state = get();
      const updatedMessages = state.messages.map((msg) => {
        if (data.messageIds.includes(msg._id)) {
          return { ...msg, is_read: true, read_at: data.readAt };
        }
        return msg;
      });

      set({ messages: updatedMessages });
    });

    // Listen for admin online/offline
    onAdminOnline((data) => {
      set({ adminOnline: true });
    });

    onAdminOffline((data) => {
      set({ adminOnline: false });
    });

    // Listen for room joined
    onRoomJoined((data) => {
      console.log("Room joined successfully:", data.roomId);
    });
  },

  /**
   * Cleanup socket listeners
   */
  cleanupSocket: () => {
    offNewMessage();
    offUserTyping();
    offUserStopTyping();
    offMessagesRead();
    offAdminOnline();
    offAdminOffline();
    offRoomJoined();
  },

  /**
   * Fetch or create chat room (with race condition protection)
   */
  fetchRoom: async () => {
    const state = get();

    // If already fetching, return the existing promise
    if (state.fetchingRoomPromise) {
      return state.fetchingRoomPromise;
    }

    const promise = (async () => {
      set({ loading: true, error: null });
      try {
        const response = await supportChatAPI.getOrCreateRoom();
        const room = response.data.data;

        set({
          room,
          loading: false,
          unreadCount: room.unread_count_user || 0,
          fetchingRoomPromise: null, // Clear promise
        });

        // Join room via socket
        if (room._id) {
          joinRoom(room._id);
        }

        return room;
      } catch (error) {
        console.error("Error fetching room:", error);
        set({
          loading: false,
          error: error.response?.data?.message || "Failed to load chat room",
          fetchingRoomPromise: null, // Clear promise even on error
        });
        return null;
      }
    })();

    // Store the promise to prevent concurrent calls
    set({ fetchingRoomPromise: promise });
    return promise;
  },

  /**
   * Fetch messages
   */
  fetchMessages: async (page = 1, limit = 50) => {
    set({ loading: true, error: null });
    try {
      const response = await supportChatAPI.getMessages({ page, limit });
      const messages = response.data.data;

      set({
        messages,
        loading: false,
      });

      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to load messages",
      });
      return [];
    }
  },

  /**
   * Send message
   */
  sendMessage: async (text) => {
    const state = get();

    if (!text.trim()) return;

    if (!state.room?._id) {
      // Try to create room first
      await get().fetchRoom();
    }

    const roomId = get().room?._id;
    if (!roomId) {
      set({ error: "No chat room available" });
      return;
    }

    set({ sending: true, error: null });

    try {
      // Send via API only (socket handler will broadcast via new_message event)
      const response = await supportChatAPI.sendMessage({
        message: text,
        message_type: "text",
      });

      // Message will be added via socket event listener (new_message)
      // No need to send via socket separately - it causes duplicates

      set({ sending: false });
    } catch (error) {
      console.error("Error sending message:", error);
      set({
        sending: false,
        error: error.response?.data?.message || "Failed to send message",
      });
    }
  },

  /**
   * Add message directly (from socket)
   */
  addMessage: (message) => {
    const state = get();

    // Check if message already exists
    const exists = state.messages.some((m) => m._id === message._id);
    if (exists) return;

    set({
      messages: [...state.messages, message],
      unreadCount:
        message.role === "admin" ? state.unreadCount + 1 : state.unreadCount,
    });
  },

  /**
   * Mark messages as read
   */
  markAsRead: async () => {
    const state = get();

    if (!state.room?._id) return;

    // Get unread admin messages
    const unreadMessages = state.messages.filter(
      (msg) => msg.role === "admin" && !msg.is_read
    );

    if (unreadMessages.length === 0) return;

    const messageIds = unreadMessages.map((msg) => msg._id);

    try {
      // Mark via API
      await supportChatAPI.markAsRead(messageIds);

      // Mark via socket
      markSocketRead(state.room._id, messageIds);

      // Update local state
      const updatedMessages = state.messages.map((msg) => {
        if (messageIds.includes(msg._id)) {
          return { ...msg, is_read: true, read_at: new Date() };
        }
        return msg;
      });

      set({
        messages: updatedMessages,
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  /**
   * Set typing status
   */
  setTyping: (isTyping) => {
    const state = get();

    if (!state.room?._id) return;

    if (isTyping) {
      sendTyping(state.room._id);
    } else {
      sendStopTyping(state.room._id);
    }
  },

  /**
   * Leave room
   */
  leaveRoom: () => {
    const state = get();

    if (state.room?._id) {
      leaveRoom(state.room._id);
    }

    get().cleanupSocket();
  },

  /**
   * Reset store
   */
  resetStore: () => {
    const state = get();

    if (state.room?._id) {
      leaveRoom(state.room._id);
    }

    get().cleanupSocket();

    set({
      room: null,
      messages: [],
      loading: false,
      sending: false,
      typing: null,
      adminOnline: false,
      unreadCount: 0,
      error: null,
    });
  },
}));

export default useSupportChatStore;
