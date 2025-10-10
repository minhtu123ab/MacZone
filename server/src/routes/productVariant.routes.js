import express from "express";
import {
  getProductVariants,
  getVariant,
  createVariant,
  updateVariant,
  deleteVariant,
  updateVariantStock,
} from "../controllers/productVariant.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createVariantValidation,
  updateVariantValidation,
} from "../middleware/validator.middleware.js";

const router = express.Router({ mergeParams: true });

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/products/{productId}/variants:
 *   get:
 *     summary: Get all variants of a product
 *     description: Get all color and storage variants for a specific product
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Variants retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/", getProductVariants);

// ========== ADMIN ROUTES ==========

/**
 * @swagger
 * /api/products/{productId}/variants:
 *   post:
 *     summary: Create new variant
 *     description: Create a new variant for a product (Admin only)
 *     tags: [Product Variants]
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
 *               - price
 *             properties:
 *               color:
 *                 type: string
 *                 example: Titan Blue
 *               storage:
 *                 type: string
 *                 example: 256GB
 *               price:
 *                 type: number
 *                 example: 32990000
 *               stock:
 *                 type: number
 *                 example: 15
 *               sku:
 *                 type: string
 *                 example: IP15PM-256-TB
 *               image_url:
 *                 type: string
 *                 example: https://example.com/iphone-15-pro-max-blue.jpg
 *               additional_specs:
 *                 type: object
 *                 example: {}
 *     responses:
 *       201:
 *         description: Variant created successfully
 *       400:
 *         description: Validation error or duplicate variant
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Product not found
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  createVariantValidation,
  createVariant
);

export default router;
