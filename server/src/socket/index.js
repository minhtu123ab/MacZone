import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

let io = null;

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.full_name} (${socket.user.role})`);

    // Import and setup chat handler
    import("./chatHandler.js").then((module) => {
      module.setupChatHandlers(io, socket);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.full_name}`);
    });

    // Error handler
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  console.log("🔌 Socket.io initialized");
  return io;
};

/**
 * Get Socket.io instance
 * @returns {Server} Socket.io server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

/**
 * Emit event to specific user(s)
 * @param {string|string[]} userIds - User ID or array of user IDs
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export const emitToUser = (userIds, event, data) => {
  if (!io) return;

  const ids = Array.isArray(userIds) ? userIds : [userIds];

  io.sockets.sockets.forEach((socket) => {
    if (socket.user && ids.includes(socket.user._id.toString())) {
      socket.emit(event, data);
    }
  });
};

/**
 * Emit event to all admins
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export const emitToAdmins = (event, data) => {
  if (!io) return;

  io.sockets.sockets.forEach((socket) => {
    if (socket.user && socket.user.role === "admin") {
      socket.emit(event, data);
    }
  });
};

export default { initSocket, getIO, emitToUser, emitToAdmins };
