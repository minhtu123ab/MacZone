import { validationResult } from "express-validator";
import { Review, Product, Order, OrderItem } from "../models/index.js";

// @desc    Create review for order item
// @route   POST /api/reviews/order-item/:orderItemId
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { rating, comment } = req.body;
    const { orderItemId } = req.params;

    // Find order item
    const orderItem = await OrderItem.findById(orderItemId).populate(
      "order_id"
    );

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }

    // Check if order belongs to user
    if (orderItem.order_id.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to review this order item",
      });
    }

    // Check if order is completed
    if (orderItem.order_id.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed orders",
      });
    }

    // Check if this order item already has a review
    const existingReview = await Review.findOne({
      order_item_id: orderItemId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "This order item has already been reviewed. You can update or delete the existing review.",
      });
    }

    // Create new review
    const review = await Review.create({
      user_id: req.user._id,
      product_id: orderItem.product_id,
      order_item_id: orderItemId,
      rating,
      comment,
    });

    // Mark order item as prompted (for notification purposes)
    orderItem.is_review_prompted = true;
    await orderItem.save();

    // Update product rating cache
    await updateProductRating(orderItem.product_id);

    // Populate review with user info
    const populatedReview = await Review.findById(review._id).populate({
      path: "user_id",
      select: "full_name",
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        _id: populatedReview._id,
        user: {
          _id: populatedReview.user_id._id,
          full_name: populatedReview.user_id.full_name,
        },
        product_id: populatedReview.product_id,
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        createdAt: populatedReview.createdAt,
        updatedAt: populatedReview.updatedAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Order item not found",
      });
    }
    next(error);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt", rating } = req.query;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Build query
    const query = { product_id: productId };

    if (rating) {
      query.rating = parseInt(rating);
    }

    // Execute query with pagination
    const reviews = await Review.find(query)
      .populate({
        path: "user_id",
        select: "full_name avatar_url",
      })
      .populate({
        path: "order_item_id",
        select: "variant_id",
        populate: {
          path: "variant_id",
          select: "color storage",
        },
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const count = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      data: reviews.map((review) => ({
        _id: review._id,
        user_id: {
          _id: review.user_id._id,
          full_name: review.user_id.full_name,
          avatar_url: review.user_id.avatar_url,
        },
        variant_id: review.order_item_id?.variant_id
          ? {
              _id: review.order_item_id.variant_id._id,
              color: review.order_item_id.variant_id.color,
              storage: review.order_item_id.variant_id.storage,
            }
          : null,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
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

// @desc    Get current user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    // Execute query with pagination
    const reviews = await Review.find({ user_id: req.user._id })
      .populate({
        path: "product_id",
        select: "name thumbnail_url",
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const count = await Review.countDocuments({ user_id: req.user._id });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      data: reviews.map((review) => ({
        _id: review._id,
        order_item_id: review.order_item_id,
        product: {
          _id: review.product_id._id,
          name: review.product_id.name,
          thumbnail_url: review.product_id.thumbnail_url,
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:reviewId
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { rating, comment } = req.body;
    const { reviewId } = req.params;

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if review belongs to user
    if (review.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Update product rating cache if rating changed
    if (rating !== undefined) {
      await updateProductRating(review.product_id);
    }

    // Populate review with user info
    const populatedReview = await Review.findById(review._id).populate({
      path: "user_id",
      select: "full_name",
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: {
        _id: populatedReview._id,
        user: {
          _id: populatedReview.user_id._id,
          full_name: populatedReview.user_id.full_name,
        },
        product_id: populatedReview.product_id,
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        createdAt: populatedReview.createdAt,
        updatedAt: populatedReview.updatedAt,
      },
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (User can delete own review, Admin can delete any review)
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if review belongs to user or user is admin
    if (
      review.user_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    const product_id = review.product_id;
    const order_item_id = review.order_item_id;

    // Delete review
    await review.deleteOne();

    // Reset order item's review prompted status (allow reviewing again)
    await OrderItem.findByIdAndUpdate(order_item_id, {
      is_review_prompted: false,
    });

    // Update product rating cache
    await updateProductRating(product_id);

    res.status(200).json({
      success: true,
      message:
        "Review deleted successfully. You can review this product again.",
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    next(error);
  }
};

// @desc    Get reviewable order items (completed orders, not prompted yet)
// @route   GET /api/reviews/reviewable-items
// @access  Private
export const getReviewableItems = async (req, res, next) => {
  try {
    // Find all completed orders of user
    const completedOrders = await Order.find({
      user_id: req.user._id,
      status: "completed",
    }).select("_id");

    const orderIds = completedOrders.map((order) => order._id);

    // Find order items that haven't been prompted for review
    const reviewableItems = await OrderItem.find({
      order_id: { $in: orderIds },
      is_review_prompted: false,
    })
      .populate({
        path: "product_id",
        select: "name thumbnail_url",
      })
      .populate({
        path: "order_id",
        select: "createdAt",
      })
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviewableItems.length,
      data: reviewableItems.map((item) => ({
        _id: item._id,
        product: {
          _id: item.product_id?._id,
          name: item.product_name,
          thumbnail_url: item.product_id?.thumbnail_url,
        },
        variant: {
          color: item.variant_color,
          storage: item.variant_storage,
        },
        order_date: item.order_id?.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order items as review prompted (when user opens review popup)
// @route   POST /api/reviews/mark-prompted
// @access  Private
export const markReviewPrompted = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { orderItemIds } = req.body;

    // Find order items and verify they belong to user
    const orderItems = await OrderItem.find({
      _id: { $in: orderItemIds },
    }).populate("order_id");

    // Verify all items belong to current user
    const invalidItems = orderItems.filter(
      (item) => item.order_id.user_id.toString() !== req.user._id.toString()
    );

    if (invalidItems.length > 0) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access some of these order items",
      });
    }

    // Update all items to mark as prompted
    await OrderItem.updateMany(
      { _id: { $in: orderItemIds } },
      { is_review_prompted: true }
    );

    res.status(200).json({
      success: true,
      message: "Order items marked as prompted successfully",
      data: {
        updated_count: orderItems.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update product rating cache
async function updateProductRating(productId) {
  try {
    // Get all reviews for the product
    const reviews = await Review.find({ product_id: productId });

    if (reviews.length === 0) {
      // No reviews, reset to 0
      await Product.findByIdAndUpdate(productId, {
        average_rating: 0,
        review_count: 0,
      });
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update product
    await Product.findByIdAndUpdate(productId, {
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      review_count: reviews.length,
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
}

// @desc    Get featured reviews for homepage (top rated + recent)
// @route   GET /api/reviews/featured
// @access  Public
export const getFeaturedReviews = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 3;

    // Try to get 5-star reviews first
    let reviews = await Review.find({ rating: 5 })
      .populate({
        path: "user_id",
        select: "full_name avatar_url role",
      })
      .populate({
        path: "product_id",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    // If not enough 5-star reviews, get highest rated reviews
    if (reviews.length < limit) {
      reviews = await Review.find()
        .populate({
          path: "user_id",
          select: "full_name avatar_url role",
        })
        .populate({
          path: "product_id",
          select: "name",
        })
        .sort({ rating: -1, createdAt: -1 })
        .limit(limit);
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews.map((review) => ({
        _id: review._id,
        user: {
          _id: review.user_id._id,
          full_name: review.user_id.full_name,
          avatar_url: review.user_id.avatar_url,
          role: review.user_id.role,
        },
        product: {
          _id: review.product_id._id,
          name: review.product_id.name,
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rating, sort = "-createdAt" } = req.query;

    // Build query
    const query = {};
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Execute query with pagination
    const reviews = await Review.find(query)
      .populate({
        path: "user_id",
        select: "full_name email",
      })
      .populate({
        path: "product_id",
        select: "name thumbnail_url",
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const count = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page * 1,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
