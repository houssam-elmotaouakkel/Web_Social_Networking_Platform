// backend/src/validators/settings.validators.js
const { z } = require("zod");

const updateSettingsSchema = z.object({
  defaultVisibility: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]).optional(),
  notificationsPrefs: z
    .object({
      followRequest: z.boolean().optional(),
      followAccepted: z.boolean().optional(),
      reply: z.boolean().optional(),
      likeThread: z.boolean().optional(),
      likeReply: z.boolean().optional(),
    })
    .optional(),
});

module.exports = { updateSettingsSchema };
