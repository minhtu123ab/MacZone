import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductStats,
  getAllProductsAdmin,
  getTopSellingProducts,
  getLowStockProducts,
  compareProducts,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createProductValidation,
  updateProductValidation,
} from "../middleware/validator.middleware.js";

const router = express.Router();

// ========== ADMIN STATS ROUTE (must be before /:id route) ==========

/**
 * @swagger
 * /api/products/admin/stats:
 *   get:
 *     summary: Get product statistics (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get("/admin/stats", protect, authorize("admin"), getProductStats);

/**
 * @swagger
 * /api/products/admin/top-selling:
 *   get:
 *     summary: Get top selling products (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top products to return
 *     responses:
 *       200:
 *         description: Top selling products retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/admin/top-selling",
  protect,
  authorize("admin"),
  getTopSellingProducts
);

/**
 * @swagger
 * /api/products/admin/low-stock:
 *   get:
 *     summary: Get low stock products alert (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Stock threshold for low stock alert
 *     responses:
 *       200:
 *         description: Low stock products retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/admin/low-stock",
  protect,
  authorize("admin"),
  getLowStockProducts
);

/**
 * @swagger
 * /api/products/admin/all:
 *   get:
 *     summary: Get all products for admin (with filters, no default active filter)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: ['true', 'false', '']
 *         description: Filter by active status (empty string shows all)
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/admin/all", protect, authorize("admin"), getAllProductsAdmin);

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filters
 *     description: Get products with optional filters, search, sorting and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product name and description
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort by field (prefix with - for descending)
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
 *           default: 12
 *         description: Items per page
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/products/compare:
 *   post:
 *     summary: Compare multiple products
 *     description: Get full details of multiple products for comparison (max 2)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 description: Array of product IDs to compare (max 2)
 *     responses:
 *       200:
 *         description: Products comparison data retrieved successfully
 *       400:
 *         description: Invalid request or products from different categories
 *       404:
 *         description: Products not found
 */
router.post("/compare", compareProducts);

/**
 * @swagger
 * /api/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     description: Get all products in a specific category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort by field
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get("/category/:categoryId", getProductsByCategory);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     description: Get product details with variants
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProduct);

// ========== ADMIN ROUTES ==========

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     description: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: iPhone 15 Pro Max
 *               description:
 *                 type: string
 *                 example: The most powerful iPhone ever with A17 Pro chip
 *               category_id:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               thumbnail_url:
 *                 type: string
 *                 example: https://example.com/iphone-15-pro-max.jpg
 *               specifications:
 *                 type: object
 *                 example: {"Chip": "A17 Pro", "RAM": "8GB", "Display": "6.7 inch"}
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Category not found
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  createProductValidation,
  createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     description: Update an existing product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: string
 *               thumbnail_url:
 *                 type: string
 *               specifications:
 *                 type: object
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateProductValidation,
  updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Delete a product (Admin only). Cannot delete if product has variants.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Cannot delete product with variants
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Product not found
 */
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
