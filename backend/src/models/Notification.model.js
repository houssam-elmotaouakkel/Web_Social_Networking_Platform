const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },   // recipient
    actorId: { type: Types.ObjectId, ref: "User", required: true, index: true },  // who triggered it

    type: {
      type: String,
      enum: [
        "FOLLOW_REQUEST",
        "NEW_FOLLOWER",
        "FOLLOW_ACCEPTED",
        "REPLY",
        "LIKE_THREAD",
        "LIKE_REPLY",
      ],
      required: true,
      index: true,
    },

    entityType: { type: String, enum: ["FOLLOW", "THREAD", "REPLY"], required: true, index: true },
    entityId: { type: Types.ObjectId, required: true, index: true },

    isRead: { type: Boolean, default: false, index: true },

    // optional payload, keep flexible
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Fast listing: unread first / newest first (we will sort by createdAt desc anyway)
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Optional: avoid duplicate spam for same actor+event+entity while toggling likes etc.
// (If you prefer multiple notifications, remove this index and skip upsert logic below.)
NotificationSchema.index(
  { userId: 1, actorId: 1, type: 1, entityType: 1, entityId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
