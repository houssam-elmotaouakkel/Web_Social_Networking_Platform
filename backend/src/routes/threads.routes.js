//src/routes/threads.routes.js
const express = require("express");
const router = express.Router();


const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const validateBody = require("../middlewares/validate.middleware");
const validateParams = require("../middlewares/validateParams.middleware");


const ThreadsController = require("../controllers/threads.controller");
const { createThreadSchema, threadIdParamsSchema } = require("../validators/threads.validators");
const { createReplySchema, replyIdParamsSchema } = require("../validators/replies.validators");
const { writeLimiter } = require("../middlewares/rateLimiters.middleware");
const validateQuery = require("../middlewares/validateQuery.middleware");
const { trendingQuerySchema, updateVisibilitySchema, repliesQuerySchema } = require("../validators/threads.validators");

// Archived threads: GET /api/threads/me/archived
router.get(
  "/me/archived",
  authMiddleware,
  asyncHandler(ThreadsController.getArchived)
);

// Trending threads: GET /api/threads/trending?limit=5
router.get(
  "/trending",
  authMiddleware,
  validateQuery(trendingQuerySchema),
  asyncHandler(ThreadsController.getTrending)
);

// create Threads
router.post( // POST http://localhost:4000/api/threads
  "/",
  authMiddleware,
  validateBody(createThreadSchema),
  asyncHandler(ThreadsController.create)
);

// get thread with replies (paginated)
router.get( // GET http://localhost:4000/api/threads/:threadId?cursor=...&limit=20
  "/:threadId",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  validateQuery(repliesQuerySchema),
  asyncHandler(ThreadsController.getOne)
);

// create Replies on threads
router.post( // POST http://localhost:4000/api/threads/:threadId/replies
  "/:threadId/replies",
  authMiddleware,
  writeLimiter,
  validateParams(threadIdParamsSchema),
  validateBody(createReplySchema),
  asyncHandler(ThreadsController.reply)
);

// delete thread
router.delete( // DELETE http://localhost:4000/api/threads/:threadId
  "/:threadId",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  asyncHandler(ThreadsController.remove)
);

// delete reply
router.delete( // DELETE http://localhost:4000/api/replies/:replyId
  "/replies/:replyId",
  authMiddleware,
  validateParams(replyIdParamsSchema),
  asyncHandler(ThreadsController.removeReply)
);

// update thread visibility
router.patch( // PATCH http://localhost:4000/api/threads/:threadId/visibility
  "/:threadId/visibility",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  validateBody(updateVisibilitySchema),
  asyncHandler(ThreadsController.updateVisibility)
);

// archive thread
router.patch( // PATCH http://localhost:4000/api/threads/:threadId/archive
  "/:threadId/archive",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  asyncHandler(ThreadsController.archive)
);

// unarchive thread
router.patch( // PATCH http://localhost:4000/api/threads/:threadId/unarchive
  "/:threadId/unarchive",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  asyncHandler(ThreadsController.unarchive)
);


module.exports = router;
