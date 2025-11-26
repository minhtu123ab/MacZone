import { validationResult } from "express-validator";
import { ChatRoom, ChatMessage, User } from "../models/index.js";

// ==================== USER APIS ====================

/**
 * @desc    Get or create chat room for current user
 * @route   POST /api/support-chat/my-room
 * @access  Private
 */
export const getOrCreateChatRoom = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find existing active room
    let room = await ChatRoom.findOne({
      user_id: userId,
      status: "active",
    }).populate("admin_id", "full_name email role");

    // If no active room, create new one
    if (!room) {
      room = await ChatRoom.create({
        user_id: userId,
        status: "active",
      });

      // Populate after creation
      room = await ChatRoom.findById(room._id).populate(
        "admin_id",
        "full_name email role"
      );
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get messages in chat room
 * @route   GET /api/support-chat/messages
 * @access  Private
 */
export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    // Find user's active room
    const room = await ChatRoom.findOne({
      user_id: userId,
      status: "active",
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    // Get messages with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await ChatMessage.find({ room_id: room._id })
      .populate("sender_id", "full_name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatMessage.countDocuments({ room_id: room._id });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send message in chat room
 * @route   POST /api/support-chat/messages
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user._id;
    const { message, message_type = "text" } = req.body;

    // Find or create room
    let room = await ChatRoom.findOne({
      user_id: userId,
      status: "active",
    });

    if (!room) {
      room = await ChatRoom.create({
        user_id: userId,
        status: "active",
      });
    }

    // Create message
    const newMessage = await ChatMessage.create({
      room_id: room._id,
      sender_id: userId,
      role: "user",
      message,
      message_type,
      is_read: false,
    });

    // Update room's last message and unread count for admin
    await ChatRoom.findByIdAndUpdate(room._id, {
      last_message: message,
      last_message_at: new Date(),
      $inc: { unread_count_admin: 1 },
    });

    // Populate sender info
    const populatedMessage = await ChatMessage.findById(newMessage._id).populate(
      "sender_id",
      "full_name email role"
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark messages as read
 * @route   PATCH /api/support-chat/mark-read
 * @access  Private
 */
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: "Please provide messageIds array",
      });
    }

    // Find user's room
    const room = await ChatRoom.findOne({
      user_id: userId,
      status: "active",
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    // Update messages
    const result = await ChatMessage.updateMany(
      {
        _id: { $in: messageIds },
        room_id: room._id,
        role: "admin", // Only mark admin messages as read by user
        is_read: false,
      },
      {
        $set: {
          is_read: true,
          read_at: new Date(),
        },
      }
    );

    // Reset user's unread count
    await ChatRoom.findByIdAndUpdate(room._id, {
      unread_count_user: 0,
    });

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      count: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN APIS ====================

/**
 * @desc    Get all chat rooms (Admin)
 * @route   GET /api/support-chat/admin/rooms
 * @access  Private/Admin
 */
export const getAllChatRooms = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20, sort = "-last_message_at" } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Search by user name or email
    if (search) {
      const users = await User.find({
        $or: [
          { full_name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      filter.user_id = { $in: users.map((u) => u._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rooms = await ChatRoom.find(filter)
      .populate("user_id", "full_name email phone")
      .populate("admin_id", "full_name email")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatRoom.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat room by ID (Admin)
 * @route   GET /api/support-chat/admin/rooms/:id
 * @access  Private/Admin
 */
export const getChatRoomById = async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.id)
      .populate("user_id", "full_name email phone")
      .populate("admin_id", "full_name email");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }
    next(error);
  }
};

/**
 * @desc    Get messages of a room (Admin)
 * @route   GET /api/support-chat/admin/messages
 * @access  Private/Admin
 */
export const getRoomMessages = async (req, res, next) => {
  try {
    const { roomId, page = 1, limit = 50 } = req.query;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Please provide roomId",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ChatMessage.find({ room_id: roomId })
      .populate("sender_id", "full_name email role")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ChatMessage.countDocuments({ room_id: roomId });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send message as admin
 * @route   POST /api/support-chat/admin/messages
 * @access  Private/Admin
 */
export const sendMessageAsAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const adminId = req.user._id;
    const { roomId, message, message_type = "text" } = req.body;

    // Find room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    // Create message
    const newMessage = await ChatMessage.create({
      room_id: roomId,
      sender_id: adminId,
      role: "admin",
      message,
      message_type,
      is_read: false,
    });

    // Update room's last message, admin_id, and unread count for user
    await ChatRoom.findByIdAndUpdate(roomId, {
      admin_id: adminId,
      last_message: message,
      last_message_at: new Date(),
      $inc: { unread_count_user: 1 },
    });

    // Populate sender info
    const populatedMessage = await ChatMessage.findById(newMessage._id).populate(
      "sender_id",
      "full_name email role"
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark admin messages as read (when admin opens room)
 * @route   PATCH /api/support-chat/admin/mark-read
 * @access  Private/Admin
 */
export const markAdminMessagesAsRead = async (req, res, next) => {
  try {
    const { roomId, messageIds } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Please provide roomId",
      });
    }

    // Update messages
    const result = await ChatMessage.updateMany(
      {
        _id: { $in: messageIds || [] },
        room_id: roomId,
        role: "user", // Only mark user messages as read by admin
        is_read: false,
      },
      {
        $set: {
          is_read: true,
          read_at: new Date(),
        },
      }
    );

    // Reset admin's unread count
    await ChatRoom.findByIdAndUpdate(roomId, {
      unread_count_admin: 0,
    });

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      count: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close chat room (Admin)
 * @route   PATCH /api/support-chat/admin/close/:id
 * @access  Private/Admin
 */
export const closeChatRoom = async (req, res, next) => {
  try {
    const room = await ChatRoom.findByIdAndUpdate(
      req.params.id,
      {
        status: "closed",
        closed_at: new Date(),
      },
      { new: true }
    ).populate("user_id", "full_name email");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat room closed successfully",
      data: room,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }
    next(error);
  }
};

/**
 * @desc    Reopen chat room (Admin)
 * @route   PATCH /api/support-chat/admin/reopen/:id
 * @access  Private/Admin
 */
export const reopenChatRoom = async (req, res, next) => {
  try {
    const room = await ChatRoom.findByIdAndUpdate(
      req.params.id,
      {
        status: "active",
        closed_at: null,
        unread_count_user: 0,
        unread_count_admin: 0,
      },
      { new: true }
    )
      .populate("user_id", "full_name email")
      .populate("admin_id", "full_name email");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Chat room reopened successfully",
      data: room,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }
    next(error);
  }
};


/**
 * @desc    Get chat statistics (Admin Dashboard)
 * @route   GET /api/support-chat/admin/stats
 * @access  Private/Admin
 */
export const getChatStats = async (req, res, next) => {
  try {
    const totalRooms = await ChatRoom.countDocuments();
    const activeRooms = await ChatRoom.countDocuments({ status: "active" });
    const closedRooms = await ChatRoom.countDocuments({ status: "closed" });

    // Total unread messages for admin
    const roomsWithUnread = await ChatRoom.find({
      unread_count_admin: { $gt: 0 },
    });
    const totalUnread = roomsWithUnread.reduce(
      (sum, room) => sum + room.unread_count_admin,
      0
    );

    // Total messages
    const totalMessages = await ChatMessage.countDocuments();

    // Messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await ChatMessage.countDocuments({
      createdAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        activeRooms,
        closedRooms,
        totalUnread,
        totalMessages,
        messagesToday,
        roomsWithUnread: roomsWithUnread.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
