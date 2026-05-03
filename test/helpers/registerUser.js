const request = require("supertest");

const authFixture = require("../fixtures/auth.json");
const { getBaseUrl } = require("./getBaseUrl");

async function registerUser(username, password) {
  const body = { ...authFixture, username, password };

  return request(getBaseUrl())
    .post("/auth/register")
    .set("Content-Type", "application/json")
    .send(body);
}

module.exports = {
  registerUser
};
