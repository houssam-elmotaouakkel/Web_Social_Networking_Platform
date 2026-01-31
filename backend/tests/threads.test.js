// tests/threads.test.js
const request = require("supertest");
const app = require("../src/app");
const { registerUser, loginUser, bearer } = require("./helpers");

describe("Threads", () => {
  it("create thread -> reply -> delete reply (owner) -> forbidden for other", async () => {
    // User A creates thread
    await registerUser({
      username: "thread_user_a",
      email: "ta@test.com",
      password: "Password123!",
    });
    const loginA = await loginUser({ email: "ta@test.com", password: "Password123!" });
    const tokenA = loginA.body.token;

    const threadRes = await request(app)
      .post("/api/threads")
      .set(bearer(tokenA))
      .send({ content: "hello", mediaUrls: [], visibility: "PUBLIC" });

    expect(threadRes.statusCode).toBe(201);
    const threadId = threadRes.body.thread.id;

    // User B replies
    await registerUser({
      username: "thread_user_b",
      email: "tb@test.com",
      password: "Password123!",
    });
    const loginB = await loginUser({ email: "tb@test.com", password: "Password123!" });
    const tokenB = loginB.body.token;

    const replyRes = await request(app)
      .post(`/api/threads/${threadId}/replies`)
      .set(bearer(tokenB))
      .send({ content: "reply here" });

    expect(replyRes.statusCode).toBe(201);
    const replyId = replyRes.body.reply.id;

    // B deletes its reply
    const delOwn = await request(app)
      .delete(`/api/replies/${replyId}`)
      .set(bearer(tokenB));

    expect(delOwn.statusCode).toBe(200);

    // Re-create reply so A tries to delete B's reply (forbidden)
    const replyRes2 = await request(app)
      .post(`/api/threads/${threadId}/replies`)
      .set(bearer(tokenB))
      .send({ content: "reply 2" });

    const replyId2 = replyRes2.body.reply.id;

    const delOther = await request(app)
      .delete(`/api/replies/${replyId2}`)
      .set(bearer(tokenA));

    expect(delOther.statusCode).toBe(403);
  });
});
