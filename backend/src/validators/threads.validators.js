// backend/src/validators/threads.validators.js
const { z } = require("zod");

const createThreadSchema = z.object({
  content: z.string().trim().max(2000).optional().default(""),

  // accepte "/uploads/xxx.jpg" ou une URL complète
  mediaUrls: z
    .array(
      z
        .string()
        .trim()
        .refine(
          (v) =>
            v.startsWith("/uploads/") ||
            /^https?:\/\/.+/i.test(v),
          "mediaUrl must be a '/uploads/...' path or a full http(s) URL"
        )
    )
    .optional()
    .default([]),

  visibility: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]).optional().default("PUBLIC"),
}).refine(
  (data) => data.content.length > 0 || data.mediaUrls.length > 0,
  { message: "Thread must have content or at least one media", path: ["content"] }
);

const updateVisibilitySchema = z.object({
  visibility: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]),
});


const threadIdParamsSchema = z.object({
  threadId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
});

const trendingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

const repliesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

module.exports = { createThreadSchema, threadIdParamsSchema, trendingQuerySchema, updateVisibilitySchema, repliesQuerySchema };
