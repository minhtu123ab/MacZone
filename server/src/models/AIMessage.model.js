import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    price_range_min: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    price_range_max: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    user_description: {
      type: String,
      required: [true, "Please provide user description"],
      trim: true,
    },
    gemini_token_used: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
aiMessageSchema.index({ user_id: 1 });
aiMessageSchema.index({ category_id: 1 });
aiMessageSchema.index({ createdAt: -1 });

export default mongoose.model("AIMessage", aiMessageSchema);
