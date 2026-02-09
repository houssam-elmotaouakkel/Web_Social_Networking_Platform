// backend/src/server.js
require("dotenv").config();
const { validateEnv } = require("./config/env");
validateEnv(); // fail-fast if critical vars are missing

const app = require("./app");
const {
  connectDB,
  registerDbEvents,
  registerGracefulShutdown,
} = require("./config/database");

async function bootstrap() {
  registerDbEvents(); // DB connection events (optional but useful)
  await connectDB(process.env.MONGO_URI);
  
  const port = process.env.PORT || 4000;
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`[SYS] API listening on port ${port}`);
  });

  // Graceful shutdown: close HTTP server + disconnect Mongo
  registerGracefulShutdown({ server });

  // Handle process-level errors
  process.on("unhandledRejection", (reason) => {
    console.error("[SYS] Unhandled Rejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    console.error("[SYS] Uncaught Exception:", err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("[SYS] Failed to start server:", err);
  process.exit(1);
});
