// backend/src/validators/users.validators.js
const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const userIdParamsSchema = z.object({
  userId: objectIdSchema,
});

const updatePrivacySchema = z.object({
  isPrivate: z.boolean(),
});

const updateMeSchema = z.object({
  username: z.string().trim().min(3).max(30).optional(),
  bio: z.string().trim().max(300).optional(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1).max(50),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const suggestionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

module.exports = { userIdParamsSchema, updatePrivacySchema, updateMeSchema, searchQuerySchema, suggestionsQuerySchema };
