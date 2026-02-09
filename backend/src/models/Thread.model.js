const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const ThreadSchema = new Schema(
  {
    authorId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    mediaUrls: [{ type: String }],
    visibility: { type: String, enum: ["PUBLIC", "FOLLOWERS", "PRIVATE"], default: "PUBLIC", index: true },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ThreadSchema.index({ createdAt: -1, _id: -1 }); // feed cursor sort
ThreadSchema.index({ authorId: 1, createdAt: -1 });
ThreadSchema.index({ visibility: 1, createdAt: -1 }); // trending query

module.exports = mongoose.model("Thread", ThreadSchema);
