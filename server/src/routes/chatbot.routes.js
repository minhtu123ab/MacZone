import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.middleware.js";
import {
  startChat,
  getPriceRanges,
  getStoryRequest,
  getRecommendations,
  getChatHistory,
  getAIMessageDetail,
} from "../controllers/chatbot.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: AI Chatbot for product recommendations
 */

/**
 * @swagger
 * /api/chatbot/start:
 *   post:
 *     summary: Start a chatbot conversation
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatRoomId:
 *                       type: string
 *                     greeting:
 *                       type: string
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
router.post("/start", protect, startChat);

/**
 * @swagger
 * /api/chatbot/price-ranges:
 *   get:
 *     summary: Get available price ranges for a category
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Price ranges retrieved successfully
 *       400:
 *         description: Category ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.get("/price-ranges", protect, getPriceRanges);

/**
 * @swagger
 * /api/chatbot/story-request:
 *   post:
 *     summary: Get story request message
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - priceRangeId
 *             properties:
 *               categoryId:
 *                 type: string
 *               priceRangeId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Story request message generated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.post(
  "/story-request",
  protect,
  [
    body("categoryId")
      .notEmpty()
      .withMessage("Category ID is required")
      .isMongoId()
      .withMessage("Invalid category ID"),
    body("priceRangeId")
      .notEmpty()
      .withMessage("Price range ID is required")
      .isInt({ min: 0, max: 4 })
      .withMessage("Price range ID must be between 0 and 4"),
  ],
  getStoryRequest
);

/**
 * @swagger
 * /api/chatbot/recommend:
 *   post:
 *     summary: Get product recommendations based on user story
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - priceRangeId
 *               - userStory
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               priceRangeId:
 *                 type: number
 *                 description: Price range ID (0-4)
 *               userStory:
 *                 type: string
 *                 description: User's description of their needs (min 10 characters)
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     aiMessageId:
 *                       type: string
 *                     categoryName:
 *                       type: string
 *                     priceRange:
 *                       type: object
 *                     userStory:
 *                       type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     tokensUsed:
 *                       type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No products found
 */
router.post(
  "/recommend",
  protect,
  [
    body("categoryId")
      .notEmpty()
      .withMessage("Category ID is required")
      .isMongoId()
      .withMessage("Invalid category ID"),
    body("priceRangeId")
      .notEmpty()
      .withMessage("Price range ID is required")
      .isInt({ min: 0, max: 4 })
      .withMessage("Price range ID must be between 0 and 4"),
    body("userStory")
      .notEmpty()
      .withMessage("User story is required")
      .isString()
      .withMessage("User story must be a string")
      .isLength({ min: 10 })
      .withMessage("User story must be at least 10 characters"),
  ],
  getRecommendations
);

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     summary: Get user's chat history (AI messages)
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/history", protect, getChatHistory);

/**
 * @swagger
 * /api/chatbot/history/{id}:
 *   get:
 *     summary: Get single AI message detail with recommendations
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: AI Message ID
 *     responses:
 *       200:
 *         description: AI message detail retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: AI message not found
 */
router.get("/history/:id", protect, getAIMessageDetail);

// Note: ChatRoom functionality is for support staff chat, not AI chatbot
// AI chatbot history is managed through /api/chatbot/history endpoints

export default router;
