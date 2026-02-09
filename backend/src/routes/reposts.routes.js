const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const validateParams = require("../middlewares/validateParams.middleware");

const RepostsController = require("../controllers/reposts.controller");
const { threadIdParamsSchema } = require("../validators/threads.validators");

// GET /api/reposts — get all reposted threads
router.get(
  "/",
  authMiddleware,
  asyncHandler(RepostsController.getReposted)
);

// POST /api/reposts/:threadId — repost a thread
router.post(
  "/:threadId",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  asyncHandler(RepostsController.repost)
);

// DELETE /api/reposts/:threadId — unrepost a thread
router.delete(
  "/:threadId",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  asyncHandler(RepostsController.unrepost)
);

module.exports = router;
