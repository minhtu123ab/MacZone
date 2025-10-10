import express from "express";
import {
  getProductImages,
  addProductImage,
} from "../controllers/productImage.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { body } from "express-validator";

const router = express.Router({ mergeParams: true }); // mergeParams để access :productId

/**
 * @swagger
 * /api/products/{productId}/images:
 *   get:
 *     summary: Get all images of a product
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of product images
 *       404:
 *         description: Product not found
 */
router.get("/", getProductImages);

/**
 * @swagger
 * /api/products/{productId}/images:
 *   post:
 *     summary: Add new image to product (Admin only)
 *     tags: [Product Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image_url
 *             properties:
 *               image_url:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1234567890?w=800"
 *               display_order:
 *                 type: number
 *                 example: 1
 *               alt_text:
 *                 type: string
 *                 example: "iPhone 15 Pro front view"
 *     responses:
 *       201:
 *         description: Image added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("image_url")
      .notEmpty()
      .withMessage("Image URL is required")
      .isURL()
      .withMessage("Please provide a valid URL"),
    body("display_order")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order must be a positive number"),
    body("alt_text").optional().trim(),
  ],
  addProductImage
);

export default router;
