// src/services/notifications.service.js
const mongoose = require("mongoose");
const Notification = require("../models/Notification.model");
const User = require("../models/User.model");

const TYPE_TO_PREF_KEY = {
  FOLLOW_REQUEST: "followRequest",
  FOLLOW_ACCEPTED: "followAccepted",
  REPLY: "reply",
  LIKE_THREAD: "likeThread",
  LIKE_REPLY: "likeReply",
};


function parseCursor(cursor) {
  const parts = cursor.split("|");
  if (parts.length !== 2) return null;

  const [createdAtStr, idStr] = parts;
  const createdAt = new Date(createdAtStr);
  if (Number.isNaN(createdAt.getTime())) return null;
  if (!/^[0-9a-fA-F]{24}$/.test(idStr)) return null;

  return { createdAt, id: new mongoose.Types.ObjectId(idStr) };
}

function makeCursor(doc) {
  return `${doc.createdAt.toISOString()}|${doc._id.toString()}`;
}

/**
 * Create notification once (idempotent) using unique compound index.
 * If already exists, keep it (or optionally mark it unread again).
 */
async function createOnce({ userId, actorId, type, entityType, entityId, meta = {} }) {
  if (userId.toString() === actorId.toString()) return null;

  const prefKey = TYPE_TO_PREF_KEY[type];
  if (prefKey) {
    const recipient = await User.findById(userId).select(
      "settings.notificationsPrefs",
    );
    const prefs = recipient?.settings?.notificationsPrefs || {};
    if (prefs[prefKey] === false) return null; // muted
  }


  const doc = await Notification.findOneAndUpdate(
    { userId, actorId, type, entityType, entityId },
    {
      // On met isRead UNE seule fois (pas de conflit)
      $set: { meta, isRead: false },
      // On peut initialiser les champs clés à l'insertion (optionnel)
      $setOnInsert: { userId, actorId, type, entityType, entityId },
    },
    { new: true, upsert: true }
  );

  return doc;
}


async function list({ userId, limit, cursor }) {
  const baseFilter = { userId };
  const c = cursor ? parseCursor(cursor) : null;
  const cursorFilter = c
    ? {
        $or: [
          { createdAt: { $lt: c.createdAt } },
          { createdAt: c.createdAt, _id: { $lt: c.id } },
        ],
      }
    : null;

  const filter = cursorFilter ? { $and: [baseFilter, cursorFilter] } : baseFilter;

  const docs = await Notification.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select("_id userId actorId type entityType entityId isRead meta createdAt");

  const hasNext = docs.length > limit;
  const items = hasNext ? docs.slice(0, limit) : docs;
  const nextCursor = hasNext ? makeCursor(items[items.length - 1]) : null;

  // Batch-resolve actor info
  const actorIds = [...new Set(items.map((n) => n.actorId.toString()))];
  const actorDocs = actorIds.length > 0
    ? await User.find({ _id: { $in: actorIds } }).select("_id username avatarUrl").lean()
    : [];
  const actorMap = Object.fromEntries(
    actorDocs.map((u) => [u._id.toString(), { username: u.username, avatarUrl: u.avatarUrl }])
  );

  return {
    items: items.map((n) => ({
      id: n._id.toString(),
      userId: n.userId.toString(),
      actorId: n.actorId.toString(),
      actor: actorMap[n.actorId.toString()] || null,
      type: n.type,
      entityType: n.entityType,
      entityId: n.entityId.toString(),
      isRead: n.isRead,
      meta: n.meta || {},
      createdAt: n.createdAt,
    })),
    nextCursor,
  };
}

async function markRead({ userId, notificationId }) {
  const doc = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!doc) {
    const err = new Error("Notification not found");
    err.status = 404;
    throw err;
  }

  return { message: "Marked as read" };
}

async function markAllRead({ userId }) {
  await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  return { message: "All marked as read" };
}

async function getUnreadCount({ userId }) {
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return { unreadCount };
}

async function deleteAll({ userId }) {
  const result = await Notification.deleteMany({ userId });
  return { message: "All notifications deleted", deletedCount: result.deletedCount };
}

module.exports = { createOnce, list, markRead, markAllRead, getUnreadCount, deleteAll };
