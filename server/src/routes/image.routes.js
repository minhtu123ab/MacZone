import express from "express";
import {
  getImage,
  updateImage,
  deleteImage,
} from "../controllers/productImage.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { body } from "express-validator";

const router = express.Router();

/**
 * @swagger
 * /api/images/{id}:
 *   get:
 *     summary: Get single image by ID
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image details
 *       404:
 *         description: Image not found
 */
router.get("/:id", getImage);

/**
 * @swagger
 * /api/images/{id}:
 *   put:
 *     summary: Update image (Admin only)
 *     tags: [Product Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image_url:
 *                 type: string
 *                 example: "https://images.unsplash.com/photo-1234567890?w=800"
 *               display_order:
 *                 type: number
 *                 example: 2
 *               alt_text:
 *                 type: string
 *                 example: "iPhone 15 Pro back view"
 *     responses:
 *       200:
 *         description: Image updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    body("image_url")
      .optional()
      .isURL()
      .withMessage("Please provide a valid URL"),
    body("display_order")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order must be a positive number"),
    body("alt_text").optional().trim(),
  ],
  updateImage
);

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete image (Admin only)
 *     tags: [Product Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 */
router.delete("/:id", protect, authorize("admin"), deleteImage);

export default router;
