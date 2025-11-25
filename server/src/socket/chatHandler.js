import { ChatRoom, ChatMessage } from "../models/index.js";

/**
 * Setup chat-related socket event handlers
 * @param {Server} io - Socket.io server instance
 * @param {Socket} socket - Socket instance
 */
export const setupChatHandlers = (io, socket) => {
  const user = socket.user;

  // ==================== JOIN/LEAVE ROOM ====================

  /**
   * Join a chat room
   * Event: join_room
   * Data: { roomId: string }
   */
  socket.on("join_room", async (data) => {
    try {
      const { roomId } = data;

      if (!roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }

      // Verify room exists and user has access
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Check permission
      const isUser = room.user_id.toString() === user._id.toString();
      const isAdmin = user.role === "admin";

      if (!isUser && !isAdmin) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      // Join the room
      socket.join(roomId);
      console.log(`👤 ${user.full_name} joined room ${roomId}`);

      // Notify others in room
      socket.to(roomId).emit("user_joined", {
        userId: user._id,
        userName: user.full_name,
        role: user.role,
      });

      // Send confirmation
      socket.emit("room_joined", {
        roomId,
        success: true,
      });

      // If admin joined, notify user that admin is online
      if (isAdmin) {
        socket.to(roomId).emit("admin_online", {
          adminId: user._id,
          adminName: user.full_name,
        });
      }

      // If user joined, notify admins
      if (isUser) {
        socket.to(roomId).emit("user_online", {
          userId: user._id,
          userName: user.full_name,
        });
      }
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  /**
   * Leave a chat room
   * Event: leave_room
   * Data: { roomId: string }
   */
  socket.on("leave_room", (data) => {
    try {
      const { roomId } = data;

      if (!roomId) return;

      socket.leave(roomId);
      console.log(`👋 ${user.full_name} left room ${roomId}`);

      // Notify others
      socket.to(roomId).emit("user_left", {
        userId: user._id,
        userName: user.full_name,
        role: user.role,
      });

      // If admin left, notify user
      if (user.role === "admin") {
        socket.to(roomId).emit("admin_offline", {
          adminId: user._id,
        });
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  // ==================== MESSAGING ====================

  /**
   * Send a message
   * Event: send_message
   * Data: { roomId: string, message: string, message_type?: string }
   */
  socket.on("send_message", async (data) => {
    try {
      const { roomId, message, message_type = "text" } = data;

      if (!roomId || !message) {
        socket.emit("error", { message: "Room ID and message are required" });
        return;
      }

      // Verify room access
      const room = await ChatRoom.findById(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      const isUser = room.user_id.toString() === user._id.toString();
      const isAdmin = user.role === "admin";

      if (!isUser && !isAdmin) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      // Create message in database
      const newMessage = await ChatMessage.create({
        room_id: roomId,
        sender_id: user._id,
        role: user.role,
        message,
        message_type,
        is_read: false,
      });

      // Update room's last message and unread count
      const updateData = {
        last_message: message,
        last_message_at: new Date(),
      };

      if (user.role === "user") {
        updateData.$inc = { unread_count_admin: 1 };
      } else {
        updateData.$inc = { unread_count_user: 1 };
        updateData.admin_id = user._id; // Assign admin to room
      }

      await ChatRoom.findByIdAndUpdate(roomId, updateData);

      // Populate message
      const populatedMessage = await ChatMessage.findById(newMessage._id)
        .populate("sender_id", "full_name email role")
        .lean();

      // Emit to all users in the room
      io.to(roomId).emit("new_message", {
        message: populatedMessage,
        roomId,
      });

      console.log(`💬 Message sent in room ${roomId} by ${user.full_name}`);

      // Notify admins if user sent message (for badge update)
      if (user.role === "user") {
        const admins = Array.from(io.sockets.sockets.values()).filter(
          (s) => s.user && s.user.role === "admin"
        );

        admins.forEach((adminSocket) => {
          adminSocket.emit("new_message_notification", {
            roomId,
            message: populatedMessage,
            userName: user.full_name,
          });
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // ==================== TYPING INDICATOR ====================

  /**
   * User is typing
   * Event: typing
   * Data: { roomId: string }
   */
  socket.on("typing", (data) => {
    try {
      const { roomId } = data;

      if (!roomId) return;

      // Emit to others in room
      socket.to(roomId).emit("user_typing", {
        userId: user._id,
        userName: user.full_name,
        role: user.role,
        roomId,
      });
    } catch (error) {
      console.error("Error on typing:", error);
    }
  });

  /**
   * User stopped typing
   * Event: stop_typing
   * Data: { roomId: string }
   */
  socket.on("stop_typing", (data) => {
    try {
      const { roomId } = data;

      if (!roomId) return;

      socket.to(roomId).emit("user_stop_typing", {
        userId: user._id,
        role: user.role,
        roomId,
      });
    } catch (error) {
      console.error("Error on stop typing:", error);
    }
  });

  // ==================== READ RECEIPTS ====================

  /**
   * Mark messages as read
   * Event: mark_read
   * Data: { roomId: string, messageIds: string[] }
   */
  socket.on("mark_read", async (data) => {
    try {
      const { roomId, messageIds } = data;

      if (!roomId || !messageIds || !Array.isArray(messageIds)) {
        return;
      }

      // Determine which role's messages to mark as read
      const senderRole = user.role === "admin" ? "user" : "admin";

      // Update messages in database
      await ChatMessage.updateMany(
        {
          _id: { $in: messageIds },
          room_id: roomId,
          role: senderRole,
          is_read: false,
        },
        {
          $set: {
            is_read: true,
            read_at: new Date(),
          },
        }
      );

      // Update room's unread count
      const unreadField =
        user.role === "admin" ? "unread_count_admin" : "unread_count_user";

      await ChatRoom.findByIdAndUpdate(roomId, {
        [unreadField]: 0,
      });

      // Emit to all in room
      io.to(roomId).emit("messages_read", {
        messageIds,
        readBy: user._id,
        readAt: new Date(),
        roomId,
      });

      console.log(`✓ Messages marked as read in room ${roomId} by ${user.full_name}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // ==================== ONLINE STATUS ====================

  /**
   * Check who is online in a room
   * Event: check_online
   * Data: { roomId: string }
   */
  socket.on("check_online", async (data) => {
    try {
      const { roomId } = data;

      if (!roomId) return;

      // Get all sockets in this room
      const socketsInRoom = await io.in(roomId).fetchSockets();

      const onlineUsers = socketsInRoom.map((s) => ({
        userId: s.user._id,
        userName: s.user.full_name,
        role: s.user.role,
      }));

      socket.emit("online_users", {
        roomId,
        users: onlineUsers,
      });
    } catch (error) {
      console.error("Error checking online status:", error);
    }
  });
};
