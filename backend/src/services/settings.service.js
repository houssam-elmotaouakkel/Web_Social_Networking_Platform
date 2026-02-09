const User = require("../models/User.model");

function normalizeSettings(userDoc) {
  const prefs = userDoc?.settings?.notificationsPrefs || {};
  return {
    defaultVisibility: userDoc?.defaultVisibility || "PUBLIC",
    notificationsPrefs: {
      followRequest: prefs.followRequest !== false,
      followAccepted: prefs.followAccepted !== false,
      reply: prefs.reply !== false,
      likeThread: prefs.likeThread !== false,
      likeReply: prefs.likeReply !== false,
    },
  };
}

async function getMySettings({ userId }) {
  const user = await User.findById(userId).select("settings defaultVisibility");
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return normalizeSettings(user);
}

async function updateMySettings({ userId, patch }) {
  const update = {};
  if (patch.defaultVisibility) {
    update.defaultVisibility = patch.defaultVisibility;
  }
  if (patch.notificationsPrefs) {
    for (const [k, v] of Object.entries(patch.notificationsPrefs)) {
      update[`settings.notificationsPrefs.${k}`] = v;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true }
  ).select("settings defaultVisibility");

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return normalizeSettings(user);
}

module.exports = { getMySettings, updateMySettings };
