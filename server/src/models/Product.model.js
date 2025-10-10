import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide a category"],
    },
    thumbnail_url: {
      type: String,
      trim: true,
    },
    // Specifications - Thông số kỹ thuật (chip, RAM, màn hình, pin, etc.)
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    // Rating cache để tránh query Review table mỗi lần
    average_rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot be more than 5"],
    },
    review_count: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    // Status
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and filter
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category_id: 1 });
productSchema.index({ is_active: 1 });

export default mongoose.model("Product", productSchema);
