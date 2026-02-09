const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const SaveSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    threadId: { type: Types.ObjectId, ref: "Thread", required: true, index: true },
  },
  { timestamps: true }
);

// One save per user per thread
SaveSchema.index({ userId: 1, threadId: 1 }, { unique: true });

module.exports = mongoose.model("Save", SaveSchema);
