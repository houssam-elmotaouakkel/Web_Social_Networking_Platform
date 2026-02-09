// backend/src/validators/follows.validators.js
const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const followUserParamsSchema = z.object({
  userId: objectIdSchema,
});

const requestIdParamsSchema = z.object({
  requestId: objectIdSchema,
});

// --- Merged from followsExtra.validators.js ---
const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 50))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 100, "limit must be 1..100"),
});

const followRequestsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 20))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 100, "limit must be 1..100"),
});

module.exports = {
  followUserParamsSchema,
  requestIdParamsSchema,
  listQuerySchema,
  followRequestsQuerySchema,
};
