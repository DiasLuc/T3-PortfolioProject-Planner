const request = require("supertest");

const dayReplacementFixture = require("../fixtures/day-replacement.json");
const { getBaseUrl } = require("./getBaseUrl");

async function replaceDay(token, payload = {}) {
  const body = {
    ...dayReplacementFixture,
    ...payload,
    tasks: payload.tasks || dayReplacementFixture.tasks
  };

  return request(getBaseUrl())
    .put("/tasks")
    .set("Content-Type", "application/json")
    .set("Authorization", `Bearer ${token}`)
    .send(body);
}

module.exports = {
  replaceDay
};
