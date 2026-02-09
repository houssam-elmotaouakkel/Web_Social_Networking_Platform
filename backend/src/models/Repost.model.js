const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const RepostSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    threadId: { type: Types.ObjectId, ref: "Thread", required: true, index: true },
  },
  { timestamps: true }
);

// One repost per user per thread
RepostSchema.index({ userId: 1, threadId: 1 }, { unique: true });

module.exports = mongoose.model("Repost", RepostSchema);
