const multer = require("multer");

const maxMb = Number(process.env.MAX_FILE_SIZE_MB || 10);
const maxBytes = maxMb * 1024 * 1024;

const allowed = (process.env.ALLOWED_IMAGE_MIME || "image/jpeg,image/png,image/webp")
  .split(",")
  .map((s) => s.trim());

// Use memory storage — files are buffered in RAM then uploaded to Cloudinary
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxBytes },
});

module.exports = { upload };
