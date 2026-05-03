const request = require("supertest");

const taskFixture = require("../fixtures/task.json");
const { getBaseUrl } = require("./getBaseUrl");

async function updateTask(token, taskId, taskData = {}) {
  const body = { ...taskFixture, ...taskData };

  return request(getBaseUrl())
    .put(`/tasks/${taskId}`)
    .set("Content-Type", "application/json")
    .set("Authorization", `Bearer ${token}`)
    .send(body);
}

module.exports = {
  updateTask
};
