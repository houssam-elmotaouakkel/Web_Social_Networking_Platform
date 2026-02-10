// backend/src/routes/uploads.routes.js 
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middlewares/auth.middleware");
const { upload } = require("../config/multer");
const validateParams = require("../middlewares/validateParams.middleware");

const UploadsController = require("../controllers/uploads.controller");
const { filenameParamsSchema } = require("../validators/uploads.validators");
const { uploadsLimiter } = require("../middlewares/rateLimiters.middleware");
const { uploadBuffer } = require("../config/cloudinary");


// Thread media upload: POST http://localhost:4000/api/uploads/thread-media
router.post(
  "/thread-media",
  authMiddleware,
  uploadsLimiter,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { url } = await uploadBuffer(req.file.buffer, { folder: "nexora/threads" });
    return res.status(201).json({ url });
  })
);


// DELETE file: DELETE http://localhost:4000/api/uploads/:filename
router.delete(
  "/:filename",
  authMiddleware,
  validateParams(filenameParamsSchema),
  asyncHandler(UploadsController.remove)
);


module.exports = router;
