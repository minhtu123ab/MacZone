import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  addToCartValidation,
  updateCartItemValidation,
} from "../middleware/validator.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Get current user's shopping cart with all items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart_id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           product:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               thumbnail_url:
 *                                 type: string
 *                               category:
 *                                 type: object
 *                           variant:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               color:
 *                                 type: string
 *                               storage:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                               stock:
 *                                 type: number
 *                               image_url:
 *                                 type: string
 *                           quantity:
 *                             type: number
 *                           subtotal:
 *                             type: number
 *                     total_items:
 *                       type: number
 *                       example: 5
 *                     total_price:
 *                       type: number
 *                       example: 50000000
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", getCart);

/**
 * @swagger
 * /api/cart/count:
 *   get:
 *     summary: Get cart item count
 *     description: Get total number of items in user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/count", getCartCount);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product variant to the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - variant_id
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *                 description: Product ID
 *               variant_id:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *                 description: Product variant ID
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 default: 1
 *                 example: 1
 *                 description: Quantity to add
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Item added to cart successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Product or variant not found
 */
router.post("/", addToCartValidation, addToCart);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 2
 *                 description: New quantity
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cart item updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to update this cart item
 *       404:
 *         description: Cart item not found
 */
router.put("/:itemId", updateCartItemValidation, updateCartItem);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Item removed from cart successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized to remove this cart item
 *       404:
 *         description: Cart item not found
 */
router.delete("/:itemId", removeCartItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Cart not found
 */
router.delete("/", clearCart);

export default router;
