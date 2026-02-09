// src/services/threads.service.js
const mongoose = require("mongoose");
const Thread = require("../models/Thread.model");
const Reply = require("../models/Reply.model");
const Reaction = require("../models/Reaction.model");
const Notification = require("../models/Notification.model");
const Follow = require("../models/Follow.model");
const User = require("../models/User.model");
const Save = require("../models/Save.model");
const Repost = require("../models/Repost.model");
const NotificationsService = require("./notifications.service");
const StatsService = require("./stats.service");
const SavesService = require("./saves.service");
const RepostsService = require("./reposts.service");

/**
 * Batch-fetch author info for a list of IDs.
 * Returns a map of id → { username, avatarUrl }.
 */
async function resolveAuthors(authorIds) {
  const unique = [...new Set(authorIds.map(String))];
  if (unique.length === 0) return {};
  const docs = await User.find({ _id: { $in: unique } })
    .select("_id username avatarUrl")
    .lean();
  return Object.fromEntries(
    docs.map((u) => [u._id.toString(), { username: u.username, avatarUrl: u.avatarUrl }])
  );
}

/* ── cursor helpers (ascending sort: createdAt ASC, _id ASC) ── */
function parseReplyCursor(cursor) {
  const parts = cursor.split("|");
  if (parts.length !== 2) return null;
  const [isoStr, idStr] = parts;
  const createdAt = new Date(isoStr);
  if (Number.isNaN(createdAt.getTime())) return null;
  if (!/^[0-9a-fA-F]{24}$/.test(idStr)) return null;
  return { createdAt, id: new mongoose.Types.ObjectId(idStr) };
}
function makeReplyCursor(doc) {
  return `${doc.createdAt.toISOString()}|${doc._id.toString()}`;
}


async function canViewThread({ userId, thread }) {
  // public thread is always viewable
  if (thread.visibility === "PUBLIC") return true;

  // author always can view
  if (thread.authorId.toString() === userId.toString()) return true;

  // private: only the author
  if (thread.visibility === "PRIVATE") return false;

  // followers-only: must have ACCEPTED follow from user -> author
  const rel = await Follow.findOne({
    followerId: userId,
    followingId: thread.authorId,
    status: "ACCEPTED",
  }).select("_id");

  return !!rel;
}

async function createThread({ authorId, content, mediaUrls, visibility }) {
  const thread = await Thread.create({ authorId, content, mediaUrls, visibility });
  return {
    id: thread._id.toString(),
    authorId: thread.authorId.toString(),
    content: thread.content,
    mediaUrls: thread.mediaUrls,
    visibility: thread.visibility,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
  };
}

async function getThreadWithReplies({ userId, threadId, cursor, limit = 20 }) {
  const thread = await Thread.findById(threadId);
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  const ok = await canViewThread({ userId, thread });
  if (!ok) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  // Build cursor filter (ascending order for replies)
  const baseFilter = { threadId: thread._id };
  const c = cursor ? parseReplyCursor(cursor) : null;
  const cursorFilter = c
    ? {
        $or: [
          { createdAt: { $gt: c.createdAt } },
          { createdAt: c.createdAt, _id: { $gt: c.id } },
        ],
      }
    : null;

  const filter = cursorFilter ? { $and: [baseFilter, cursorFilter] } : baseFilter;

  const replies = await Reply.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit + 1)
    .select("_id threadId authorId content createdAt updatedAt");

  const hasNext = replies.length > limit;
  const items = hasNext ? replies.slice(0, limit) : replies;
  const nextCursor = hasNext ? makeReplyCursor(items[items.length - 1]) : null;

    const stats = await StatsService.getSingleThreadStats(thread._id);

  // Get likedByMe for thread and all replies
  const replyIds = items.map((r) => r._id.toString());
  const [threadLikedSet, replyLikedSet, replyStatsMap, savedSet, repostedSet, repostCountsMap] = await Promise.all([
    StatsService.getLikedByUser(userId, "THREAD", [thread._id.toString()]),
    StatsService.getLikedByUser(userId, "REPLY", replyIds),
    StatsService.getReplyStats(replyIds),
    SavesService.getSavedByUser(userId, [thread._id.toString()]),
    RepostsService.getRepostedByUser(userId, [thread._id.toString()]),
    RepostsService.getRepostCounts([thread._id.toString()]),
  ]);

  // Resolve all authors in one batch
  const allAuthorIds = [thread.authorId.toString(), ...items.map((r) => r.authorId.toString())];
  const authorMap = await resolveAuthors(allAuthorIds);

  return {
    thread: {
      id: thread._id.toString(),
      authorId: thread.authorId.toString(),
      author: authorMap[thread.authorId.toString()] || null,
      content: thread.content,
      mediaUrls: thread.mediaUrls,
      visibility: thread.visibility,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      likesCount: stats.likesCount,
      repliesCount: stats.repliesCount,
      repostsCount: repostCountsMap[thread._id.toString()] || 0,
      likedByMe: threadLikedSet.has(thread._id.toString()),
      savedByMe: savedSet.has(thread._id.toString()),
      repostedByMe: repostedSet.has(thread._id.toString()),
    },
    replies: items.map((r) => {
      const rs = replyStatsMap[r._id.toString()] || { likesCount: 0 };
      return {
        id: r._id.toString(),
        threadId: r.threadId.toString(),
        authorId: r.authorId.toString(),
        author: authorMap[r.authorId.toString()] || null,
        content: r.content,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        likesCount: rs.likesCount,
        likedByMe: replyLikedSet.has(r._id.toString()),
      };
    }),
    nextCursor,
  };
}

