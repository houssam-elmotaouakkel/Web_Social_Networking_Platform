// backend/src/validators/report.validators.js
const { z } = require("zod");

const submitReportSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long (max 2000 characters)"),
});

module.exports = { submitReportSchema };
