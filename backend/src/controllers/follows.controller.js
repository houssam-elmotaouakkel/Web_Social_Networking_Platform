const FollowsService = require("../services/follows.service");

async function followUser(req, res) {
  const followerId = req.user.id;
  const targetUserId = req.params.userId;

  const data = await FollowsService.requestFollow({ followerId, targetUserId });
  return res.status(200).json(data);
}

async function unfollowUser(req, res) {
  const followerId = req.user.id;
  const targetUserId = req.params.userId;

  const data = await FollowsService.unfollow({ followerId, targetUserId });
  return res.status(200).json(data);
}

async function getMyRequests(req, res) {
  const userId = req.user.id;
  const { cursor, limit } = req.query;
  const data = await FollowsService.listMyFollowRequests({
    userId,
    cursor,
    limit: limit ? Number(limit) : undefined,
  });
  return res.status(200).json(data);
}

async function accept(req, res) {
  const userId = req.user.id;
  const requestId = req.params.requestId;

  const data = await FollowsService.acceptRequest({ userId, requestId });
  return res.status(200).json(data);
}

async function reject(req, res) {
  const userId = req.user.id;
  const requestId = req.params.requestId;

  const data = await FollowsService.rejectRequest({ userId, requestId });
  return res.status(200).json(data);
}

// --- Functions merged from followsExtra.controller.js ---

async function followers(req, res) {
  const viewerId = req.user.id;
  const userId = req.params.userId;
  const { limit, cursor } = req.query;

  const data = await FollowsService.listFollowers({ viewerId, userId, limit, cursor });
  return res.status(200).json(data);
}

async function following(req, res) {
  const viewerId = req.user.id;
  const userId = req.params.userId;
  const { limit, cursor } = req.query;

  const data = await FollowsService.listFollowing({ viewerId, userId, limit, cursor });
  return res.status(200).json(data);
}

async function followStatus(req, res) {
  const followerId = req.user.id;
  const targetUserId = req.params.userId;

  const data = await FollowsService.getFollowStatus({ followerId, targetUserId });
  return res.status(200).json(data);
}

module.exports = {
  followUser,
  unfollowUser,
  getMyRequests,
  accept,
  reject,
  followers,
  following,
  followStatus,
};
