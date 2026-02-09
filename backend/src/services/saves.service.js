const mongoose = require("mongoose");
const Save = require("../models/Save.model");
const Thread = require("../models/Thread.model");
const Follow = require("../models/Follow.model");
const User = require("../models/User.model");
const StatsService = require("./stats.service");

/**
 * Check if the user can view/save a thread.
 */
async function canAccess({ userId, thread }) {
  if (thread.visibility === "PUBLIC") return true;
  if (thread.authorId.toString() === userId.toString()) return true;
  if (thread.visibility === "PRIVATE") return false;

  // FOLLOWERS: must follow the author
  const rel = await Follow.findOne({
    followerId: userId,
    followingId: thread.authorId,
    status: "ACCEPTED",
  }).select("_id");
  return !!rel;
}

async function saveThread({ userId, threadId }) {
  const thread = await Thread.findById(threadId).select("_id authorId visibility archivedAt");
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  if (thread.archivedAt) {
    const err = new Error("Cannot save an archived thread");
    err.status = 400;
    throw err;
  }

  const ok = await canAccess({ userId, thread });
  if (!ok) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  // Upsert to avoid duplicate errors
  await Save.findOneAndUpdate(
    { userId, threadId: thread._id },
    { userId, threadId: thread._id },
    { upsert: true, new: true }
  );

  return { saved: true };
}

async function unsaveThread({ userId, threadId }) {
  await Save.findOneAndDelete({ userId, threadId });
  return { saved: false };
}

async function getSavedThreads({ userId, limit = 50 }) {
  const saves = await Save.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (saves.length === 0) return [];

  const threadIds = saves.map((s) => s.threadId);
  const threads = await Thread.find({ _id: { $in: threadIds } })
    .select("_id authorId content mediaUrls visibility createdAt updatedAt")
    .lean();

  // Build map to maintain saved order
  const threadMap = new Map(threads.map((t) => [t._id.toString(), t]));

  const threadIdStrs = saves.map((s) => s.threadId.toString()).filter((id) => threadMap.has(id));
  const [statsMap, likedSet] = await Promise.all([
    StatsService.getThreadStats(threadIdStrs),
    StatsService.getLikedByUser(userId, "THREAD", threadIdStrs),
  ]);

  // Resolve authors
  const authorIds = [...new Set(threads.map((t) => t.authorId.toString()))];
  const authorDocs = await User.find({ _id: { $in: authorIds } })
    .select("_id username avatarUrl")
    .lean();
  const authorMap = Object.fromEntries(
    authorDocs.map((u) => [u._id.toString(), { username: u.username, avatarUrl: u.avatarUrl }])
  );

  // Return in saved order
  return saves
    .map((s) => {
      const t = threadMap.get(s.threadId.toString());
      if (!t) return null;
      const st = statsMap[t._id.toString()] || { likesCount: 0, repliesCount: 0 };
      return {
        id: t._id.toString(),
        authorId: t.authorId.toString(),
        author: authorMap[t.authorId.toString()] || null,
        content: t.content,
        mediaUrls: t.mediaUrls,
        visibility: t.visibility,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        likesCount: st.likesCount,
        repliesCount: st.repliesCount,
        likedByMe: likedSet.has(t._id.toString()),
        savedByMe: true,
        savedAt: s.createdAt,
      };
    })
    .filter(Boolean);
}

/**
 * Returns a Set of thread IDs that the user has saved.
 */
async function getSavedByUser(userId, threadIds) {
  if (!threadIds || threadIds.length === 0) return new Set();
  const ids = threadIds.map((id) => new mongoose.Types.ObjectId(id));

  const docs = await Save.find({
    userId: new mongoose.Types.ObjectId(userId),
    threadId: { $in: ids },
  })
    .select("threadId")
    .lean();

  return new Set(docs.map((d) => d.threadId.toString()));
}

module.exports = {
  saveThread,
  unsaveThread,
  getSavedThreads,
  getSavedByUser,
};
