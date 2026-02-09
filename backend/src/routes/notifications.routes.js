//src/routes/notifications.routes.js
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const validateQuery = require("../middlewares/validateQuery.middleware");
const validateParams = require("../middlewares/validateParams.middleware");

const NotificationsController = require("../controllers/notifications.controller");
const {
  notificationsQuerySchema,
  notificationIdParamsSchema,
} = require("../validators/notifications.validators");

router.get( // GET http://localhost:4000/api/notifications
  "/",
  authMiddleware,
  validateQuery(notificationsQuerySchema),
  asyncHandler(NotificationsController.list)
);

router.get( // GET http://localhost:4000/api/notifications/unread-count
  "/unread-count",
  authMiddleware,
  asyncHandler(NotificationsController.unreadCount)
);

router.patch( // PATCH http://localhost:4000/api/notifications/:notificationId/read
  "/:notificationId/read",
  authMiddleware,
  validateParams(notificationIdParamsSchema),
  asyncHandler(NotificationsController.markRead)
);

router.patch( // PATCH http://localhost:4000/api/notifications/read-all
  "/read-all",
  authMiddleware,
  asyncHandler(NotificationsController.markAllRead)
);

router.delete( // DELETE http://localhost:4000/api/notifications
  "/",
  authMiddleware,
  asyncHandler(NotificationsController.deleteAll)
);

module.exports = router;
