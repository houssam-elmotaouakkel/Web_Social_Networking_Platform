const mongoose = require("mongoose");
const Reaction = require("../models/Reaction.model");
const Reply = require("../models/Reply.model");

async function getThreadStats(threadIds) {
  if (!Array.isArray(threadIds) || threadIds.length === 0) return {};
  const ids = threadIds.map((id) => new mongoose.Types.ObjectId(id));

  const [likesAgg, repliesAgg] = await Promise.all([
    Reaction.aggregate([
      { $match: { targetType: "THREAD", type: "LIKE", targetId: { $in: ids } } },
      { $group: { _id: "$targetId", likesCount: { $sum: 1 } } },
    ]),
    Reply.aggregate([
      { $match: { threadId: { $in: ids } } },
      { $group: { _id: "$threadId", repliesCount: { $sum: 1 } } },
    ]),
  ]);

  const likesMap = new Map(likesAgg.map((x) => [x._id.toString(), x.likesCount]));
  const repliesMap = new Map(repliesAgg.map((x) => [x._id.toString(), x.repliesCount]));

  return (threadIds || []).reduce((acc, id) => {
    const key = id.toString();
    acc[key] = {
      likesCount: likesMap.get(key) || 0,
      repliesCount: repliesMap.get(key) || 0,
    };
    return acc;
  }, {});
}

async function getSingleThreadStats(threadId) {
  const map = await getThreadStats([threadId]);
  return map[threadId.toString()] || { likesCount: 0, repliesCount: 0 };
}

/**
 * Returns a map of replyId → { likesCount } for the given reply IDs.
 */
async function getReplyStats(replyIds) {
  if (!Array.isArray(replyIds) || replyIds.length === 0) return {};
  const ids = replyIds.map((id) => new mongoose.Types.ObjectId(id));

  const likesAgg = await Reaction.aggregate([
    { $match: { targetType: "REPLY", type: "LIKE", targetId: { $in: ids } } },
    { $group: { _id: "$targetId", likesCount: { $sum: 1 } } },
  ]);

  const likesMap = new Map(likesAgg.map((x) => [x._id.toString(), x.likesCount]));

  return replyIds.reduce((acc, id) => {
    const key = id.toString();
    acc[key] = { likesCount: likesMap.get(key) || 0 };
    return acc;
  }, {});
}

/**
 * Returns a Set of target IDs that the given user has liked.
 * @param {string} userId
 * @param {string} targetType  "THREAD" | "REPLY"
 * @param {string[]} targetIds
 * @returns {Promise<Set<string>>}
 */
async function getLikedByUser(userId, targetType, targetIds) {
  if (!targetIds || targetIds.length === 0) return new Set();
  const ids = targetIds.map((id) => new mongoose.Types.ObjectId(id));

  const docs = await Reaction.find({
    userId: new mongoose.Types.ObjectId(userId),
    targetType,
    type: "LIKE",
    targetId: { $in: ids },
  })
    .select("targetId")
    .lean();

  return new Set(docs.map((d) => d.targetId.toString()));
}

module.exports = { getThreadStats, getSingleThreadStats, getReplyStats, getLikedByUser };
