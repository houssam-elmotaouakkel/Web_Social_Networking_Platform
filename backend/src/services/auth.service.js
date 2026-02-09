// backend/src/services/auth.service.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const { transporter, FROM } = require("../config/mailer");
const toPublicUser = require("../utils/toPublicUser");

const BCRYPT_ROUNDS = 12;

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is missing");
    err.status = 500;
    throw err;
  }

  return jwt.sign(
    { sub: userId.toString() },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register({ username, email, password }) {
  const normalizedEmail = email.toLowerCase();

  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username }]
  });

  if (existing) {
    const err = new Error("Email or username already in use");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    username,
    email: normalizedEmail,
    passwordHash
  });

  const token = signToken(user._id);
  return { token, user: toPublicUser(user) };
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = signToken(user._id);
  return { token, user: toPublicUser(user) };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return toPublicUser(user);
}

async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    const err = new Error("Current password is incorrect");
    err.status = 400;
    throw err;
  }

  // B8: Block reusing the same password
  const isSame = await bcrypt.compare(newPassword, user.passwordHash);
  if (isSame) {
    const err = new Error("New password must be different from current password");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.passwordHash = passwordHash;
  user.passwordChangedAt = new Date();
  await user.save();

  // Return a fresh token so the user stays logged in
  const token = signToken(user._id);
  return { message: "Password changed successfully", token };
}

async function forgotPassword({ email }) {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Always return success to avoid email enumeration
  if (!user) {
    return { message: "If this email exists, a reset link has been sent." };
  }

  // Generate a random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Build reset URL
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // Send email
  try {
    await transporter.sendMail({
      from: FROM,
      to: user.email,
      subject: "Nexora — Reset your password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1d9bf0">Reset your password</h2>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to set a new one:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#1d9bf0;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Reset Password</a>
          <p style="color:#666;font-size:13px">This link expires in 1 hour. If you didn't request this, just ignore this email.</p>
        </div>
      `,
    });
  } catch {
    // Silently fail — don't reveal email sending issues
  }

  return { message: "If this email exists, a reset link has been sent." };
}

async function resetPassword({ token, newPassword }) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    const err = new Error("Invalid or expired reset token");
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.passwordHash = passwordHash;
  user.passwordChangedAt = new Date();
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  const jwtToken = signToken(user._id);
  return { message: "Password reset successfully", token: jwtToken, user: toPublicUser(user) };
}

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword };
