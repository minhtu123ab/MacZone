import express from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingCode,
  getAllOrders,
  getOrderStats,
} from "../controllers/order.controller.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - customer_name
 *         - phone_number
 *         - shipping_address
 *         - total_price
 *       properties:
 *         _id:
 *           type: string
 *           description: Order ID
 *         user_id:
 *           type: string
 *           description: User ID who placed the order
 *         customer_name:
 *           type: string
 *           description: Name of the customer receiving the order
 *         phone_number:
 *           type: string
 *           description: Phone number for delivery
 *         shipping_address:
 *           type: string
 *           description: Delivery address
 *         note:
 *           type: string
 *           description: Additional notes for the order
 *         total_price:
 *           type: number
 *           description: Total price of the order
 *         payment_method:
 *           type: string
 *           enum: [COD, banking, credit_card]
 *           description: Payment method
 *         payment_status:
 *           type: string
 *           enum: [unpaid, paid, refunded]
 *           description: Payment status
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipping, completed, canceled]
 *           description: Order status
 *         tracking_code:
 *           type: string
 *           description: Shipping tracking code
 *         canceled_reason:
 *           type: string
 *           description: Reason for cancellation
 *         canceled_at:
 *           type: string
 *           format: date-time
 *           description: Cancellation timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrderItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         order_id:
 *           type: string
 *         product_id:
 *           type: string
 *         variant_id:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *         product_name:
 *           type: string
 *           description: Snapshot of product name
 *         variant_color:
 *           type: string
 *           description: Snapshot of variant color
 *         variant_storage:
 *           type: string
 *           description: Snapshot of variant storage
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order (Checkout)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_name
 *               - phone_number
 *               - shipping_address
 *             properties:
 *               customer_name:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               phone_number:
 *                 type: string
 *                 example: "0901234567"
 *               shipping_address:
 *                 type: string
 *                 example: "123 Le Loi, District 1, Ho Chi Minh City"
 *               payment_method:
 *                 type: string
 *                 enum: [COD, banking, credit_card]
 *                 default: COD
 *               note:
 *                 type: string
 *                 example: "Please call before delivery"
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error or cart is empty
 *       401:
 *         description: Not authenticated
 */
router.post(
  "/",
  protect,
  [
    body("customer_name")
      .trim()
      .notEmpty()
      .withMessage("Customer name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Customer name must be between 2 and 100 characters"),
    body("phone_number")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Phone number must be 10-11 digits"),
    body("shipping_address")
      .trim()
      .notEmpty()
      .withMessage("Shipping address is required")
      .isLength({ min: 10, max: 500 })
      .withMessage("Shipping address must be between 10 and 500 characters"),
    body("payment_method")
      .optional()
      .isIn(["COD", "banking", "credit_card"])
      .withMessage("Invalid payment method"),
    body("note")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Note must not exceed 500 characters"),
  ],
  createOrder
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for logged-in user
 *     tags: [Orders]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipping, completed, canceled]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [unpaid, paid, refunded]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Not authenticated
 */
router.get("/", protect, getUserOrders);

/**
 * @swagger
 * /api/orders/admin/stats:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get("/admin/stats", protect, authorize("admin"), getOrderStats);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipping, completed, canceled]
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [unpaid, paid, refunded]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
router.get("/admin/all", protect, authorize("admin"), getAllOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get single order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to view this order
 *       404:
 *         description: Order not found
 */
router.get("/:orderId", protect, getOrderById);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   put:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               canceled_reason:
 *                 type: string
 *                 example: "Changed my mind"
 *     responses:
 *       200:
 *         description: Order canceled successfully
 *       400:
 *         description: Cannot cancel order (already canceled, completed, or shipping)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to cancel this order
 *       404:
 *         description: Order not found
 */
router.put(
  "/:orderId/cancel",
  protect,
  [
    body("canceled_reason")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Canceled reason must not exceed 500 characters"),
  ],
  cancelOrder
);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipping, completed, canceled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status or cannot update canceled order
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Order not found
 */
router.put(
  "/:orderId/status",
  protect,
  authorize("admin"),
  [
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .isIn(["pending", "confirmed", "shipping", "completed", "canceled"])
      .withMessage("Invalid status value"),
  ],
  updateOrderStatus
);

/**
 * @swagger
 * /api/orders/{orderId}/payment:
 *   put:
 *     summary: Update payment status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_status
 *             properties:
 *               payment_status:
 *                 type: string
 *                 enum: [unpaid, paid, refunded]
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Order not found
 */
router.put(
  "/:orderId/payment",
  protect,
  authorize("admin"),
  [
    body("payment_status")
      .notEmpty()
      .withMessage("Payment status is required")
      .isIn(["unpaid", "paid", "refunded"])
      .withMessage("Invalid payment status value"),
  ],
  updatePaymentStatus
);

/**
 * @swagger
 * /api/orders/{orderId}/tracking:
 *   put:
 *     summary: Update tracking code (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tracking_code
 *             properties:
 *               tracking_code:
 *                 type: string
 *                 example: "VN123456789"
 *     responses:
 *       200:
 *         description: Tracking code updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Order not found
 */
router.put(
  "/:orderId/tracking",
  protect,
  authorize("admin"),
  [
    body("tracking_code")
      .trim()
      .notEmpty()
      .withMessage("Tracking code is required")
      .isLength({ min: 5, max: 50 })
      .withMessage("Tracking code must be between 5 and 50 characters"),
  ],
  updateTrackingCode
);

export default router;
