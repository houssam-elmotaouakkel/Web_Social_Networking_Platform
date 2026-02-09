// backend/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const validateBody = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const { authLimiter, registerLimiter } = require("../middlewares/rateLimiters.middleware");


const AuthController = require("../controllers/auth.controller");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require("../validators/auth.validators");

router.post(
    "/register",
    registerLimiter,
    validateBody(registerSchema),
    asyncHandler(AuthController.register)
);
router.post(
    "/login",
    authLimiter,
    validateBody(loginSchema),
    asyncHandler(AuthController.login)
);
router.get(
    "/me",
    authMiddleware,
    asyncHandler(AuthController.me)
);
router.patch(
    "/change-password",
    authMiddleware,
    validateBody(changePasswordSchema),
    asyncHandler(AuthController.changePassword)
);
router.post(
    "/forgot-password",
    authLimiter,
    validateBody(forgotPasswordSchema),
    asyncHandler(AuthController.forgotPassword)
);
router.post(
    "/reset-password",
    authLimiter,
    validateBody(resetPasswordSchema),
    asyncHandler(AuthController.resetPassword)
);

module.exports = router;
