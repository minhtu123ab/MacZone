import { io } from "socket.io-client";
import { STORAGE_KEYS } from "../constants";

let socket = null;

/**
 * Initialize socket connection
 * @returns {Socket} Socket instance
 */
export const initSocket = () => {
  if (socket) {
    return socket;
  }

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  if (!token) {
    console.error("No auth token found. Cannot initialize socket.");
    return null;
  }

  // Connect to server
  socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ["websocket", "polling"],
  });

  // Connection events
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

/**
 * Get socket instance
 * @returns {Socket|null} Socket instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected manually");
  }
};

/**
 * Join a chat room
 * @param {string} roomId - Room ID to join
 */
export const joinRoom = (roomId) => {
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("join_room", { roomId });
  console.log("Joining room:", roomId);
};

/**
 * Leave a chat room
 * @param {string} roomId - Room ID to leave
 */
export const leaveRoom = (roomId) => {
  if (!socket) return;

  socket.emit("leave_room", { roomId });
  console.log("Leaving room:", roomId);
};

/**
 * Send a message via socket
 * @param {string} roomId - Room ID
 * @param {string} message - Message text
 * @param {string} message_type - Message type (default: 'text')
 */
export const sendSocketMessage = (roomId, message, message_type = "text") => {
  if (!socket) {
    console.error("Socket not initialized");
    return;
  }

  socket.emit("send_message", {
    roomId,
    message,
    message_type,
  });
};

/**
 * Send typing indicator
 * @param {string} roomId - Room ID
 */
export const sendTyping = (roomId) => {
  if (!socket) return;

  socket.emit("typing", { roomId });
};

/**
 * Send stop typing indicator
 * @param {string} roomId - Room ID
 */
export const sendStopTyping = (roomId) => {
  if (!socket) return;

  socket.emit("stop_typing", { roomId });
};

/**
 * Mark messages as read via socket
 * @param {string} roomId - Room ID
 * @param {string[]} messageIds - Array of message IDs
 */
export const markSocketRead = (roomId, messageIds) => {
  if (!socket) return;

  socket.emit("mark_read", { roomId, messageIds });
};

/**
 * Check who is online in a room
 * @param {string} roomId - Room ID
 */
export const checkOnline = (roomId) => {
  if (!socket) return;

  socket.emit("check_online", { roomId });
};

/**
 * Subscribe to new messages
 * @param {Function} callback - Callback function (data) => {}
 */
export const onNewMessage = (callback) => {
  if (!socket) return;

  socket.on("new_message", callback);
};

/**
 * Unsubscribe from new messages
 */
export const offNewMessage = () => {
  if (!socket) return;

  socket.off("new_message");
};

/**
 * Subscribe to typing indicator
 * @param {Function} callback - Callback function (data) => {}
 */
export const onUserTyping = (callback) => {
  if (!socket) return;

  socket.on("user_typing", callback);
};

/**
 * Unsubscribe from typing indicator
 */
export const offUserTyping = () => {
  if (!socket) return;

  socket.off("user_typing");
};

/**
 * Subscribe to stop typing
 * @param {Function} callback - Callback function (data) => {}
 */
export const onUserStopTyping = (callback) => {
  if (!socket) return;

  socket.on("user_stop_typing", callback);
};

/**
 * Unsubscribe from stop typing
 */
export const offUserStopTyping = () => {
  if (!socket) return;

  socket.off("user_stop_typing");
};

/**
 * Subscribe to messages read event
 * @param {Function} callback - Callback function (data) => {}
 */
export const onMessagesRead = (callback) => {
  if (!socket) return;

  socket.on("messages_read", callback);
};

/**
 * Unsubscribe from messages read event
 */
export const offMessagesRead = () => {
  if (!socket) return;

  socket.off("messages_read");
};

/**
 * Subscribe to admin online event
 * @param {Function} callback - Callback function (data) => {}
 */
export const onAdminOnline = (callback) => {
  if (!socket) return;

  socket.on("admin_online", callback);
};

/**
 * Unsubscribe from admin online event
 */
export const offAdminOnline = () => {
  if (!socket) return;

  socket.off("admin_online");
};

/**
 * Subscribe to admin offline event
 * @param {Function} callback - Callback function (data) => {}
 */
export const onAdminOffline = (callback) => {
  if (!socket) return;

  socket.on("admin_offline", callback);
};

/**
 * Unsubscribe from admin offline event
 */
export const offAdminOffline = () => {
  if (!socket) return;

  socket.off("admin_offline");
};

/**
 * Subscribe to user online event (for admin)
 * @param {Function} callback - Callback function (data) => {}
 */
export const onUserOnline = (callback) => {
  if (!socket) return;

  socket.on("user_online", callback);
};

/**
 * Unsubscribe from user online event
 */
export const offUserOnline = () => {
  if (!socket) return;

  socket.off("user_online");
};

/**
 * Subscribe to online users
 * @param {Function} callback - Callback function (data) => {}
 */
export const onOnlineUsers = (callback) => {
  if (!socket) return;

  socket.on("online_users", callback);
};

/**
 * Unsubscribe from online users
 */
export const offOnlineUsers = () => {
  if (!socket) return;

  socket.off("online_users");
};

/**
 * Subscribe to room joined event
 * @param {Function} callback - Callback function (data) => {}
 */
export const onRoomJoined = (callback) => {
  if (!socket) return;

  socket.on("room_joined", callback);
};

/**
 * Unsubscribe from room joined event
 */
export const offRoomJoined = () => {
  if (!socket) return;

  socket.off("room_joined");
};

/**
 * Subscribe to new message notification (for admin)
 * @param {Function} callback - Callback function (data) => {}
 */
export const onNewMessageNotification = (callback) => {
  if (!socket) return;

  socket.on("new_message_notification", callback);
};

/**
 * Unsubscribe from new message notification
 */
export const offNewMessageNotification = () => {
  if (!socket) return;

  socket.off("new_message_notification");
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendSocketMessage,
  sendTyping,
  sendStopTyping,
  markSocketRead,
  checkOnline,
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
  onUserOnline,
  offUserOnline,
  onOnlineUsers,
  offOnlineUsers,
  onRoomJoined,
  offRoomJoined,
  onNewMessageNotification,
  offNewMessageNotification,
};
