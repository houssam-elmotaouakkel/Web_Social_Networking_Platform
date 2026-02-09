const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const validateParams = require("../middlewares/validateParams.middleware");

const SavesController = require("../controllers/saves.controller");
const { threadIdParamsSchema } = require("../validators/threads.validators");

// GET /api/saves — get all saved threads
router.get(
  "/",
  authMiddleware,
  asyncHandler(SavesController.getSaved)
);

// POST /api/saves/:threadId — save a thread
router.post(
  "/:threadId",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  asyncHandler(SavesController.save)
);

// DELETE /api/saves/:threadId — unsave a thread
router.delete(
  "/:threadId",
  authMiddleware,
  validateParams(threadIdParamsSchema),
  asyncHandler(SavesController.unsave)
);

module.exports = router;
