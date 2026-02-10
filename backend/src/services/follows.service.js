const mongoose = require("mongoose");
const Follow = require("../models/Follow.model");
const User = require("../models/User.model");
const NotificationsService = require("./notifications.service");

/* ── cursor helpers (descending sort: createdAt DESC, _id DESC) ── */
function parseCursor(cursor) {
  const parts = cursor.split("|");
  if (parts.length !== 2) return null;
  const [isoStr, idStr] = parts;
  const createdAt = new Date(isoStr);
  if (Number.isNaN(createdAt.getTime())) return null;
  if (!/^[0-9a-fA-F]{24}$/.test(idStr)) return null;
  return { createdAt, id: new mongoose.Types.ObjectId(idStr) };
}
function makeCursor(doc) {
  return `${doc.createdAt.toISOString()}|${doc._id.toString()}`;
}

// Helper: check if viewer can see target's follow lists
async function canViewFollowLists({ viewerId, targetId }) {
  if (viewerId.toString() === targetId.toString()) return true;

  const targetUser = await User.findById(targetId).select("_id isPrivate");
  if (!targetUser) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (!targetUser.isPrivate) return true;

  const rel = await Follow.findOne({
    followerId: viewerId,
    followingId: targetId,
    status: "ACCEPTED",
  }).select("_id");

  return !!rel;
}

async function requestFollow({ followerId, targetUserId }) {
  if (followerId.toString() === targetUserId.toString()) {
    const err = new Error("You cannot follow yourself");
    err.status = 400;
    throw err;
  }

  const target = await User.findById(targetUserId).select("isPrivate");
  if (!target) {
    const err = new Error("Target user not found");
    err.status = 404;
    throw err;
  }

  const status = target.isPrivate ? "PENDING" : "ACCEPTED";

  // Upsert logique : si déjà existant, on renvoie l'état
  const existing = await Follow.findOne({ followerId, followingId: targetUserId });
  if (existing) {
    return {
      followId: existing._id.toString(),
      status: existing.status,
      message:
        existing.status === "PENDING"
          ? "Follow request already pending"
          : "Already following",
    };
  }

  const follow = await Follow.create({
    followerId,
    followingId: targetUserId,
    status,
  });

  await NotificationsService.createOnce({
    userId: targetUserId,
    actorId: followerId,
    type: status === "PENDING" ? "FOLLOW_REQUEST" : "NEW_FOLLOWER",
    entityType: "FOLLOW",
    entityId: follow._id,
    meta: { status: follow.status },
  });


  return {
    followId: follow._id.toString(),
    status: follow.status,
    message: status === "PENDING" ? "Follow request sent" : "Followed",
  };
}

async function unfollow({ followerId, targetUserId }) {
  const result = await Follow.deleteOne({ followerId, followingId: targetUserId });
  if (result.deletedCount === 0) {
    const err = new Error("Not following this user");
    err.status = 404;
    throw err;
  }
  return { message: "Unfollowed" };
}

async function listMyFollowRequests({ userId, cursor, limit = 20 }) {
  // demandes reçues = where I am the "followingId"
  const baseFilter = { followingId: userId, status: "PENDING" };
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

  const requests = await Follow.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select("_id followerId status createdAt");

  const hasNext = requests.length > limit;
  const items = hasNext ? requests.slice(0, limit) : requests;
  const nextCursor = hasNext ? makeCursor(items[items.length - 1]) : null;

  // Batch-resolve follower info
  const followerIds = [...new Set(items.map((r) => r.followerId.toString()))];
  const followerDocs = followerIds.length > 0
    ? await User.find({ _id: { $in: followerIds } }).select("_id username avatarUrl").lean()
    : [];
  const followerMap = Object.fromEntries(
    followerDocs.map((u) => [u._id.toString(), { username: u.username, avatarUrl: u.avatarUrl }])
  );

  return {
    items: items.map((r) => ({
      requestId: r._id.toString(),
      followerId: r.followerId.toString(),
      follower: followerMap[r.followerId.toString()] || null,
      status: r.status,
      createdAt: r.createdAt,
    })),
    nextCursor,
  };
}

