import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    customer_name: {
      type: String,
      required: [true, "Please provide customer name"],
      trim: true,
    },
    phone_number: {
      type: String,
      required: [true, "Please provide phone number"],
      trim: true,
    },
    shipping_address: {
      type: String,
      required: [true, "Please provide shipping address"],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    total_price: {
      type: Number,
      required: [true, "Please provide total price"],
      min: [0, "Total price cannot be negative"],
    },
    payment_method: {
      type: String,
      enum: ["COD", "banking", "credit_card"],
      default: "COD",
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "canceled"],
      default: "pending",
    },
    tracking_code: {
      type: String,
      trim: true,
    },
    transfer_reference: {
      type: String,
      trim: true,
    },
    canceled_reason: {
      type: String,
      trim: true,
    },
    canceled_at: {
      type: Date,
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
