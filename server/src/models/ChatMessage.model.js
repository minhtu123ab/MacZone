import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: [true, "Please provide a chat room"],
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a sender"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: [true, "Please provide sender role"],
    },
    message: {
      type: String,
      required: [true, "Please provide a message"],
    },
    message_type: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
chatMessageSchema.index({ room_id: 1 });
chatMessageSchema.index({ sender_id: 1 });
chatMessageSchema.index({ createdAt: -1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