async function createReply({ userId, threadId, content }) {
  const thread = await Thread.findById(threadId).select("_id authorId visibility");
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  const ok = await canViewThread({ userId, thread });
  if (!ok) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const reply = await Reply.create({ threadId, authorId: userId, content });
  

  await NotificationsService.createOnce({
    userId: thread.authorId,
    actorId: userId,
    type: "REPLY",
    entityType: "THREAD",
    entityId: thread._id,
    meta: { replyId: reply._id.toString() },
  });


  return {
    id: reply._id.toString(),
    threadId: reply.threadId.toString(),
    authorId: reply.authorId.toString(),
    content: reply.content,
    createdAt: reply.createdAt,
    updatedAt: reply.updatedAt,
  };
}

async function deleteThread({ userId, threadId }) {
  const thread = await Thread.findById(threadId).select("_id authorId");
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  if (thread.authorId.toString() !== userId.toString()) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  // Collect reply IDs for cascade cleanup
  const replyIds = await Reply.find({ threadId: thread._id }).distinct("_id");

  // Delete reactions on the thread itself
  await Reaction.deleteMany({ targetType: "THREAD", targetId: thread._id });

  // Delete reactions on all replies of the thread
  if (replyIds.length > 0) {
    await Reaction.deleteMany({ targetType: "REPLY", targetId: { $in: replyIds } });
  }

  // Delete notifications linked to this thread or its replies
  await Notification.deleteMany({
    $or: [
      { entityType: "THREAD", entityId: thread._id },
      { entityType: "REPLY", entityId: { $in: replyIds } },
    ],
  });

  await Reply.deleteMany({ threadId: thread._id });
  await Save.deleteMany({ threadId: thread._id });
  await Repost.deleteMany({ threadId: thread._id });
  await Thread.deleteOne({ _id: thread._id });

  return { message: "Thread deleted" };
}

async function deleteReply({ userId, replyId }) {
  const reply = await Reply.findById(replyId).select("_id authorId");
  if (!reply) {
    const err = new Error("Reply not found");
    err.status = 404;
    throw err;
  }

  if (reply.authorId.toString() !== userId.toString()) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  await Reply.findOneAndDelete({ _id: reply._id });
  return { message: "Reply deleted" };
}


