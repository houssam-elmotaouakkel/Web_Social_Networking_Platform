// backend/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const path = require("path");
const crypto = require("node:crypto");
const uploadsDir = process.env.UPLOAD_DIR || "uploads";

const app = express();

// Reduce fingerprinting
app.disable("x-powered-by");

// Global middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS middleware
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false, // JWT in Authorization header -> no cookies needed
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);  

// JSON middleware
app.use(express.json({ limit: "1mb" }));

// URL-encoded middleware
app.use(express.urlencoded({ extended: true }));

// Request ID for tracing
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});

// Morgan middleware
morgan.token("rid", (req) => req.id);

const format =
  process.env.NODE_ENV === "production"
    ? "combined"
    : "[:date[iso]] :rid :method :url :status :response-time ms";

app.use(morgan(format));

// if behind a reverse proxy in production (render/heroku/nginx)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
// Global rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res.status(429).json({
        message: "Too many requests, please try again later.",
        code: "RATE_LIMITED",
        requestId: req.id,
      });
    },
  })
);


// Route principale
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API platform social web !'
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});


app.use("/api", require("./routes"));
app.use("/uploads", express.static(path.resolve(uploadsDir)));



// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// CORS error handler
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked for this origin" });
  }
  return next(err);
});


// Error-handling MW
app.use((err, req, res, next) => {
  console.error("[ERROR]", req.id, err);

  // If headers already sent, delegate to Express default handler
  if (res.headersSent) return next(err);

  let status = err.statusCode || err.status || 500;
  let code = err.codeName || err.code || "INTERNAL_ERROR";
  let message = err.message || "Internal server error";
  let details;

  // Mongoose: invalid ObjectId cast -> 400
  if (err.name === "CastError") {
    status = 400;
    code = "INVALID_ID";
    message = "Invalid identifier";
  }

  // Mongoose validation -> 400
  if (err.name === "ValidationError") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
  }

  // Mongo duplicate key -> 409
  if (err.code === 11000) {
    status = 409;
    code = "DUPLICATE_KEY";
    message = "Duplicate value";
    details = err.keyValue || undefined;
  }

  const isProd = process.env.NODE_ENV === "production";
  if (isProd && status === 500) {
    message = "Internal server error";
    details = undefined;
  }
  return res.status(status).json({
    message,
    code,
    requestId: req.id,
    ...(details ? { details } : {}),
  });
});

module.exports = app;
