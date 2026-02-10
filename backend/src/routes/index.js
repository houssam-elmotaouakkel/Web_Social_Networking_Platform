// backend/src/routes/index.js
const express = require("express");
const router = express.Router();


const authRoutes = require("./auth.routes");
const followsRoutes = require("./follows.routes");
const usersRoutes = require("./users.routes");
const threadsRoutes = require("./threads.routes");
const reactionsRoutes = require("./reactions.routes");
const feedRoutes = require("./feed.routes");
const notificationsRoutes = require("./notifications.routes");
const uploadsRoutes = require("./uploads.routes");
const settingsRoutes = require("./settings.routes");
const reportRoutes = require("./report.routes");
const savesRoutes = require("./saves.routes");
const repostsRoutes = require("./reposts.routes");
// followsExtraRoutes removed - merged into follows.routes.js



router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

router.use("/follows", followsRoutes); 
// /social routes removed - now available at /follows/users/:userId/followers and /follows/users/:userId/following

router.use("/threads", threadsRoutes);
router.use("/reactions", reactionsRoutes);
router.use("/feed", feedRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/uploads", uploadsRoutes);
router.use("/settings", settingsRoutes);
router.use("/report", reportRoutes);
router.use("/saves", savesRoutes);
router.use("/reposts", repostsRoutes);

// ⚠️ TEMPORARY — remove after migration
router.use("/", require("./migrate.routes"));


module.exports = router;

