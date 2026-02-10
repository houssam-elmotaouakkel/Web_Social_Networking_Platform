const UsersService = require("../services/users.service");
const ThreadsService = require("../services/threads.service");
const { uploadBuffer } = require("../config/cloudinary");


async function getProfile(req, res) {
  const viewerId = req.user.id;
  const userId = req.params.userId;

  const data = await UsersService.getUserProfile({ viewerId, userId });
  return res.status(200).json(data);
}

async function updateMe(req, res) {
  const userId = req.user.id;
  const { username, bio } = req.body;

  const user = await UsersService.updateMe({ userId, username, bio });
  return res.status(200).json({ user });
}



async function updatePrivacy(req, res) {
  const userId = req.user.id;
  const { isPrivate } = req.body;

  const user = await UsersService.updatePrivacy({ userId, isPrivate });
  return res.status(200).json({ user });
}



async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { url } = await uploadBuffer(req.file.buffer, {
    folder: "nexora/avatars",
    publicId: `user-${req.user.id}`,
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });
  const user = await UsersService.updateAvatar({ userId: req.user.id, avatarUrl: url });
  return res.status(200).json({ user });
}


async function uploadCover(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { url } = await uploadBuffer(req.file.buffer, {
    folder: "nexora/covers",
    publicId: `user-${req.user.id}`,
    transformation: [{ width: 1200, height: 400, crop: "fill" }],
  });
  const user = await UsersService.updateCover({ userId: req.user.id, coverUrl: url });
  return res.status(200).json({ user });
}


async function searchUsers(req, res) {
  const { q, limit } = req.query;
  const users = await UsersService.searchUsers({
    query: q,
    limit: limit ? parseInt(limit) : 10,
    viewerId: req.user.id,
  });
  return res.status(200).json({ users });
}

async function getSuggestedUsers(req, res) {
  const { limit } = req.query;
  const users = await UsersService.getSuggestedUsers({
    userId: req.user.id,
    limit: limit ? parseInt(limit) : 5,
  });
  return res.status(200).json({ users });
}

async function getUserThreads(req, res) {
  const threads = await ThreadsService.getUserThreads({
    viewerId: req.user.id,
    authorId: req.params.userId,
    limit: req.query.limit ? parseInt(req.query.limit) : 30,
  });
  return res.status(200).json({ threads });
}

async function deleteAccount(req, res) {
  await UsersService.deleteAccount({ userId: req.user.id });
  return res.status(200).json({ message: "Account deleted" });
}

module.exports = {
  updatePrivacy,
  uploadAvatar,
  uploadCover,
  getProfile,
  updateMe,
  searchUsers,
  getSuggestedUsers,
  getUserThreads,
  deleteAccount,
};
