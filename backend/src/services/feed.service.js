// backend/src/services/feed.service.js
const mongoose = require("mongoose");
const Thread = require("../models/Thread.model");
const Follow = require("../models/Follow.model");
const User = require("../models/User.model");
const StatsService = require("./stats.service");
const SavesService = require("./saves.service");
const RepostsService = require("./reposts.service");


function parseCursor(cursor) {
  // cursor format: "<createdAtISO>|<objectId>"
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
 * Feed rules:
 * - PUBLIC: visible to everyone
 * - FOLLOWERS: visible if author is me, or I follow author with ACCEPTED
 *
 * Pagination:
 * - sort by (createdAt desc, _id desc)
 * - cursor filters by (createdAt, _id) to avoid duplicates when createdAt ties
 */
async function getFeed({ userId, limit, cursor }) {
  const following = await Follow.find({
    followerId: userId,
    status: "ACCEPTED",
  }).select("followingId");

  const allowedAuthors = [new mongoose.Types.ObjectId(userId)];
  for (const f of following) allowedAuthors.push(f.followingId);

  const baseFilter = {
    archivedAt: null,
    $or: [
      { visibility: "PUBLIC" },
      { visibility: "FOLLOWERS", authorId: { $in: allowedAuthors } },
      { visibility: "PRIVATE", authorId: new mongoose.Types.ObjectId(userId) },
    ],
  };

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

  const docs = await Thread.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1) // fetch one extra to know if there's a next page
    .select("_id authorId content mediaUrls visibility createdAt updatedAt");

  const hasNext = docs.length > limit;
  const items = hasNext ? docs.slice(0, limit) : docs;

  const nextCursor = hasNext ? makeCursor(items[items.length - 1]) : null;
  const threadIds = items.map((t) => t._id.toString());
  const [statsMap, likedSet, savedSet, repostedSet, repostCountsMap] = await Promise.all([
    StatsService.getThreadStats(threadIds),
    StatsService.getLikedByUser(userId, "THREAD", threadIds),
    SavesService.getSavedByUser(userId, threadIds),
    RepostsService.getRepostedByUser(userId, threadIds),
    RepostsService.getRepostCounts(threadIds),
  ]);

  // Resolve authors in one batch query
  const authorIds = [...new Set(items.map((t) => t.authorId.toString()))];
  const authorDocs = await User.find({ _id: { $in: authorIds } })
    .select("_id username avatarUrl")
    .lean();
  const authorMap = Object.fromEntries(
    authorDocs.map((u) => [u._id.toString(), { username: u.username, avatarUrl: u.avatarUrl }])
  );

  return {
    items: items.map((t) => {
      const s = statsMap[t._id.toString()] || { likesCount: 0, repliesCount: 0 };
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
    }),
    nextCursor,
  };
}

module.exports = { getFeed };
