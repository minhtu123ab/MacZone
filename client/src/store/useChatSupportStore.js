import { create } from "zustand";
import { supportChatAPI } from "../services/api";
import {
  initSocket,
  joinRoom,
  leaveRoom,
  sendSocketMessage,
  markSocketRead,
  onNewMessage,
  offNewMessage,
  onNewMessageNotification,
  offNewMessageNotification,
  onUserTyping,
  offUserTyping,
  onUserStopTyping,
  offUserStopTyping,
  onMessagesRead,
  offMessagesRead,
  onUserOnline,
  offUserOnline,
  onRoomJoined,
  offRoomJoined,
} from "../services/socket";

const useChatSupportStore = create((set, get) => ({
  // State
  rooms: [],
  selectedRoom: null,
  messages: [],
  loading: false,
  sending: false,
  typing: null, // { userId, userName }
  totalUnread: 0,
  stats: null,
  filters: {
    status: "",
    search: "",
  },

  // Actions
  /**
   * Initialize socket for admin
   */
  initializeSocket: () => {
    const socket = initSocket();

    if (!socket) {
      return;
    }


    // Listen for new message notifications
    onNewMessageNotification((data) => {
      const state = get();

      // Update totalUnread count
      set({ totalUnread: state.totalUnread + 1 });

      // If message is in current room, add it
      if (data.roomId === state.selectedRoom?._id) {
        const exists = state.messages.some((m) => m._id === data.message._id);
        if (!exists) {
          set({ messages: [...state.messages, data.message] });
        }
      }

      // Update room in rooms list
      const updatedRooms = state.rooms.map((room) => {
        if (room._id === data.roomId) {
          return {
            ...room,
            last_message: data.message.message,
            last_message_at: data.message.createdAt,
            unread_count_admin: (room.unread_count_admin || 0) + 1,
          };
        }
        return room;
      });

      set({ rooms: updatedRooms });
    });

    // Listen for new messages in current room (for admin's own messages and user messages)
    onNewMessage((data) => {
      const state = get();

      if (data.roomId === state.selectedRoom?._id) {
        const exists = state.messages.some((m) => m._id === data.message._id);
        if (!exists) {
          // Auto mark as read if it's a user message and admin is viewing this room
          let messageToAdd = data.message;

          if (data.message.role === "user" && !data.message.is_read) {
            const messageIds = [data.message._id];

            // Call API to mark as read (don't wait)
            supportChatAPI.markAdminRead(data.roomId, messageIds).catch(err => {
              console.error("Error auto-marking message as read:", err);
            });

            // Emit socket event
            markSocketRead(data.roomId, messageIds);

            // Update message to show as read
            messageToAdd = {
              ...data.message,
              is_read: true,
              read_at: new Date()
            };

            // Update rooms list to decrease unread count
            const updatedRooms = state.rooms.map((room) => {
              if (room._id === data.roomId && room.unread_count_admin > 0) {
                return { ...room, unread_count_admin: room.unread_count_admin - 1 };
              }
              return room;
            });

            // Recalculate total unread
            const newTotalUnread = updatedRooms.reduce(
              (sum, room) => sum + (room.unread_count_admin || 0),
              0
            );

            set({
              rooms: updatedRooms,
              totalUnread: Math.max(0, newTotalUnread)
            });
          }

          set({ messages: [...state.messages, messageToAdd] });
        }
      }

      // Update room's last message in rooms list (for all messages including admin's)
      const updatedRooms = state.rooms.map((room) => {
        if (room._id === data.roomId) {
          return {
            ...room,
            last_message: data.message.message,
            last_message_at: data.message.createdAt,
          };
        }
        return room;
      });

      set({ rooms: updatedRooms });
    });


    // Listen for typing
    onUserTyping((data) => {
      const state = get();

      if (data.roomId === state.selectedRoom?._id && data.role === "user") {
        set({ typing: { userId: data.userId, userName: data.userName } });
      }
    });

    onUserStopTyping((data) => {
      set({ typing: null });
    });

    // Listen for messages read
    onMessagesRead((data) => {
      const state = get();

      if (data.roomId === state.selectedRoom?._id) {
        const updatedMessages = state.messages.map((msg) => {
          if (data.messageIds.includes(msg._id)) {
            return { ...msg, is_read: true, read_at: data.readAt };
          }
          return msg;
        });

        set({ messages: updatedMessages });
      }
    });

    // Listen for user online
    onUserOnline((data) => {
      console.log("User online:", data);
    });

    // Listen for room joined
    onRoomJoined((data) => {
      console.log("Room joined:", data.roomId);
    });
  },

  /**
   * Cleanup socket listeners
   */
  cleanupSocket: () => {
    offNewMessage();
    offNewMessageNotification();
    offUserTyping();
    offUserStopTyping();
    offMessagesRead();
    offUserOnline();
    offRoomJoined();
  },

  /**
   * Fetch all rooms
   */
  fetchRooms: async (filters = {}) => {
    set({ loading: true });
    try {
      const response = await supportChatAPI.getAllRooms({
        ...filters,
        sort: "-last_message_at",
      });

      const rooms = response.data.data;

      // Calculate total unread
      const totalUnread = rooms.reduce(
        (sum, room) => sum + (room.unread_count_admin || 0),
        0
      );

      set({
        rooms,
        totalUnread,
        loading: false,
      });

      return rooms;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      set({ loading: false });
      return [];
    }
  },

  /**
   * Select a room
   */
  selectRoom: async (roomId) => {
    const state = get();

    // If already selected, do nothing
    if (state.selectedRoom?._id === roomId) {
      return;
    }

    // Leave previous room
    if (state.selectedRoom?._id) {
      leaveRoom(state.selectedRoom._id);
    }

    set({ loading: true, messages: [], typing: null });

    try {
      // Fetch room details
      const roomResponse = await supportChatAPI.getRoomById(roomId);
      const room = roomResponse.data.data;

      // Fetch messages
      const messagesResponse = await supportChatAPI.getRoomMessages(roomId, {
        limit: 50,
      });
      const messages = messagesResponse.data.data;

      set({
        selectedRoom: room,
        messages,
        loading: false,
      });

      // Join room via socket
      joinRoom(roomId);

      // Mark messages as read
      const unreadMessages = messages.filter(
        (msg) => msg.role === "user" && !msg.is_read
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg._id);
        await supportChatAPI.markAdminRead(roomId, messageIds);
        markSocketRead(roomId, messageIds);

        // Update room's unread count
        const updatedRooms = state.rooms.map((r) => {
          if (r._id === roomId) {
            return { ...r, unread_count_admin: 0 };
          }
          return r;
        });

        set({
          rooms: updatedRooms,
          totalUnread: state.totalUnread - unreadMessages.length,
        });
      }
    } catch (error) {
      console.error("Error selecting room:", error);
      set({ loading: false });
    }
  },

  /**
   * Send message as admin
   */
  sendMessage: async (text) => {
    const state = get();

    if (!text.trim() || !state.selectedRoom) return;

    set({ sending: true });

    try {
      // Send via API only (socket handler will broadcast via new_message event)
      const response = await supportChatAPI.sendMessageAsAdmin({
        roomId: state.selectedRoom._id,
        message: text,
        message_type: "text",
      });

      // Message will be added via socket event listener (new_message)
      // No need to send via socket separately - it causes duplicates

      set({ sending: false });
    } catch (error) {
      console.error("Error sending message:", error);
      set({ sending: false });
    }
  },

  /**
   * Close room
   */
  closeRoom: async (roomId) => {
    try {
      await supportChatAPI.closeRoom(roomId);

      // Update rooms list
      const state = get();
      const updatedRooms = state.rooms.map((room) => {
        if (room._id === roomId) {
          return { ...room, status: "closed", closed_at: new Date() };
        }
        return room;
      });

      set({ rooms: updatedRooms });

      // If this is selected room, deselect it
      if (state.selectedRoom?._id === roomId) {
        leaveRoom(roomId);
        set({ selectedRoom: null, messages: [] });
      }

      return true;
    } catch (error) {
      console.error("Error closing room:", error);
      return false;
    }
  },

  /**
   * Reopen room
   */
  reopenRoom: async (roomId) => {
    try {
      const response = await supportChatAPI.reopenRoom(roomId);
      const reopenedRoom = response.data.data;

      // Update rooms list
      const state = get();
      const updatedRooms = state.rooms.map((room) => {
        if (room._id === roomId) {
          return reopenedRoom;
        }
        return room;
      });

      set({ rooms: updatedRooms });

      // If this is selected room, update it
      if (state.selectedRoom?._id === roomId) {
        set({ selectedRoom: reopenedRoom });
      }

      return true;
    } catch (error) {
      console.error("Error reopening room:", error);
      return false;
    }
  },

  /**
   * Fetch statistics
   */
  fetchStats: async () => {
    try {
      const response = await supportChatAPI.getStats();
      set({ stats: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return null;
    }
  },

  /**
   * Set filters
   */
  setFilters: (filters) => {
    set({ filters });
  },

  /**
   * Reset store
   */
  resetStore: () => {
    const state = get();

    if (state.selectedRoom?._id) {
      leaveRoom(state.selectedRoom._id);
    }

    get().cleanupSocket();

    set({
      rooms: [],
      selectedRoom: null,
      messages: [],
      loading: false,
      sending: false,
      typing: null,
      totalUnread: 0,
      stats: null,
      filters: {
        status: "",
        search: "",
      },
    });
  },
}));

export default useChatSupportStore;
