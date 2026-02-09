// backend/src/controllers/report.controller.js
const ReportService = require("../services/report.service");
const User = require("../models/User.model");

async function submitReport(req, res) {
  const { message } = req.body;

  const user = await User.findById(req.user.id).select("username email").lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await ReportService.sendReport({
    userId: req.user.id,
    username: user.username,
    email: user.email,
    message,
    file: req.file || null,
  });

  return res.status(200).json({ message: "Report sent successfully" });
}

module.exports = { submitReport };
