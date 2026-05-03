const request = require("supertest");

const taskFixture = require("../fixtures/task.json");
const { getBaseUrl } = require("./getBaseUrl");

async function createTask(token, taskData = {}) {
  const body = { ...taskFixture, ...taskData };

  return request(getBaseUrl())
    .post("/tasks")
    .set("Content-Type", "application/json")
    .set("Authorization", `Bearer ${token}`)
    .send(body);
}

module.exports = {
  createTask
};
