import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide a product"],
    },
    order_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: [true, "Please provide an order item"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });

// Unique index to ensure one review per order item (also serves as regular index)
reviewSchema.index({ order_item_id: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
