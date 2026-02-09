const mongoose = require("mongoose");
const User = require("../models/User.model");
const Follow = require("../models/Follow.model");
const Thread = require("../models/Thread.model");
const toPublicUser = require("../utils/toPublicUser");



async function canViewPrivateProfile({ viewerId, targetId }) {
  if (viewerId.toString() === targetId.toString()) return true;

  const rel = await Follow.findOne({
    followerId: viewerId,
    followingId: targetId,
    status: "ACCEPTED",
  }).select("_id");

  return !!rel;
}



async function getCounts({ targetId }) {
  const [threadsCount, followersCount, followingCount] = await Promise.all([
    Thread.countDocuments({ authorId: targetId }),
    Follow.countDocuments({ followingId: targetId, status: "ACCEPTED" }),
    Follow.countDocuments({ followerId: targetId, status: "ACCEPTED" }),
  ]);

  return { threadsCount, followersCount, followingCount };
}

/**
 * Returns:
 * - full profile if public OR viewer allowed
 * - limited profile if private and viewer not allowed
 */
async function getUserProfile({ viewerId, userId }) {
  const user = await User.findById(userId).select("_id username email bio avatarUrl coverUrl isPrivate defaultVisibility createdAt updatedAt");
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  if (!user.isPrivate) {
    const counts = await getCounts({ targetId: user._id });
    return { profile: { ...toPublicUser(user), ...counts }, access: "FULL" };
  }

  const allowed = await canViewPrivateProfile({ viewerId, targetId: user._id });

  if (!allowed) {
    // Profil “limité” (tu peux ajuster selon ton cahier de charge)
    return {
      profile: {
        id: user._id.toString(),
        username: user.username,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        isPrivate: true,
      },
      access: "LIMITED",
    };
  }

  const counts = await getCounts({ targetId: user._id });
  return { profile: { ...toPublicUser(user), ...counts }, access: "FULL" };
}




async function updateMe({ userId, username, bio }) {
  const patch = {};
  if (typeof username === "string") patch.username = username;
  if (typeof bio === "string") patch.bio = bio;

  if (patch.username) {
    const conflict = await User.findOne({ username: patch.username, _id: { $ne: userId } }).select("_id");
    if (conflict) {
      const err = new Error("Username already in use");
      err.status = 409;
      throw err;
    }
  }

  const user = await User.findByIdAndUpdate(userId, patch, { new: true })
    .select("_id username email bio avatarUrl coverUrl isPrivate defaultVisibility createdAt updatedAt");

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return toPublicUser(user);
}




async function updatePrivacy({ userId, isPrivate }) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isPrivate },
    { new: true }
  );

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return toPublicUser(user);
}



async function updateAvatar({ userId, avatarUrl }) {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatarUrl },
    { new: true }
  );

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return toPublicUser(user);
}


async function updateCover({ userId, coverUrl }) {
  const user = await User.findByIdAndUpdate(
    userId,
    { coverUrl },
    { new: true }
  );

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return toPublicUser(user);
}


async function searchUsers({ query, limit = 10, viewerId }) {
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({
    username: regex,
    _id: { $ne: viewerId },
  })
    .select('_id username bio avatarUrl isPrivate')
    .limit(limit)
    .lean();

  return users.map((u) => ({
    id: u._id.toString(),
    username: u.username,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    isPrivate: u.isPrivate,
  }));
}

async function getSuggestedUsers({ userId, limit = 5 }) {
  // Get IDs that user already follows
  const following = await Follow.find({ followerId: userId })
    .select('followingId')
    .lean();
  const excludeIds = [userId, ...following.map((f) => f.followingId.toString())];

  // Get users with most followers that the current user doesn't follow
  const suggestions = await Follow.aggregate([
    { $match: { status: 'ACCEPTED' } },
    { $group: { _id: '$followingId', count: { $sum: 1 } } },
    { $match: { _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  if (suggestions.length === 0) {
    // Fallback: newest users the current user doesn't follow
    const users = await User.find({ _id: { $nin: excludeIds } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id username bio avatarUrl isPrivate')
      .lean();
    return users.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      isPrivate: u.isPrivate,
      followersCount: 0,
    }));
  }

  const suggestedIds = suggestions.map((s) => s._id);
  const users = await User.find({ _id: { $in: suggestedIds } })
    .select('_id username bio avatarUrl isPrivate')
    .lean();

  const countMap = new Map(suggestions.map((s) => [s._id.toString(), s.count]));
  return users
    .map((u) => ({
      id: u._id.toString(),
      username: u.username,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      isPrivate: u.isPrivate,
      followersCount: countMap.get(u._id.toString()) || 0,
    }))
    .sort((a, b) => b.followersCount - a.followersCount);
}

module.exports = {
  updatePrivacy,
  updateAvatar,
  updateCover,
  updateMe,
  getUserProfile,
  searchUsers,
  getSuggestedUsers,
};
