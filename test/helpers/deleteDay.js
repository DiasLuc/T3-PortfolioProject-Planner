const request = require("supertest");
const { getBaseUrl } = require("./getBaseUrl");

async function deleteDay(token, date) {
  const req = request(getBaseUrl())
    .delete(`/tasks/day/${date}`)
    .set("Content-Type", "application/json");

  if (token !== undefined) {
    req.set("Authorization", `Bearer ${token}`);
  }

  return req;
}

module.exports = {
  deleteDay
};
