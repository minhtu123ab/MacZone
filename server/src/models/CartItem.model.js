import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: [true, "Please provide a cart"],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide a product"],
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: [true, "Please provide a product variant"],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide quantity"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
cartItemSchema.index({ cart_id: 1 });
cartItemSchema.index({ product_id: 1 });
cartItemSchema.index({ variant_id: 1 });

// Compound index to ensure one variant per cart
cartItemSchema.index({ cart_id: 1, variant_id: 1 }, { unique: true });

export default mongoose.model("CartItem", cartItemSchema);
