import express from "express";
import { body } from "express-validator";
import {
  getOrCreateChatRoom,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getAllChatRooms,
  getChatRoomById,
  getRoomMessages,
  sendMessageAsAdmin,
  markAdminMessagesAsRead,
  closeChatRoom,
  reopenChatRoom,
  getChatStats,
} from "../controllers/support-chat.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Support Chat
 *   description: Live chat support between users and admins
 */

// ==================== USER ROUTES ====================

/**
 * @swagger
 * /api/support-chat/my-room:
 *   post:
 *     summary: Get or create my chat room
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat room retrieved or created
 *       401:
 *         description: Unauthorized
 */
router.post("/my-room", protect, getOrCreateChatRoom);

/**
 * @swagger
 * /api/support-chat/messages:
 *   get:
 *     summary: Get my chat messages
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages retrieved
 *       404:
 *         description: Chat room not found
 */
router.get("/messages", protect, getMessages);

/**
 * @swagger
 * /api/support-chat/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Hello, I need help with my order"
 *               message_type:
 *                 type: string
 *                 enum: [text, image, system]
 *                 default: text
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/messages",
  protect,
  [
    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 2000 })
      .withMessage("Message must not exceed 2000 characters"),
    body("message_type")
      .optional()
      .isIn(["text", "image", "system"])
      .withMessage("Invalid message type"),
  ],
  sendMessage
);

/**
 * @swagger
 * /api/support-chat/mark-read:
 *   patch:
 *     summary: Mark messages as read
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageIds
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.patch("/mark-read", protect, markMessagesAsRead);

// ==================== ADMIN ROUTES ====================

/**
 * @swagger
 * /api/support-chat/admin/rooms:
 *   get:
 *     summary: Get all chat rooms (Admin)
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -last_message_at
 *     responses:
 *       200:
 *         description: Chat rooms retrieved
 */
router.get("/admin/rooms", protect, authorize("admin"), getAllChatRooms);

/**
 * @swagger
 * /api/support-chat/admin/rooms/{id}:
 *   get:
 *     summary: Get chat room by ID (Admin)
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room retrieved
 *       404:
 *         description: Chat room not found
 */
router.get("/admin/rooms/:id", protect, authorize("admin"), getChatRoomById);

/**
 * @swagger
 * /api/support-chat/admin/messages:
 *   get:
 *     summary: Get messages of a room (Admin)
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages retrieved
 *       400:
 *         description: roomId is required
 */
router.get("/admin/messages", protect, authorize("admin"), getRoomMessages);

/**
 * @swagger
 * /api/support-chat/admin/messages:
 *   post:
 *     summary: Send message as admin
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - message
 *             properties:
 *               roomId:
 *                 type: string
 *               message:
 *                 type: string
 *               message_type:
 *                 type: string
 *                 enum: [text, image, system]
 *                 default: text
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       404:
 *         description: Chat room not found
 */
router.post(
  "/admin/messages",
  protect,
  authorize("admin"),
  [
    body("roomId").notEmpty().withMessage("Room ID is required"),
    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 2000 })
      .withMessage("Message must not exceed 2000 characters"),
    body("message_type")
      .optional()
      .isIn(["text", "image", "system"])
      .withMessage("Invalid message type"),
  ],
  sendMessageAsAdmin
);

/**
 * @swagger
 * /api/support-chat/admin/mark-read:
 *   patch:
 *     summary: Mark messages as read (Admin)
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *             properties:
 *               roomId:
 *                 type: string
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.patch(
  "/admin/mark-read",
  protect,
  authorize("admin"),
  markAdminMessagesAsRead
);

/**
 * @swagger
 * /api/support-chat/admin/close/{id}:
 *   patch:
 *     summary: Close chat room (Admin)
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room closed
 *       404:
 *         description: Chat room not found
 */
router.patch("/admin/close/:id", protect, authorize("admin"), closeChatRoom);

// Reopen chat room
router.patch("/admin/reopen/:id", protect, authorize("admin"), reopenChatRoom);

/**
 * @swagger
 * /api/support-chat/admin/stats:
 *   get:
 *     summary: Get chat statistics (Admin)
 *     tags: [Support Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 */
router.get("/admin/stats", protect, authorize("admin"), getChatStats);

export default router;