async function acceptRequest({ userId, requestId }) {
  const reqDoc = await Follow.findOne({ _id: requestId, followingId: userId, status: "PENDING" });
  if (!reqDoc) {
    const err = new Error("Follow request not found");
    err.status = 404;
    throw err;
  }

  reqDoc.status = "ACCEPTED";
  await reqDoc.save();

  await NotificationsService.createOnce({
    userId: reqDoc.followerId,
    actorId: reqDoc.followingId,
    type: "FOLLOW_ACCEPTED",
    entityType: "FOLLOW",
    entityId: reqDoc._id,
    meta: {},
});


  return { message: "Follow request accepted" };
}

async function rejectRequest({ userId, requestId }) {
  const result = await Follow.deleteOne({ _id: requestId, followingId: userId, status: "PENDING" });
  if (result.deletedCount === 0) {
    const err = new Error("Follow request not found");
    err.status = 404;
    throw err;
  }
  return { message: "Follow request rejected" };
}

// --- Functions merged from followsExtra.service.js ---

async function listFollowers({ viewerId, userId, limit, cursor }) {
  const ok = await canViewFollowLists({ viewerId, targetId: userId });
  if (!ok) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const baseFilter = { followingId: userId, status: "ACCEPTED" };
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

  const follows = await Follow.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select("followerId createdAt");

  const hasNext = follows.length > limit;
  const items = hasNext ? follows.slice(0, limit) : follows;
  const nextCursor = hasNext ? makeCursor(items[items.length - 1]) : null;

  const followerIds = items.map((f) => f.followerId);

  const users = await User.find({ _id: { $in: followerIds } })
    .select("_id username avatarUrl");

  const map = new Map(users.map((u) => [u._id.toString(), u]));

  return {
    userId: userId.toString(),
    count: items.length,
    items: items
      .map((f) => {
        const u = map.get(f.followerId.toString());
        if (!u) return null;
        return {
          id: u._id.toString(),
          username: u.username,
          avatarUrl: u.avatarUrl,
          followedAt: f.createdAt,
        };
      })
      .filter(Boolean),
    nextCursor,
  };
}

async function listFollowing({ viewerId, userId, limit, cursor }) {
  const ok = await canViewFollowLists({ viewerId, targetId: userId });
  if (!ok) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const baseFilter = { followerId: userId, status: "ACCEPTED" };
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

  const follows = await Follow.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .select("followingId createdAt");

  const hasNext = follows.length > limit;
  const items = hasNext ? follows.slice(0, limit) : follows;
  const nextCursor = hasNext ? makeCursor(items[items.length - 1]) : null;

  const followingIds = items.map((f) => f.followingId);

  const users = await User.find({ _id: { $in: followingIds } })
    .select("_id username avatarUrl");

  const map = new Map(users.map((u) => [u._id.toString(), u]));

  return {
    userId: userId.toString(),
    count: items.length,
    items: items
      .map((f) => {
        const u = map.get(f.followingId.toString());
        if (!u) return null;
        return {
          id: u._id.toString(),
          username: u.username,
          avatarUrl: u.avatarUrl,
          followedAt: f.createdAt,
        };
      })
      .filter(Boolean),
    nextCursor,
  };
}

async function unfollowOrCancel({ followerId, targetUserId }) {
  const doc = await Follow.findOne({
    followerId,
    followingId: targetUserId,
  }).select("_id status");

  if (!doc) {
    const err = new Error("Follow relationship not found");
    err.status = 404;
    throw err;
  }

  await Follow.findOneAndDelete({ _id: doc._id });

  return {
    message: doc.status === "PENDING" ? "Follow request cancelled" : "Unfollowed",
  };
}

/**
 * Returns the follow relationship status from followerId → targetUserId.
 * Possible: "ACCEPTED", "PENDING", or "NONE".
 */
async function getFollowStatus({ followerId, targetUserId }) {
  const doc = await Follow.findOne({
    followerId,
    followingId: targetUserId,
  }).select("status");

  return { status: doc ? doc.status : "NONE" };
}

module.exports = {
  requestFollow,
  unfollow,
  listMyFollowRequests,
  acceptRequest,
  rejectRequest,
  listFollowers,
  listFollowing,
  unfollowOrCancel,
  getFollowStatus,
};
