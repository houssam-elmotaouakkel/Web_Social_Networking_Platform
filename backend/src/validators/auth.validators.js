// backend/src/validators/auth.validators.js
const { z } = require("zod");

// At least 1 uppercase, 1 lowercase, 1 digit, 1 special character
const strongPassword = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const registerSchema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.string().trim().email(),
  password: strongPassword
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(72),
  newPassword: strongPassword
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: strongPassword
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
