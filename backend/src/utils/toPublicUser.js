// backend/src/utils/toPublicUser.js

/**
 * Strips sensitive fields from a Mongoose User document.
 * Shared across auth.service and users.service.
 */
function toPublicUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    username: userDoc.username,
    email: userDoc.email,
    bio: userDoc.bio,
    avatarUrl: userDoc.avatarUrl,
    coverUrl: userDoc.coverUrl,
    isPrivate: userDoc.isPrivate,
    defaultVisibility: userDoc.defaultVisibility || "PUBLIC",
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

module.exports = toPublicUser;
