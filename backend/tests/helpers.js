// tests/helpers.js
const request = require("supertest");
const app = require("../src/app");

async function registerUser({ username, email, password }) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ username, email, password });

  return res;
}

async function loginUser({ email, password }) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return res;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { registerUser, loginUser, bearer };
