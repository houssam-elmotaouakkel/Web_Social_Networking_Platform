// backend/src/routes/users.routes.js
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const validateBody = require("../middlewares/validate.middleware");
const validateParams = require("../middlewares/validateParams.middleware");


const UsersController = require("../controllers/users.controller");
const { userIdParamsSchema, updateMeSchema, updatePrivacySchema } = require("../validators/users.validators");
const { upload } = require("../config/multer");
const validateQuery = require("../middlewares/validateQuery.middleware");
const { searchQuerySchema, suggestionsQuerySchema } = require("../validators/users.validators");


// Search users: GET /api/users/search?q=xxx&limit=10
router.get(
  "/search",
  authMiddleware,
  validateQuery(searchQuerySchema),
  asyncHandler(UsersController.searchUsers)
);

// Suggested users: GET /api/users/suggestions?limit=5
router.get(
  "/suggestions",
  authMiddleware,
  validateQuery(suggestionsQuerySchema),
  asyncHandler(UsersController.getSuggestedUsers)
);


// Edit me: PATCH http://localhost:4000/api/users/me
router.patch(
  "/me",
  authMiddleware,
  validateBody(updateMeSchema),
  asyncHandler(UsersController.updateMe)
);

router.patch( // PATCH http://localhost:4000/api/users/me/privacy
  "/me/privacy",
  authMiddleware,
  validateBody(updatePrivacySchema),
  asyncHandler(UsersController.updatePrivacy)
);

router.post( // POST http://localhost:4000/api/users/me/avatar
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  asyncHandler(UsersController.uploadAvatar)
);

router.post( // POST http://localhost:4000/api/users/me/cover
  "/me/cover",
  authMiddleware,
  upload.single("cover"),
  asyncHandler(UsersController.uploadCover)
);

// ⚠️ Must be AFTER all /me routes to avoid capturing "me" as :userId
router.get( // GET http://localhost:4000/api/users/:userId
  "/:userId",
  authMiddleware,
  validateParams(userIdParamsSchema),
  asyncHandler(UsersController.getProfile)
);

// User's threads: GET /api/users/:userId/threads?limit=30
router.get(
  "/:userId/threads",
  authMiddleware,
  validateParams(userIdParamsSchema),
  asyncHandler(UsersController.getUserThreads)
);

module.exports = router;
