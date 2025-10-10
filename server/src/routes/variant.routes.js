import express from "express";
import {
  getVariant,
  updateVariant,
  deleteVariant,
  updateVariantStock,
} from "../controllers/productVariant.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { updateVariantValidation } from "../middleware/validator.middleware.js";

const router = express.Router();

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/variants/{id}:
 *   get:
 *     summary: Get single variant by ID
 *     description: Get variant details with product info
 *     tags: [Product Variants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant retrieved successfully
 *       404:
 *         description: Variant not found
 */
router.get("/:id", getVariant);

// ========== ADMIN ROUTES ==========

/**
 * @swagger
 * /api/variants/{id}:
 *   put:
 *     summary: Update variant
 *     description: Update an existing variant (Admin only)
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               color:
 *                 type: string
 *               storage:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               sku:
 *                 type: string
 *               image_url:
 *                 type: string
 *               additional_specs:
 *                 type: object
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Variant updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Variant not found
 */
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateVariantValidation,
  updateVariant
);

/**
 * @swagger
 * /api/variants/{id}:
 *   delete:
 *     summary: Delete variant
 *     description: Delete a variant (Admin only)
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     responses:
 *       200:
 *         description: Variant deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Variant not found
 */
router.delete("/:id", protect, authorize("admin"), deleteVariant);

/**
 * @swagger
 * /api/variants/{id}/stock:
 *   patch:
 *     summary: Update variant stock
 *     description: Update stock quantity for a variant (Admin only)
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: number
 *                 minimum: 0
 *                 example: 50
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Invalid stock value
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Variant not found
 */
router.patch("/:id/stock", protect, authorize("admin"), updateVariantStock);

export default router;
