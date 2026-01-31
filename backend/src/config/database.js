// backend/src/config/database.js

const mongoose = require("mongoose");

let isConnected = false;

async function connectDB(mongoUri) {
  const uri =
    mongoUri ||
    (process.env.NODE_ENV === "test"
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI);

  if (!uri) {
    throw new Error("Mongo URI is missing in environment variables.");
  }

  if (isConnected) return mongoose.connection;

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    autoIndex: process.env.NODE_ENV !== "production",
  });

  isConnected = true;
  return mongoose.connection;
}



async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

function registerDbEvents() {
  const conn = mongoose.connection;

  conn.on("connected", () => {
    console.log("[DB] MongoDB connected");
  });

  conn.on("error", (err) => {
    console.error("[DB] MongoDB connection error:", err);
  });

  conn.on("disconnected", () => {
    console.warn("[DB] MongoDB disconnected");
  });
}

function registerGracefulShutdown({ server } = {}) {
  const shutdown = async (signal) => {
    try {
      console.log(`[SYS] Received ${signal}. Shutting down...`);
      if (server && typeof server.close === "function") {
        await new Promise((resolve) => server.close(resolve));
      }

      await disconnectDB();
      console.log("[SYS] Shutdown complete.");
      process.exit(0);
    } catch (err) {
      console.error("[SYS] Shutdown error:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

async function resetTestDB() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("resetTestDB can only run in test environment");
  }

  const conn = mongoose.connection;
  if (!conn || conn.readyState !== 1) return;

  // Clear collections instead of dropping the whole DB (avoids parallel drop conflicts)
  const collections = Object.values(conn.collections);
  await Promise.all(collections.map((c) => c.deleteMany({})));
}



module.exports = {
  connectDB,
  disconnectDB,
  registerDbEvents,
  registerGracefulShutdown,
  resetTestDB,
};
