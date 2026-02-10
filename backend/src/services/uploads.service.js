const User = require("../models/User.model");
const Thread = require("../models/Thread.model");
const { deleteByPublicId, publicIdFromUrl } = require("../config/cloudinary");

/**
 * Delete a media file.
 * Accepts either:
 *  - A Cloudinary URL (https://res.cloudinary.com/...)
 *  - A legacy local filename (old /uploads/xxx.jpg references)
 *
 * The :filename route param is kept for backward compat — the frontend
 * can also send a full Cloudinary URL encoded in the body or query.
 */
async function deleteMedia({ userId, filename }) {
  // Build the URL to search in DB — could be a full Cloudinary URL or legacy /uploads/ path
  let urlPath;
  if (filename.startsWith("http")) {
    urlPath = filename;
  } else {
    urlPath = filename.startsWith("/uploads/") ? filename : `/uploads/${filename}`;
  }

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

  // 2) Delete from Cloudinary if it's a Cloudinary URL
  const publicId = publicIdFromUrl(urlPath);
  if (publicId) {
    try {
      await deleteByPublicId(publicId);
    } catch (e) {
      // Ignore Cloudinary errors for already-deleted resources
      console.warn("Cloudinary delete warning:", e.message);
    }
  }

  // 3) Cleanup DB references
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
