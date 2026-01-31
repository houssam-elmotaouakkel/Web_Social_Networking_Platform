const { connectDB, disconnectDB, resetTestDB } = require("../src/config/database");

beforeAll(async () => {
  // Optional: silence error logs during tests (keeps output clean)
  jest.spyOn(console, "error").mockImplementation(() => {});
  // If you also want to silence normal logs:
  // jest.spyOn(console, "log").mockImplementation(() => {});

  await connectDB(); // uses MONGO_URI_TEST because NODE_ENV=test
});

beforeEach(async () => {
  await resetTestDB(); // isolate each test
});

afterAll(async () => {
  await disconnectDB();

  // Restore console methods
  if (console.error.mockRestore) console.error.mockRestore();
  // if (console.log.mockRestore) console.log.mockRestore();
});
