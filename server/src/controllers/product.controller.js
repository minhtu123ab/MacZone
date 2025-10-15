import { validationResult } from "express-validator";
import {
  Product,
  ProductVariant,
  Category,
  ProductImage,
} from "../models/index.js";

// Helper function to convert Map specifications to plain object
const convertSpecifications = (product) => {
  if (product.specifications instanceof Map) {
    product.specifications = Object.fromEntries(product.specifications);
  }
  return product;
};

// @desc    Get all products with filters, search, sort, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      sort = "-createdAt",
      page = 1,
      limit = 12,
      is_active,
    } = req.query;

    // Build filter object
    const filter = {};

    // Filter by active status (default to true for public)
    if (is_active !== undefined && is_active !== "") {
      filter.is_active = is_active === "true";
    } else {
      filter.is_active = true; // Default: only show active products
    }

    // Filter by category
    if (category) {
      filter.category_id = category;
    }

    // Search by name only (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .populate("category_id", "name description")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for plain JS objects

    // Convert specifications Map to object for each product
    products.forEach(convertSpecifications);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products for admin (with filters, no default active filter)
// @route   GET /api/products/admin/all
// @access  Private/Admin
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const {
      category,
      search,
      sort = "-createdAt",
      page = 1,
      limit = 10,
      is_active,
    } = req.query;

    // Build filter object
    const filter = {};

    // Filter by active status (only if explicitly provided)
    if (is_active !== undefined && is_active !== "") {
      filter.is_active = is_active === "true";
    }

    // Filter by category
    if (category) {
      filter.category_id = category;
    }

    // Search by name only (case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .populate("category_id", "name description")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for plain JS objects

    // Convert specifications Map to object for each product
    products.forEach(convertSpecifications);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID with variants and images
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_id",
      "name description image"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get product variants
    const variants = await ProductVariant.find({
      product_id: req.params.id,
      is_active: true,
    }).sort("price");

    // Get product images
    const images = await ProductImage.find({
      product_id: req.params.id,
    }).sort("display_order");

    // Convert product to plain object and handle Map conversion
    const productObj = product.toObject();
    convertSpecifications(productObj);

    res.status(200).json({
      success: true,
      data: {
        ...productObj,
        variants,
        images,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, description, category_id, thumbnail_url, specifications } =
      req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      category_id,
      thumbnail_url,
      specifications: specifications || {},
    });

    // Populate category
    await product.populate("category_id", "name description");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      description,
      category_id,
      thumbnail_url,
      specifications,
      is_active,
    } = req.body;

    // Check if product exists
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if category exists (if updating category)
    if (category_id && category_id !== product.category_id.toString()) {
      const categoryExists = await Category.findById(category_id);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (specifications !== undefined)
      updateData.specifications = specifications;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update product
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category_id", "name description");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product has variants
    const variantCount = await ProductVariant.countDocuments({
      product_id: req.params.id,
    });

    if (variantCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product. It has ${variantCount} variant(s). Please delete variants first.`,
      });
    }

    // Delete product images
    await ProductImage.deleteMany({ product_id: req.params.id });

    // Delete product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { sort = "-createdAt", limit = 12 } = req.query;

    // Check if category exists
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get products
    const products = await Product.find({
      category_id: req.params.categoryId,
      is_active: true,
    })
      .populate("category_id", "name description")
      .sort(sort)
      .limit(parseInt(limit))
      .lean(); // Use lean() for plain JS objects

    // Convert specifications Map to object for each product
    products.forEach(convertSpecifications);

    res.status(200).json({
      success: true,
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
      },
      count: products.length,
      data: products,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    next(error);
  }
};

// @desc    Get product statistics (Admin dashboard)
// @route   GET /api/products/admin/stats
// @access  Private/Admin
export const getProductStats = async (req, res, next) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Active products
    const activeProducts = await Product.countDocuments({ is_active: true });

    // Products by category
    const productsByCategory = await Product.aggregate([
      { $group: { _id: "$category_id", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          name: "$category.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        productsByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products (Admin dashboard)
// @route   GET /api/products/admin/top-selling
// @access  Private/Admin
export const getTopSellingProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Import OrderItem model
    const { OrderItem } = await import("../models/index.js");

    // Get top selling products by quantity sold
    const topProducts = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      // Only count completed orders
      { $match: { "order.status": "completed" } },
      {
        $group: {
          _id: "$product_id",
          totalQuantitySold: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          name: "$product.name",
          thumbnail_url: "$product.thumbnail_url",
          category_id: "$product.category_id",
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: topProducts.length,
      data: topProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products (Admin dashboard alert)
// @route   GET /api/products/admin/low-stock
// @access  Private/Admin
export const getLowStockProducts = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    // Get variants with low stock
    const lowStockVariants = await ProductVariant.find({
      stock: { $lte: threshold, $gt: 0 },
      is_active: true,
    })
      .populate({
        path: "product_id",
        select: "name thumbnail_url category_id",
      })
      .sort("stock")
      .limit(20);

    // Get out of stock variants
    const outOfStockVariants = await ProductVariant.find({
      stock: 0,
      is_active: true,
    })
      .populate({
        path: "product_id",
        select: "name thumbnail_url category_id",
      })
      .limit(20);

    // Format response
    const lowStockItems = lowStockVariants.map((variant) => ({
      _id: variant._id,
      product: {
        _id: variant.product_id._id,
        name: variant.product_id.name,
        thumbnail_url: variant.product_id.thumbnail_url,
      },
      variant: {
        color: variant.color,
        storage: variant.storage,
        price: variant.price,
      },
      stock: variant.stock,
      status: "low_stock",
    }));

    const outOfStockItems = outOfStockVariants.map((variant) => ({
      _id: variant._id,
      product: {
        _id: variant.product_id._id,
        name: variant.product_id.name,
        thumbnail_url: variant.product_id.thumbnail_url,
      },
      variant: {
        color: variant.color,
        storage: variant.storage,
        price: variant.price,
      },
      stock: variant.stock,
      status: "out_of_stock",
    }));

    res.status(200).json({
      success: true,
      data: {
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
