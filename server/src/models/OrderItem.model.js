import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Please provide an order"],
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
    },
    price: {
      type: Number,
      required: [true, "Please provide price"],
      min: [0, "Price cannot be negative"],
    },
    // Lưu thông tin snapshot tại thời điểm đặt hàng (để tránh mất data khi variant bị xóa/sửa)
    product_name: {
      type: String,
      trim: true,
    },
    variant_color: {
      type: String,
      trim: true,
    },
    variant_storage: {
      type: String,
      trim: true,
    },
    // Đánh dấu đã nhắc nhở review (đã mở popup review)
    is_review_prompted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ product_id: 1 });
orderItemSchema.index({ variant_id: 1 });

export default mongoose.model("OrderItem", orderItemSchema);
