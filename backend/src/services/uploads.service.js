const fs = require("fs/promises");
const path = require("path");

const User = require("../models/User.model");
const Thread = require("../models/Thread.model");

function isSafeFilename(filename) {
  // Refuse path traversal and path separators
  if (!filename) return false;
  if (filename.includes("..")) return false;
  if (filename.includes("/") || filename.includes("\\")) return false;
  return true;
}

async function deleteMedia({ userId, filename }) {
  if (!isSafeFilename(filename)) {
    const err = new Error("Invalid filename");
    err.status = 400;
    throw err;
  }

  const uploadsDir = process.env.UPLOAD_DIR || "uploads";
  const absolutePath = path.resolve(uploadsDir, filename);

  // Extra hardening: ensure path stays inside uploadsDir
  const uploadsRoot = path.resolve(uploadsDir);
  if (!absolutePath.startsWith(uploadsRoot + path.sep) && absolutePath !== uploadsRoot) {
    const err = new Error("Invalid path");
    err.status = 400;
    throw err;
  }

  const urlPath = `/uploads/${filename}`;

  // 1) Verify ownership: the file must belong to the user (avatar, cover or thread media)
  const [ownsAsAvatar, ownsAsCover, ownsAsMedia] = await Promise.all([
    User.exists({ _id: userId, avatarUrl: urlPath }),
    User.exists({ _id: userId, coverUrl: urlPath }),
    Thread.exists({ authorId: userId, mediaUrls: urlPath }),
  ]);

  if (!ownsAsAvatar && !ownsAsCover && !ownsAsMedia) {
    const err = new Error("Not authorized to delete this file");
    err.status = 403;
    throw err;
  }

  // 2) Remove file if exists
  try {
    await fs.unlink(absolutePath);
  } catch (e) {
    // If not found => 404
    if (e.code === "ENOENT") {
      const err = new Error("File not found");
      err.status = 404;
      throw err;
    }
    throw e;
  }

  // 2) Cleanup DB references owned by the user
  await Promise.all([
    User.updateOne({ _id: userId, avatarUrl: urlPath }, { $set: { avatarUrl: null } }),
    User.updateOne({ _id: userId, coverUrl: urlPath }, { $set: { coverUrl: null } }),
    Thread.updateMany(
      { authorId: userId, mediaUrls: urlPath },
      { $pull: { mediaUrls: urlPath } }
    ),
  ]);

  return { message: "File deleted", url: urlPath };
}

module.exports = { deleteMedia };
