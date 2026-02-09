const RepostsService = require("../services/reposts.service");

async function repost(req, res) {
  const data = await RepostsService.repostThread({
    userId: req.user.id,
    threadId: req.params.threadId,
  });
  return res.status(200).json(data);
}

async function unrepost(req, res) {
  const data = await RepostsService.unrepostThread({
    userId: req.user.id,
    threadId: req.params.threadId,
  });
  return res.status(200).json(data);
}

async function getReposted(req, res) {
  const threads = await RepostsService.getRepostedThreads({
    userId: req.user.id,
    limit: req.query.limit ? parseInt(req.query.limit) : 50,
  });
  return res.status(200).json({ threads });
}

module.exports = { repost, unrepost, getReposted };
