import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: No need to manually create index for user_id
// unique: true already creates an index automatically

export default mongoose.model("Cart", cartSchema);
