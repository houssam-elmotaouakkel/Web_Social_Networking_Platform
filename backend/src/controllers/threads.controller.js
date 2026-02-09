// src/controllers/threads.controller.js
const ThreadsService = require("../services/threads.service");

async function create(req, res) {
  const data = await ThreadsService.createThread({
    authorId: req.user.id,
    ...req.body,
  });
  return res.status(201).json({ thread: data });
}

async function getOne(req, res) {
  const data = await ThreadsService.getThreadWithReplies({
    userId: req.user.id,
    threadId: req.params.threadId,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });
  return res.status(200).json(data);
}

async function reply(req, res) {
  const data = await ThreadsService.createReply({
    userId: req.user.id,
    threadId: req.params.threadId,
    content: req.body.content,
  });
  return res.status(201).json({ reply: data });
}

async function remove(req, res) {
  const data = await ThreadsService.deleteThread({
    userId: req.user.id,
    threadId: req.params.threadId,
  });
  return res.status(200).json(data);
}

async function removeReply(req, res) {
  const data = await ThreadsService.deleteReply({
    userId: req.user.id,
    replyId: req.params.replyId,
  });
  return res.status(200).json(data);
}


async function getTrending(req, res) {
  const { limit } = req.query;
  const threads = await ThreadsService.getTrendingThreads({
    limit: limit ? parseInt(limit) : 5,
  });
  return res.status(200).json({ threads });
}

async function updateVisibility(req, res) {
  const data = await ThreadsService.updateVisibility({
    userId: req.user.id,
    threadId: req.params.threadId,
    visibility: req.body.visibility,
  });
  return res.status(200).json(data);
}

async function archive(req, res) {
  const data = await ThreadsService.archiveThread({
    userId: req.user.id,
    threadId: req.params.threadId,
  });
  return res.status(200).json(data);
}

async function unarchive(req, res) {
  const data = await ThreadsService.unarchiveThread({
    userId: req.user.id,
    threadId: req.params.threadId,
  });
  return res.status(200).json(data);
}

async function getArchived(req, res) {
  const rawLimit = req.query.limit;
  const threads = await ThreadsService.getArchivedThreads({
    userId: req.user.id,
    limit: rawLimit ? parseInt(rawLimit, 10) : undefined,
  });
  return res.status(200).json({ threads });
}

module.exports = {
    create,
    getOne,
    reply,
    remove,
    getTrending,
    removeReply,
    updateVisibility,
    archive,
    unarchive,
    getArchived,
};
