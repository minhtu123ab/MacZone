import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    email_type: {
      type: String,
      enum: [
        "forgot_password",
        "order_confirmation",
        "order_completed",
        "order_canceled",
        "order_success",
        "other",
      ],
      required: [true, "Please provide email type"],
    },
    subject: {
      type: String,
      required: [true, "Please provide email subject"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please provide email content"],
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
emailLogSchema.index({ user_id: 1 });
emailLogSchema.index({ email_type: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ sent_at: -1 });

export default mongoose.model("EmailLog", emailLogSchema);
