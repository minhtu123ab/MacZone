import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide a product"],
    },
    // Variant attributes
    color: {
      type: String,
      trim: true,
    },
    storage: {
      type: String,
      trim: true,
    },
    // Giá và tồn kho riêng cho từng variant
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    // SKU - Mã sản phẩm unique
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Cho phép null nhưng unique khi có giá trị
    },
    // Thông số kỹ thuật bổ sung riêng cho variant (nếu khác product chính)
    additional_specs: {
      type: Map,
      of: String,
      default: {},
    },
    // Image riêng cho variant này (nếu có)
    image_url: {
      type: String,
      trim: true,
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

// Index for queries
productVariantSchema.index({ product_id: 1 });
productVariantSchema.index({ color: 1 });
productVariantSchema.index({ storage: 1 });
productVariantSchema.index({ price: 1 });
productVariantSchema.index({ is_active: 1 });

// Compound index để tránh duplicate variants
productVariantSchema.index(
  { product_id: 1, color: 1, storage: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("ProductVariant", productVariantSchema);
