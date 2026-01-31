// tests/notifications.test.js
const request = require("supertest");
const app = require("../src/app");
const { registerUser, loginUser, bearer } = require("./helpers");

describe("Notifications", () => {
  it("unread-count increases then becomes 0 after read-all", async () => {
    // A (will receive notifications)
    await registerUser({
      username: "notif_user_a",
      email: "na@test.com",
      password: "Password123!",
    });
    const loginA = await loginUser({ email: "na@test.com", password: "Password123!" });
    const tokenA = loginA.body.token;

    // B triggers a notification by replying on A's thread
    await registerUser({
      username: "notif_user_b",
      email: "nb@test.com",
      password: "Password123!",
    });
    const loginB = await loginUser({ email: "nb@test.com", password: "Password123!" });
    const tokenB = loginB.body.token;

    const threadRes = await request(app)
      .post("/api/threads")
      .set(bearer(tokenA))
      .send({ content: "notif thread", mediaUrls: [], visibility: "PUBLIC" });

    const threadId = threadRes.body.thread.id;

    await request(app)
      .post(`/api/threads/${threadId}/replies`)
      .set(bearer(tokenB))
      .send({ content: "trigger notif" });

    // unread-count should be >= 1
    const unread = await request(app)
      .get("/api/notifications/unread-count")
      .set(bearer(tokenA));

    expect(unread.statusCode).toBe(200);
    expect(unread.body).toHaveProperty("unreadCount");
    expect(unread.body.unreadCount).toBeGreaterThanOrEqual(1);

    // mark all read
    const readAll = await request(app)
      .patch("/api/notifications/read-all")
      .set(bearer(tokenA));

    expect(readAll.statusCode).toBe(200);

    const unread2 = await request(app)
      .get("/api/notifications/unread-count")
      .set(bearer(tokenA));

    expect(unread2.statusCode).toBe(200);
    expect(unread2.body.unreadCount).toBe(0);
  });
});
