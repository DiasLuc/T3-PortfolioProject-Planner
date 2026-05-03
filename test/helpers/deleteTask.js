const request = require("supertest");
const { getBaseUrl } = require("./getBaseUrl");

async function deleteTask(token, taskId) {
  const req = request(getBaseUrl())
    .delete(`/tasks/${taskId}`)
    .set("Content-Type", "application/json");

  if (token !== undefined) {
    req.set("Authorization", `Bearer ${token}`);
  }

  return req;
}

module.exports = {
  deleteTask
};
