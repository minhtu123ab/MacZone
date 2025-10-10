import { validationResult } from "express-validator";
import { Product, ProductImage } from "../models/index.js";

// @desc    Get all images of a product
// @route   GET /api/products/:productId/images
// @access  Public
export const getProductImages = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get images
    const images = await ProductImage.find({ product_id: productId }).sort(
      "display_order"
    );

    res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
      },
      count: images.length,
      data: images,
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

// @desc    Get single image by ID
// @route   GET /api/images/:id
// @access  Public
export const getImage = async (req, res, next) => {
  try {
    const image = await ProductImage.findById(req.params.id).populate(
      "product_id",
      "name"
    );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    next(error);
  }
};

// @desc    Add new image to product
// @route   POST /api/products/:productId/images
// @access  Private/Admin
export const addProductImage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { productId } = req.params;
    const { image_url, display_order, alt_text } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Create image
    const image = await ProductImage.create({
      product_id: productId,
      image_url,
      display_order: display_order || 0,
      alt_text,
    });

    res.status(201).json({
      success: true,
      message: "Image added successfully",
      data: image,
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

// @desc    Update image
// @route   PUT /api/images/:id
// @access  Private/Admin
export const updateImage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { image_url, display_order, alt_text } = req.body;

    // Check if image exists
    let image = await ProductImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Prepare update object
    const updateData = {};
    if (image_url !== undefined) updateData.image_url = image_url;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (alt_text !== undefined) updateData.alt_text = alt_text;

    // Update image
    image = await ProductImage.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("product_id", "name");

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: image,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    next(error);
  }
};

// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Private/Admin
export const deleteImage = async (req, res, next) => {
  try {
    const image = await ProductImage.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    await image.deleteOne();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    next(error);
  }
};