async function getTrendingThreads({ limit = 5 }) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

  // Get public threads from the last 7 days (cap at 200 to avoid loading entire collection)
  const recentThreads = await Thread.find({
    visibility: 'PUBLIC',
    createdAt: { $gte: since },
    archivedAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .select('_id authorId content mediaUrls createdAt')
    .lean();

  if (recentThreads.length === 0) {
    // Fallback: get latest public threads regardless of date
    const fallback = await Thread.find({ visibility: 'PUBLIC', archivedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id authorId content mediaUrls createdAt')
      .lean();
    const ids = fallback.map((t) => t._id);
    const stats = await StatsService.getThreadStats(ids);
    const authorMap = await resolveAuthors(fallback.map((t) => t.authorId.toString()));
    return fallback.map((t) => ({
      id: t._id.toString(),
      authorId: t.authorId.toString(),
      author: authorMap[t.authorId.toString()] || null,
      content: t.content,
      mediaUrls: t.mediaUrls,
      createdAt: t.createdAt,
      likesCount: stats[t._id.toString()]?.likesCount || 0,
      repliesCount: stats[t._id.toString()]?.repliesCount || 0,
    }));
  }

  const threadIds = recentThreads.map((t) => t._id);
  const stats = await StatsService.getThreadStats(threadIds);
  const authorMap = await resolveAuthors(recentThreads.map((t) => t.authorId.toString()));

  // Score = likes * 2 + replies * 3 (replies weighted more)
  const scored = recentThreads.map((t) => {
    const s = stats[t._id.toString()] || { likesCount: 0, repliesCount: 0 };
    return {
      id: t._id.toString(),
      authorId: t.authorId.toString(),
      author: authorMap[t.authorId.toString()] || null,
      content: t.content,
      mediaUrls: t.mediaUrls,
      createdAt: t.createdAt,
      likesCount: s.likesCount,
      repliesCount: s.repliesCount,
      score: s.likesCount * 2 + s.repliesCount * 3,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ score, ...rest }) => rest);
}

/**
 * Get threads authored by a specific user, visible to the viewer.
 * Returns newest-first with stats (likesCount, repliesCount).
 */
async function getUserThreads({ viewerId, authorId, limit = 30 }) {
  const isSelf = viewerId.toString() === authorId.toString();

  // Determine which visibilities the viewer is allowed to see
  let visibilities;
  if (isSelf) {
    visibilities = ["PUBLIC", "FOLLOWERS", "PRIVATE"];
  } else {
    // Check if viewer follows the author
    const rel = await Follow.findOne({
      followerId: viewerId,
      followingId: authorId,
      status: "ACCEPTED",
    }).select("_id");

    visibilities = rel ? ["PUBLIC", "FOLLOWERS"] : ["PUBLIC"];
  }

  const threads = await Thread.find({
    authorId,
    visibility: { $in: visibilities },
    archivedAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("_id authorId content mediaUrls visibility createdAt updatedAt")
    .lean();

  if (threads.length === 0) return [];

  const ids = threads.map((t) => t._id);
  const threadIdStrs = ids.map((id) => id.toString());
  const [stats, likedSet, savedSet, repostedSet, repostCountsMap] = await Promise.all([
    StatsService.getThreadStats(threadIdStrs),
    StatsService.getLikedByUser(viewerId, "THREAD", threadIdStrs),
    SavesService.getSavedByUser(viewerId, threadIdStrs),
    RepostsService.getRepostedByUser(viewerId, threadIdStrs),
    RepostsService.getRepostCounts(threadIdStrs),
  ]);

  // Single author for user threads page
  const authorMap = await resolveAuthors([authorId.toString()]);

  return threads.map((t) => {
    const s = stats[t._id.toString()] || { likesCount: 0, repliesCount: 0 };
    return {
      id: t._id.toString(),
      authorId: t.authorId.toString(),
      author: authorMap[t.authorId.toString()] || null,
      content: t.content,
      mediaUrls: t.mediaUrls,
      visibility: t.visibility,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      likesCount: s.likesCount,
      repliesCount: s.repliesCount,
      repostsCount: repostCountsMap[t._id.toString()] || 0,
      likedByMe: likedSet.has(t._id.toString()),
      savedByMe: savedSet.has(t._id.toString()),
      repostedByMe: repostedSet.has(t._id.toString()),
    };
  });
}

async function updateVisibility({ userId, threadId, visibility }) {
  const thread = await Thread.findById(threadId).select("_id authorId visibility");
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  if (thread.authorId.toString() !== userId.toString()) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  thread.visibility = visibility;
  await thread.save();

  return {
    id: thread._id.toString(),
    visibility: thread.visibility,
  };
}

async function archiveThread({ userId, threadId }) {
  const thread = await Thread.findById(threadId).select("_id authorId archivedAt");
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  if (thread.authorId.toString() !== userId.toString()) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  if (thread.archivedAt) {
    return { id: thread._id.toString(), archivedAt: thread.archivedAt };
  }

  thread.archivedAt = new Date();
  await thread.save();

  return { id: thread._id.toString(), archivedAt: thread.archivedAt };
}

async function unarchiveThread({ userId, threadId }) {
  const thread = await Thread.findById(threadId).select("_id authorId archivedAt");
  if (!thread) {
    const err = new Error("Thread not found");
    err.status = 404;
    throw err;
  }

  if (thread.authorId.toString() !== userId.toString()) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  if (!thread.archivedAt) {
    return { id: thread._id.toString(), archivedAt: null };
  }

  thread.archivedAt = null;
  await thread.save();

  return { id: thread._id.toString(), archivedAt: null };
}

async function getArchivedThreads({ userId, limit = 50 }) {
  const threads = await Thread.find({
    authorId: userId,
    archivedAt: { $ne: null },
  })
    .sort({ archivedAt: -1 })
    .limit(limit)
    .select("_id authorId content mediaUrls visibility createdAt updatedAt archivedAt")
    .lean();

  if (threads.length === 0) return [];

  const ids = threads.map((t) => t._id.toString());
  const [stats, likedSet, savedSet, repostedSet, repostCountsMap] = await Promise.all([
    StatsService.getThreadStats(ids),
    StatsService.getLikedByUser(userId, "THREAD", ids),
    SavesService.getSavedByUser(userId, ids),
    RepostsService.getRepostedByUser(userId, ids),
    RepostsService.getRepostCounts(ids),
  ]);

  const authorMap = await resolveAuthors([userId.toString()]);

  return threads.map((t) => {
    const s = stats[t._id.toString()] || { likesCount: 0, repliesCount: 0 };
    return {
      id: t._id.toString(),
      authorId: t.authorId.toString(),
      author: authorMap[t.authorId.toString()] || null,
      content: t.content,
      mediaUrls: t.mediaUrls,
      visibility: t.visibility,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      archivedAt: t.archivedAt,
      likesCount: s.likesCount,
      repliesCount: s.repliesCount,
      repostsCount: repostCountsMap[t._id.toString()] || 0,
      likedByMe: likedSet.has(t._id.toString()),
      savedByMe: savedSet.has(t._id.toString()),
      repostedByMe: repostedSet.has(t._id.toString()),
    };
  });
}

module.exports = {
    createThread,
    getThreadWithReplies,
    createReply,
    deleteThread,
    deleteReply,
    getTrendingThreads,
    getUserThreads,
    updateVisibility,
    archiveThread,
    unarchiveThread,
    getArchivedThreads,
};
