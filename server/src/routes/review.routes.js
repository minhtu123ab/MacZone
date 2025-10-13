import express from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewableItems,
  markReviewPrompted,
  getFeaturedReviews,
  getAllReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - user_id
 *         - product_id
 *         - rating
 *       properties:
 *         _id:
 *           type: string
 *           description: Review ID
 *         user_id:
 *           type: string
 *           description: User ID who wrote the review
 *         product_id:
 *           type: string
 *           description: Product ID being reviewed
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5
 *         comment:
 *           type: string
 *           description: Review comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get all reviews (Admin only)
 *     tags: [Reviews]
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
 *           default: 10
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: List of all reviews
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get("/", protect, authorize("admin"), getAllReviews);

/**
 * @swagger
 * /api/reviews/order-item/{orderItemId}:
 *   post:
 *     summary: Create review for an order item
 *     description: User can only review products from completed orders
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order item ID to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Great product! Highly recommended."
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Order not completed or already reviewed
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order item not found
 */
router.post(
  "/order-item/:orderItemId",
  protect,
  [
    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment must not exceed 1000 characters"),
  ],
  createReview
);

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
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
 *           default: 10
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (e.g., -createdAt, rating)
 *     responses:
 *       200:
 *         description: List of reviews
 *       404:
 *         description: Product not found
 */
router.get("/product/:productId", getProductReviews);

/**
 * @swagger
 * /api/reviews/featured:
 *   get:
 *     summary: Get featured reviews for homepage
 *     description: Returns top rated (5 stars) and recent reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Number of reviews to return
 *     responses:
 *       200:
 *         description: List of featured reviews
 */
router.get("/featured", getFeaturedReviews);

/**
 * @swagger
 * /api/reviews/my-reviews:
 *   get:
 *     summary: Get current user's reviews
 *     tags: [Reviews]
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
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: List of user's reviews
 *       401:
 *         description: Not authenticated
 */
router.get("/my-reviews", protect, getMyReviews);

/**
 * @swagger
 * /api/reviews/reviewable-items:
 *   get:
 *     summary: Get list of order items that can be reviewed
 *     description: Returns completed order items that haven't been prompted for review yet
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviewable items
 *       401:
 *         description: Not authenticated
 */
router.get("/reviewable-items", protect, getReviewableItems);

/**
 * @swagger
 * /api/reviews/mark-prompted:
 *   post:
 *     summary: Mark order items as review prompted
 *     description: Called when user opens review popup to dismiss review notifications
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItemIds
 *             properties:
 *               orderItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60d5ec49f1b2c8b1f8c5e1a1", "60d5ec49f1b2c8b1f8c5e1a2"]
 *     responses:
 *       200:
 *         description: Order items marked successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  "/mark-prompted",
  protect,
  [
    body("orderItemIds")
      .isArray({ min: 1 })
      .withMessage("Order item IDs array is required and must not be empty"),
    body("orderItemIds.*")
      .isMongoId()
      .withMessage("Each order item ID must be a valid MongoDB ID"),
  ],
  markReviewPrompted
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this review
 *       404:
 *         description: Review not found
 */
router.put(
  "/:reviewId",
  protect,
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment must not exceed 1000 characters"),
  ],
  updateReview
);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     description: Users can delete their own reviews. Admins can delete any review.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this review
 *       404:
 *         description: Review not found
 */
router.delete("/:reviewId", protect, deleteReview);

export default router;
