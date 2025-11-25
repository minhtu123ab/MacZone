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
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    unread_count_user: {
      type: Number,
      default: 0,
      min: 0,
    },
    unread_count_admin: {
      type: Number,
      default: 0,
      min: 0,
    },
    last_message: {
      type: String,
      maxlength: 500,
    },
    last_message_at: {
      type: Date,
    },
    closed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for checking if room is active
chatRoomSchema.virtual("isActive").get(function () {
  return this.status === "active";
});

// Index for queries
chatRoomSchema.index({ user_id: 1 });
chatRoomSchema.index({ admin_id: 1 });
chatRoomSchema.index({ status: 1 });
chatRoomSchema.index({ closed_at: 1 });
chatRoomSchema.index({ last_message_at: -1 });

// Ensure virtuals are included in JSON
chatRoomSchema.set("toJSON", { virtuals: true });
chatRoomSchema.set("toObject", { virtuals: true });

export default mongoose.model("ChatRoom", chatRoomSchema);
