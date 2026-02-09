const SavesService = require("../services/saves.service");

async function save(req, res) {
  const data = await SavesService.saveThread({
    userId: req.user.id,
    threadId: req.params.threadId,
  });
  return res.status(200).json(data);
}

async function unsave(req, res) {
  const data = await SavesService.unsaveThread({
    userId: req.user.id,
    threadId: req.params.threadId,
  });
  return res.status(200).json(data);
}

async function getSaved(req, res) {
  const threads = await SavesService.getSavedThreads({
    userId: req.user.id,
    limit: req.query.limit ? parseInt(req.query.limit) : 50,
  });
  return res.status(200).json({ threads });
}

module.exports = { save, unsave, getSaved };
