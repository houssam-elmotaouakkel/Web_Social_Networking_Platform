// backend/src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if password was changed after this token was issued
    const user = await User.findById(payload.sub).select("passwordChangedAt").lean();
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (user.passwordChangedAt) {
      const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (payload.iat < changedAtSec) {
        return res.status(401).json({ message: "Password was changed. Please log in again." });
      }
    }

    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
