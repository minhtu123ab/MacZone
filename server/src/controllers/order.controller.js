import { validationResult } from "express-validator";
import {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  User,
} from "../models/index.js";
import {
  sendOrderConfirmationEmail,
  sendOrderCompletedEmail,
} from "../utils/emailService.js";

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      customer_name,
      phone_number,
      shipping_address,
      payment_method = "COD",
      note = "",
      transfer_reference = "",
    } = req.body;

    // Find user's cart
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Get all cart items with product and variant details
    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate("product_id")
      .populate("variant_id");

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate all items are active and have sufficient stock
    const validationErrors = [];
    for (const item of cartItems) {
      if (!item.product_id || !item.product_id.is_active) {
        validationErrors.push(
          `Product ${item.product_id?.name || "Unknown"} is no longer available`
        );
        continue;
      }

      if (!item.variant_id || !item.variant_id.is_active) {
        validationErrors.push(
          `Variant for ${item.product_id.name} is no longer available`
        );
        continue;
      }

      if (item.variant_id.stock < item.quantity) {
        validationErrors.push(
          `Insufficient stock for ${item.product_id.name} (${item.variant_id.color} - ${item.variant_id.storage}). Only ${item.variant_id.stock} available`
        );
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot create order",
        errors: validationErrors,
      });
    }

    // Calculate total price
    const total_price = cartItems.reduce(
      (sum, item) => sum + item.variant_id.price * item.quantity,
      0
    );

    // Create order
    const order = await Order.create({
      user_id: req.user._id,
      customer_name,
      phone_number,
      shipping_address,
      payment_method,
      note,
      total_price,
      transfer_reference: transfer_reference || undefined,
      status: "pending",
      payment_status: payment_method === "COD" ? "unpaid" : "unpaid",
    });

    // Create order items and update stock
    const orderItemsData = [];
    for (const item of cartItems) {
      // Create order item with snapshot data
      const orderItem = await OrderItem.create({
        order_id: order._id,
        product_id: item.product_id._id,
        variant_id: item.variant_id._id,
        quantity: item.quantity,
        price: item.variant_id.price,
        product_name: item.product_id.name,
        variant_color: item.variant_id.color,
        variant_storage: item.variant_id.storage,
      });

      // Reduce stock
      item.variant_id.stock -= item.quantity;
      await item.variant_id.save();

      orderItemsData.push(orderItem);
    }

    // Clear cart after successful order
    await CartItem.deleteMany({ cart_id: cart._id });

    // Populate order details
    const populatedOrder = await Order.findById(order._id).populate({
      path: "user_id",
      select: "full_name email phone_number",
    });

    // Get order items
    const populatedOrderItems = await OrderItem.find({
      order_id: order._id,
    })
      .populate({
        path: "product_id",
        select: "name thumbnail_url",
      })
      .populate({
        path: "variant_id",
        select: "color storage image_url",
      });

    // Send order confirmation email (async, don't wait for it)
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        // Send email without blocking response
        sendOrderConfirmationEmail(user, populatedOrder, populatedOrderItems)
          .then((result) => {
            if (result.success) {
              console.log(
                `📧 Order confirmation email queued for ${user.email}`
              );
            }
          })
          .catch((err) => {
            console.error("Email error:", err);
          });
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order: {
          _id: populatedOrder._id,
          customer_name: populatedOrder.customer_name,
          phone_number: populatedOrder.phone_number,
          shipping_address: populatedOrder.shipping_address,
          payment_method: populatedOrder.payment_method,
          payment_status: populatedOrder.payment_status,
          status: populatedOrder.status,
          total_price: populatedOrder.total_price,
          note: populatedOrder.note,
          createdAt: populatedOrder.createdAt,
        },
        items: populatedOrderItems.map((item) => ({
          _id: item._id,
          product: {
            _id: item.product_id?._id,
            name: item.product_name,
            thumbnail_url: item.product_id?.thumbnail_url,
          },
          variant: {
            _id: item.variant_id?._id,
            color: item.variant_color,
            storage: item.variant_storage,
            image_url: item.variant_id?.image_url,
          },
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for logged-in user
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      payment_status,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = { user_id: req.user._id };

    if (status) {
      query.status = status;
    }

    if (payment_status) {
      query.payment_status = payment_status;
    }

    // Execute query with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    // Get total count
    const count = await Order.countDocuments(query);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id })
          .populate({
            path: "product_id",
            select: "name thumbnail_url",
          })
          .populate({
            path: "variant_id",
            select: "color storage image_url",
          })
          .select("-__v");

        return {
          _id: order._id,
          customer_name: order.customer_name,
          phone_number: order.phone_number,
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          status: order.status,
          total_price: order.total_price,
          tracking_code: order.tracking_code,
          transfer_reference: order.transfer_reference,
          note: order.note,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: items.map((item) => ({
            _id: item._id,
            product: {
              _id: item.product_id?._id,
              name: item.product_name,
              thumbnail_url: item.product_id?.thumbnail_url,
            },
            variant: {
              _id: item.variant_id?._id,
              color: item.variant_color,
              storage: item.variant_storage,
              image_url: item.variant_id?.image_url,
            },
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      data: ordersWithItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate({
      path: "user_id",
      select: "full_name email phone_number",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to user (unless admin)
    if (order.user_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    // Get order items
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate({
        path: "product_id",
        select: "name description thumbnail_url category_id",
      })
      .populate({
        path: "variant_id",
        select: "color storage image_url",
      });

    res.status(200).json({
      success: true,
      data: {
        order: {
          _id: order._id,
          user: {
            _id: order.user_id._id,
            full_name: order.user_id.full_name,
            email: order.user_id.email,
          },
          customer_name: order.customer_name,
          phone_number: order.phone_number,
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          status: order.status,
          total_price: order.total_price,
          tracking_code: order.tracking_code,
          transfer_reference: order.transfer_reference,
          note: order.note,
          canceled_reason: order.canceled_reason,
          canceled_at: order.canceled_at,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
        items: orderItems.map((item) => ({
          _id: item._id,
          product: {
            _id: item.product_id?._id,
            name: item.product_name,
            description: item.product_id?.description,
            thumbnail_url: item.product_id?.thumbnail_url,
          },
          variant: {
            _id: item.variant_id?._id,
            color: item.variant_color,
            storage: item.variant_storage,
            image_url: item.variant_id?.image_url,
          },
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const { canceled_reason } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to user
    if (order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if order can be canceled
    if (order.status === "canceled") {
      return res.status(400).json({
        success: false,
        message: "Order is already canceled",
      });
    }

    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed order",
      });
    }

    if (order.status === "shipping") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order that is being shipped",
      });
    }

    // Get order items to restore stock
    const orderItems = await OrderItem.find({ order_id: order._id }).populate(
      "variant_id"
    );

    // Restore stock
    for (const item of orderItems) {
      if (item.variant_id) {
        item.variant_id.stock += item.quantity;
        await item.variant_id.save();
      }
    }

    // Update order status
    order.status = "canceled";
    order.canceled_reason = canceled_reason || "Canceled by customer";
    order.canceled_at = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
      data: {
        _id: order._id,
        status: order.status,
        canceled_reason: order.canceled_reason,
        canceled_at: order.canceled_at,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    next(error);
  }
};

// @desc    Update order status (Admin only - will add admin middleware later)
// @route   PUT /api/orders/:orderId/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is already canceled
    if (order.status === "canceled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status of canceled order",
      });
    }

    // Update status
    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Send order completed email if status changed to "completed"
    if (status === "completed" && oldStatus !== "completed") {
      try {
        const user = await User.findById(order.user_id);
        if (user && user.email) {
          // Get order items
          const orderItems = await OrderItem.find({ order_id: order._id });

          // Send email without blocking response
          sendOrderCompletedEmail(user, order, orderItems)
            .then((result) => {
              if (result.success) {
                console.log(
                  `📧 Order completed email queued for ${user.email}`
                );
              }
            })
            .catch((err) => {
              console.error("Email error:", err);
            });
        }
      } catch (emailError) {
        console.error("Failed to send order completed email:", emailError);
        // Don't fail the status update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:orderId/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { payment_status } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment status
    order.payment_status = payment_status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        _id: order._id,
        payment_status: order.payment_status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    next(error);
  }
};

// @desc    Update tracking code
// @route   PUT /api/orders/:orderId/tracking
// @access  Private/Admin
export const updateTrackingCode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { tracking_code } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update tracking code
    order.tracking_code = tracking_code;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Tracking code updated successfully",
      data: {
        _id: order._id,
        tracking_code: order.tracking_code,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      payment_status,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (payment_status) {
      query.payment_status = payment_status;
    }

    // Execute query with pagination
    const orders = await Order.find(query)
      .populate({
        path: "user_id",
        select: "full_name email phone_number",
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    // Get total count
    const count = await Order.countDocuments(query);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id })
          .populate({
            path: "product_id",
            select: "name thumbnail_url",
          })
          .populate({
            path: "variant_id",
            select: "color storage image_url",
          })
          .select("-__v");

        return {
          _id: order._id,
          user: order.user_id
            ? {
                _id: order.user_id._id,
                full_name: order.user_id.full_name,
                email: order.user_id.email,
                phone_number: order.user_id.phone_number,
              }
            : null,
          customer_name: order.customer_name,
          phone_number: order.phone_number,
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          status: order.status,
          total_price: order.total_price,
          tracking_code: order.tracking_code,
          transfer_reference: order.transfer_reference,
          note: order.note,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items_count: items.length,
          items: items.map((item) => ({
            _id: item._id,
            product: {
              _id: item.product_id?._id,
              name: item.product_name,
              thumbnail_url: item.product_id?.thumbnail_url,
            },
            variant: {
              _id: item.variant_id?._id,
              color: item.variant_color,
              storage: item.variant_storage,
              image_url: item.variant_id?.image_url,
            },
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      data: ordersWithItems,
    });
  } catch (error) {
    next(error);
  }
};
