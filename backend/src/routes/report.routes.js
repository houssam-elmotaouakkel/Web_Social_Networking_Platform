// backend/src/routes/report.routes.js
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const validateBody = require("../middlewares/validate.middleware");
const { upload } = require("../config/multer");
const { uploadsLimiter } = require("../middlewares/rateLimiters.middleware");
const { submitReportSchema } = require("../validators/report.validators");

const ReportController = require("../controllers/report.controller");

// POST /api/report — submit a problem report (with optional screenshot)
router.post(
  "/",
  authMiddleware,
  uploadsLimiter,
  upload.single("screenshot"),
  validateBody(submitReportSchema),
  asyncHandler(ReportController.submitReport)
);

module.exports = router;
