// tests/follows.test.js
const request = require("supertest");
const app = require("../src/app");
const { registerUser, loginUser, bearer } = require("./helpers");

describe("Follows", () => {
  it("private follow request -> accept -> unfollow", async () => {
    // A (private)
    const regA = await registerUser({
      username: "user_a_test",
      email: "a@test.com",
      password: "Password123!",
    });
    expect(regA.statusCode).toBe(201);
    const userAId = regA.body.user.id;

    const loginA = await loginUser({ email: "a@test.com", password: "Password123!" });
    expect(loginA.statusCode).toBe(200);
    const tokenA = loginA.body.token;

    // set A private
    const setPrivate = await request(app)
      .patch("/api/users/me/privacy")
      .set(bearer(tokenA))
      .send({ isPrivate: true });
    expect(setPrivate.statusCode).toBe(200);

    // B
    const regB = await registerUser({
      username: "user_b_test",
      email: "b@test.com",
      password: "Password123!",
    });
    expect(regB.statusCode).toBe(201);

    const loginB = await loginUser({ email: "b@test.com", password: "Password123!" });
    expect(loginB.statusCode).toBe(200);
    const tokenB = loginB.body.token;

    // B sends follow request to A (private => should be pending/requested)
    const followReq = await request(app)
      .post(`/api/users/${userAId}/follow`)
      .set(bearer(tokenB));

    expect([200, 201]).toContain(followReq.statusCode);

    // A lists received requests (IMPORTANT: correct URL in your API)
    const myReq = await request(app)
      .get("/api/follow-requests")
      .set(bearer(tokenA));

    expect(myReq.statusCode).toBe(200);
    expect(myReq.body).toHaveProperty("requests");
    expect(myReq.body.requests.length).toBeGreaterThan(0);

    // the API returns requestId (not id)
    const requestId = myReq.body.requests[0].requestId;


    // A accepts (IMPORTANT: correct URL in your API)
    const accept = await request(app)
      .post(`/api/follow-requests/${requestId}/accept`)
      .set(bearer(tokenA));

    expect(accept.statusCode).toBe(200);

    // B unfollows
    const unfollow = await request(app)
      .delete(`/api/users/${userAId}/follow`)
      .set(bearer(tokenB));

    expect(unfollow.statusCode).toBe(200);
  });
});
