import { validationResult } from "express-validator";
import { Cart, CartItem, Product, ProductVariant } from "../models/index.js";

// @desc    Get user's cart with all items
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    // Find or create cart for user
    let cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ user_id: req.user._id });
      return res.status(200).json({
        success: true,
        data: {
          cart_id: cart._id,
          items: [],
          total_items: 0,
          total_price: 0,
        },
      });
    }

    // Get all cart items with product and variant details
    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate({
        path: "product_id",
        select: "name description thumbnail_url category_id is_active",
        populate: {
          path: "category_id",
          select: "name",
        },
      })
      .populate({
        path: "variant_id",
        select: "color storage price stock image_url is_active",
      })
      .sort("-createdAt");

    // Filter out items with inactive products or variants
    const activeItems = cartItems.filter(
      (item) =>
        item.product_id &&
        item.variant_id &&
        item.product_id.is_active &&
        item.variant_id.is_active
    );

    // Remove inactive items from cart
    const inactiveItemIds = cartItems
      .filter(
        (item) =>
          !item.product_id ||
          !item.variant_id ||
          !item.product_id.is_active ||
          !item.variant_id.is_active
      )
      .map((item) => item._id);

    if (inactiveItemIds.length > 0) {
      await CartItem.deleteMany({ _id: { $in: inactiveItemIds } });
    }

    // Calculate totals
    const total_items = activeItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const total_price = activeItems.reduce(
      (sum, item) => sum + item.variant_id.price * item.quantity,
      0
    );

    // Format response
    const formattedItems = activeItems.map((item) => ({
      _id: item._id,
      product: {
        _id: item.product_id._id,
        name: item.product_id.name,
        description: item.product_id.description,
        thumbnail_url: item.product_id.thumbnail_url,
        category: item.product_id.category_id
          ? {
              _id: item.product_id.category_id._id,
              name: item.product_id.category_id.name,
            }
          : null,
      },
      variant: {
        _id: item.variant_id._id,
        color: item.variant_id.color,
        storage: item.variant_id.storage,
        price: item.variant_id.price,
        stock: item.variant_id.stock,
        image_url: item.variant_id.image_url,
      },
      quantity: item.quantity,
      subtotal: item.variant_id.price * item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        cart_id: cart._id,
        items: formattedItems,
        total_items,
        total_price,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { product_id, variant_id, quantity = 1 } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      });
    }

    // Check if variant exists and is active
    const variant = await ProductVariant.findById(variant_id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    if (!variant.is_active) {
      return res.status(400).json({
        success: false,
        message: "Product variant is not available",
      });
    }

    // Check if variant belongs to the product
    if (variant.product_id.toString() !== product_id) {
      return res.status(400).json({
        success: false,
        message: "Variant does not belong to the specified product",
      });
    }

    // Check stock availability
    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock} items available in stock`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user._id });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      cart_id: cart._id,
      variant_id,
    });

    if (cartItem) {
      // Update quantity if item exists
      const newQuantity = cartItem.quantity + quantity;

      // Check stock for new quantity
      if (variant.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${variant.stock} items available in stock`,
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        cart_id: cart._id,
        product_id,
        variant_id,
        quantity,
      });
    }

    // Populate cart item details
    await cartItem.populate([
      {
        path: "product_id",
        select: "name description thumbnail_url category_id",
        populate: {
          path: "category_id",
          select: "name",
        },
      },
      {
        path: "variant_id",
        select: "color storage price stock image_url",
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: {
        _id: cartItem._id,
        product: {
          _id: cartItem.product_id._id,
          name: cartItem.product_id.name,
          description: cartItem.product_id.description,
          thumbnail_url: cartItem.product_id.thumbnail_url,
          category: cartItem.product_id.category_id
            ? {
                _id: cartItem.product_id.category_id._id,
                name: cartItem.product_id.category_id.name,
              }
            : null,
        },
        variant: {
          _id: cartItem.variant_id._id,
          color: cartItem.variant_id.color,
          storage: cartItem.variant_id.storage,
          price: cartItem.variant_id.price,
          stock: cartItem.variant_id.stock,
          image_url: cartItem.variant_id.image_url,
        },
        quantity: cartItem.quantity,
        subtotal: cartItem.variant_id.price * cartItem.quantity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { quantity } = req.body;

    // Find cart item
    const cartItem = await CartItem.findById(req.params.itemId).populate(
      "variant_id"
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Verify cart belongs to user
    const cart = await Cart.findOne({
      _id: cartItem.cart_id,
      user_id: req.user._id,
    });

    if (!cart) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this cart item",
      });
    }

    // Check stock availability
    if (cartItem.variant_id.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${cartItem.variant_id.stock} items available in stock`,
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    // Populate full details
    await cartItem.populate([
      {
        path: "product_id",
        select: "name description thumbnail_url category_id",
        populate: {
          path: "category_id",
          select: "name",
        },
      },
      {
        path: "variant_id",
        select: "color storage price stock image_url",
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: {
        _id: cartItem._id,
        product: {
          _id: cartItem.product_id._id,
          name: cartItem.product_id.name,
          description: cartItem.product_id.description,
          thumbnail_url: cartItem.product_id.thumbnail_url,
          category: cartItem.product_id.category_id
            ? {
                _id: cartItem.product_id.category_id._id,
                name: cartItem.product_id.category_id.name,
              }
            : null,
        },
        variant: {
          _id: cartItem.variant_id._id,
          color: cartItem.variant_id.color,
          storage: cartItem.variant_id.storage,
          price: cartItem.variant_id.price,
          stock: cartItem.variant_id.stock,
          image_url: cartItem.variant_id.image_url,
        },
        quantity: cartItem.quantity,
        subtotal: cartItem.variant_id.price * cartItem.quantity,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    // Find cart item
    const cartItem = await CartItem.findById(req.params.itemId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Verify cart belongs to user
    const cart = await Cart.findOne({
      _id: cartItem.cart_id,
      user_id: req.user._id,
    });

    if (!cart) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove this cart item",
      });
    }

    // Delete cart item
    await cartItem.deleteOne();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }
    next(error);
  }
};

// @desc    Clear all items from cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Delete all cart items
    await CartItem.deleteMany({ cart_id: cart._id });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
export const getCartCount = async (req, res, next) => {
  try {
    // Find user's cart
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          count: 0,
        },
      });
    }

    // Count cart items
    const cartItems = await CartItem.find({ cart_id: cart._id }).populate(
      "variant_id product_id"
    );

    // Filter active items only
    const activeItems = cartItems.filter(
      (item) =>
        item.product_id &&
        item.variant_id &&
        item.product_id.is_active &&
        item.variant_id.is_active
    );

    const count = activeItems.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};
