const mongoose = require("mongoose");
const Repost = require("../models/Repost.model");
const Thread = require("../models/Thread.model");
const Follow = require("../models/Follow.model");
const User = require("../models/User.model");
const StatsService = require("./stats.service");

/**
 * Check if the user can view/repost a thread.
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

async function repostThread({ userId, threadId }) {
  const thread = await Thread.findById(threadId).select("_id authorId visibility archivedAt");
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  if (thread.archivedAt) {
    const err = new Error("Cannot repost an archived thread");
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
  await Repost.findOneAndUpdate(
    { userId, threadId: thread._id },
    { userId, threadId: thread._id },
    { upsert: true, new: true }
  );

  return { reposted: true };
}

async function unrepostThread({ userId, threadId }) {
  await Repost.findOneAndDelete({ userId, threadId });
  return { reposted: false };
}

async function getRepostedThreads({ userId, limit = 50 }) {
  const reposts = await Repost.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (reposts.length === 0) return [];

  const threadIds = reposts.map((r) => r.threadId);
  const threads = await Thread.find({ _id: { $in: threadIds } })
    .select("_id authorId content mediaUrls visibility createdAt updatedAt")
    .lean();

  const threadMap = new Map(threads.map((t) => [t._id.toString(), t]));

  const threadIdStrs = reposts.map((r) => r.threadId.toString()).filter((id) => threadMap.has(id));
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

  return reposts
    .map((r) => {
      const t = threadMap.get(r.threadId.toString());
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
        repostedByMe: true,
        repostedAt: r.createdAt,
      };
    })
    .filter(Boolean);
}

/**
 * Returns a Set of thread IDs that the user has reposted.
 */
async function getRepostedByUser(userId, threadIds) {
  if (!threadIds || threadIds.length === 0) return new Set();
  const ids = threadIds.map((id) => new mongoose.Types.ObjectId(id));

  const docs = await Repost.find({
    userId: new mongoose.Types.ObjectId(userId),
    threadId: { $in: ids },
  })
    .select("threadId")
    .lean();

  return new Set(docs.map((d) => d.threadId.toString()));
}

/**
 * Returns a map of threadId → repostsCount.
 */
async function getRepostCounts(threadIds) {
  if (!threadIds || threadIds.length === 0) return {};
  const ids = threadIds.map((id) => new mongoose.Types.ObjectId(id));

  const agg = await Repost.aggregate([
    { $match: { threadId: { $in: ids } } },
    { $group: { _id: "$threadId", count: { $sum: 1 } } },
  ]);

  return Object.fromEntries(agg.map((x) => [x._id.toString(), x.count]));
}

module.exports = {
  repostThread,
  unrepostThread,
  getRepostedThreads,
  getRepostedByUser,
  getRepostCounts,
};
