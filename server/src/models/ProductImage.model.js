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
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productImageSchema.index({ product_id: 1 });

export default mongoose.model("ProductImage", productImageSchema);
