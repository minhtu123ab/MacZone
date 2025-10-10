import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    closed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
chatRoomSchema.index({ user_id: 1 });
chatRoomSchema.index({ admin_id: 1 });
chatRoomSchema.index({ closed_at: 1 });

export default mongoose.model("ChatRoom", chatRoomSchema);
