import { validationResult } from "express-validator";
import { Product, ProductVariant } from "../models/index.js";

// @desc    Get all variants of a product
// @route   GET /api/products/:productId/variants
// @access  Public
export const getProductVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { is_active } = req.query;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Build filter
    const filter = { product_id: productId };
    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    // Get variants
    const variants = await ProductVariant.find(filter)
      .populate("product_id", "name")
      .sort("price");

    res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
      },
      count: variants.length,
      data: variants,
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

// @desc    Get single variant by ID
// @route   GET /api/variants/:id
// @access  Public
export const getVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate(
      "product_id",
      "name description category_id specifications"
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }
    next(error);
  }
};

// @desc    Create new variant for a product
// @route   POST /api/products/:productId/variants
// @access  Private/Admin
export const createVariant = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { productId } = req.params;
    const { color, storage, price, stock, sku, additional_specs, image_url } =
      req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if variant with same color and storage already exists
    if (color && storage) {
      const existingVariant = await ProductVariant.findOne({
        product_id: productId,
        color,
        storage,
      });

      if (existingVariant) {
        return res.status(400).json({
          success: false,
          message: `Variant with color "${color}" and storage "${storage}" already exists`,
        });
      }
    }

    // Check if SKU already exists
    if (sku) {
      const existingSKU = await ProductVariant.findOne({ sku });
      if (existingSKU) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    // Create variant
    const variant = await ProductVariant.create({
      product_id: productId,
      color,
      storage,
      price,
      stock: stock || 0,
      sku,
      additional_specs: additional_specs || {},
      image_url,
    });

    // Populate product info
    await variant.populate("product_id", "name");

    res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: variant,
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

// @desc    Update variant
// @route   PUT /api/variants/:id
// @access  Private/Admin
export const updateVariant = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      color,
      storage,
      price,
      stock,
      sku,
      additional_specs,
      image_url,
      is_active,
    } = req.body;

    // Check if variant exists
    let variant = await ProductVariant.findById(req.params.id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // Check duplicate color + storage (if updating)
    if (color || storage) {
      const checkColor = color || variant.color;
      const checkStorage = storage || variant.storage;

      const duplicate = await ProductVariant.findOne({
        _id: { $ne: req.params.id },
        product_id: variant.product_id,
        color: checkColor,
        storage: checkStorage,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Variant with color "${checkColor}" and storage "${checkStorage}" already exists`,
        });
      }
    }

    // Check duplicate SKU
    if (sku && sku !== variant.sku) {
      const existingSKU = await ProductVariant.findOne({ sku });
      if (existingSKU) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (color !== undefined) updateData.color = color;
    if (storage !== undefined) updateData.storage = storage;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (sku !== undefined) updateData.sku = sku;
    if (additional_specs !== undefined)
      updateData.additional_specs = additional_specs;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update variant
    variant = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("product_id", "name");

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }
    next(error);
  }
};

// @desc    Delete variant
// @route   DELETE /api/variants/:id
// @access  Private/Admin
export const deleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // TODO: Check if variant is in any cart or order before deleting
    // For now, just delete

    await variant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }
    next(error);
  }
};

// @desc    Update variant stock
// @route   PATCH /api/variants/:id/stock
// @access  Private/Admin
export const updateVariantStock = async (req, res, next) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid stock quantity",
      });
    }

    const variant = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true, runValidators: true }
    ).populate("product_id", "name");

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: variant,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }
    next(error);
  }
};
