import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide a product"],
    },
    image_url: {
      type: String,
      required: [true, "Please provide an image URL"],
      trim: true,
    },
    display_order: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
    },
    alt_text: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productImageSchema.index({ product_id: 1 });
productImageSchema.index({ product_id: 1, display_order: 1 });

export default mongoose.model("ProductImage", productImageSchema);
