import mongoose from "mongoose";

const recommendedProductSchema = new mongoose.Schema(
  {
    ai_message_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIMessage",
      required: [true, "Please provide an AI message"],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please provide a product"],
    },
    rank: {
      type: Number,
      required: [true, "Please provide a rank"],
      min: [1, "Rank must be at least 1"],
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
recommendedProductSchema.index({ ai_message_id: 1 });
recommendedProductSchema.index({ product_id: 1 });
recommendedProductSchema.index({ rank: 1 });

// Compound index for unique rank per AI message
recommendedProductSchema.index({ ai_message_id: 1, rank: 1 }, { unique: true });

export default mongoose.model("RecommendedProduct", recommendedProductSchema);
