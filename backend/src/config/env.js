// backend/src/config/env.js
// Fail-fast validation of required environment variables at startup.

const isTest = process.env.NODE_ENV === "test";

const REQUIRED = [
  isTest ? "MONGO_URI_TEST" : "MONGO_URI",
  "JWT_SECRET",
];

const REQUIRED_SMTP = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  // SMTP vars are required only if the forgot-password feature is active
  // (i.e. in non-test env, at least one SMTP var is set → enforce all)
  const hasAnySMTP = REQUIRED_SMTP.some((k) => process.env[k]);
  if (hasAnySMTP) {
    const missingSMTP = REQUIRED_SMTP.filter((k) => !process.env[k]);
    missing.push(...missingSMTP);
  }

  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables:\n  ${missing.join("\n  ")}`
    );
    process.exit(1);
  }

  // Warn if JWT_SECRET is too short (< 32 chars)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn(
      "[ENV] WARNING: JWT_SECRET is shorter than 32 characters. Use a longer secret in production."
    );
  }
}

module.exports = { validateEnv };
