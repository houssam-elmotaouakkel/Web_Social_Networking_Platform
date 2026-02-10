// backend/src/routes/migrate.routes.js
// ⚠️ TEMPORARY — one-time migration endpoint. Remove after use.
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const User = require("../models/User.model");
const Thread = require("../models/Thread.model");

const UPLOADS_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");

router.post("/migrate-uploads", async (req, res) => {
  // Simple secret to prevent unauthorized calls
  const secret = req.headers["x-migrate-secret"];
  if (secret !== process.env.JWT_SECRET) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const results = { migrated: 0, skipped: 0, failed: 0, details: [] };

  try {
    // Check that local uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json({ message: "No uploads directory found", results });
    }

    const localFiles = fs.readdirSync(UPLOADS_DIR).filter(f => !f.startsWith("."));
    if (localFiles.length === 0) {
      return res.json({ message: "No files to migrate", results });
    }

    // Helper: upload one file to Cloudinary
    async function uploadToCloud(filePath, folder) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "image",
      });
      return result.secure_url;
    }

    // 1. Migrate user avatars
    const usersWithAvatar = await User.find({
      avatarUrl: { $regex: /^\/uploads\// },
    }).select("_id username avatarUrl");

    for (const user of usersWithAvatar) {
      const filename = user.avatarUrl.replace("/uploads/", "");
      const localPath = path.join(UPLOADS_DIR, filename);
      if (!fs.existsSync(localPath)) {
        await User.updateOne({ _id: user._id }, { $set: { avatarUrl: null } });
        results.skipped++;
        results.details.push(`avatar ${filename}: file missing, cleared`);
        continue;
      }
      try {
        const url = await uploadToCloud(localPath, "nexora/avatars");
        await User.updateOne({ _id: user._id }, { $set: { avatarUrl: url } });
        results.migrated++;
        results.details.push(`avatar ${filename} → ${url}`);
      } catch (e) {
        results.failed++;
        results.details.push(`avatar ${filename}: FAILED - ${e.message}`);
      }
    }

    // 2. Migrate user covers
    const usersWithCover = await User.find({
      coverUrl: { $regex: /^\/uploads\// },
    }).select("_id username coverUrl");

    for (const user of usersWithCover) {
      const filename = user.coverUrl.replace("/uploads/", "");
      const localPath = path.join(UPLOADS_DIR, filename);
      if (!fs.existsSync(localPath)) {
        await User.updateOne({ _id: user._id }, { $set: { coverUrl: null } });
        results.skipped++;
        results.details.push(`cover ${filename}: file missing, cleared`);
        continue;
      }
      try {
        const url = await uploadToCloud(localPath, "nexora/covers");
        await User.updateOne({ _id: user._id }, { $set: { coverUrl: url } });
        results.migrated++;
        results.details.push(`cover ${filename} → ${url}`);
      } catch (e) {
        results.failed++;
        results.details.push(`cover ${filename}: FAILED - ${e.message}`);
      }
    }

    // 3. Migrate thread mediaUrls
    const threads = await Thread.find({
      mediaUrls: { $elemMatch: { $regex: /^\/uploads\// } },
    }).select("_id mediaUrls");

    for (const thread of threads) {
      const newUrls = [];
      let changed = false;

      for (const url of thread.mediaUrls) {
        if (!url.startsWith("/uploads/")) {
          newUrls.push(url);
          continue;
        }
        const filename = url.replace("/uploads/", "");
        const localPath = path.join(UPLOADS_DIR, filename);
        if (!fs.existsSync(localPath)) {
          results.skipped++;
          results.details.push(`thread ${thread._id} ${filename}: file missing, removed`);
          changed = true;
          continue;
        }
        try {
          const cloudUrl = await uploadToCloud(localPath, "nexora/threads");
          newUrls.push(cloudUrl);
          results.migrated++;
          results.details.push(`thread ${thread._id} ${filename} → ${cloudUrl}`);
          changed = true;
        } catch (e) {
          newUrls.push(url);
          results.failed++;
          results.details.push(`thread ${thread._id} ${filename}: FAILED - ${e.message}`);
        }
      }

      if (changed) {
        await Thread.updateOne({ _id: thread._id }, { $set: { mediaUrls: newUrls } });
      }
    }

    return res.json({ message: "Migration complete", results });
  } catch (err) {
    return res.status(500).json({ message: "Migration error", error: err.message, results });
  }
});

module.exports = router;
