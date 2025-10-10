import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    total_price: {
      type: Number,
      required: [true, "Please provide total price"],
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "canceled"],
      default: "pending",
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    shipping_address: {
      type: String,
      required: [true, "Please provide shipping address"],
      trim: true,
    },
    tracking_code: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ tracking_code: 1 });

export default mongoose.model("Order", orderSchema);
