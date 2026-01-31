// tests/auth.test.js
const request = require("supertest");
const app = require("../src/app");
const { registerUser, loginUser, bearer } = require("./helpers");

describe("Auth", () => {
  it("register -> 201 and returns user", async () => {
    const res = await registerUser({
      username: "user1",
      email: "user1@test.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("email", "user1@test.com");
  });

  it("login -> 200 and returns token", async () => {
    await registerUser({
      username: "user2",
      email: "user2@test.com",
      password: "Password123!",
    });

    const res = await loginUser({
      email: "user2@test.com",
      password: "Password123!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("me -> 200 returns profile", async () => {
    await registerUser({
      username: "user3",
      email: "user3@test.com",
      password: "Password123!",
    });

    const login = await loginUser({
      email: "user3@test.com",
      password: "Password123!",
    });

    const token = login.body.token;

    const me = await request(app)
      .get("/api/auth/me")
      .set(bearer(token));

    expect(me.statusCode).toBe(200);
    expect(me.body).toHaveProperty("user");
    expect(me.body.user).toHaveProperty("email", "user3@test.com");
  });
});
