const { expect } = require("chai");

const { registerUser } = require("./helpers/registerUser");
const { getToken } = require("./helpers/getToken");
const { getTasksForDay } = require("./helpers/getTasksForDay");
const { expectErrorResponse } = require("./helpers/expectErrorResponse");

describe("KAN-6 Retrieve tasks for a day", function () {
  describe("authenticated requests", function () {
    let token;

    beforeEach(async function () {
      token = await getToken("alice", "planner123");
    });

    it("KAN-33 should retrieve all tasks for a day successfully", async function () {
      const response = await getTasksForDay(token, "2026-05-01");

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Tasks retrieved successfully");
      expect(response.body.date).to.equal("2026-05-01");
      expect(response.body.tasks).to.have.lengthOf(3);
      expect(response.body.tasks[0]).to.deep.equal({
        id: "task-0001",
        userId: "user-001",
        date: "2026-05-01",
        startTime: "07:00",
        endTime: "07:45",
        title: "Stretching",
        notes: "Living room routine"
      });
    });

    it("KAN-34 should return only tasks that belong to the authenticated user", async function () {
      const response = await getTasksForDay(token, "2026-05-01");

      expect(response.status).to.equal(200);
      expect(response.body.tasks.every((task) => task.userId === "user-001")).to.equal(true);
      expect(response.body.tasks.some((task) => task.id === "task-0011")).to.equal(false);
    });

    it("KAN-36 should reject task retrieval when date format is invalid", async function () {
      const response = await getTasksForDay(token, "05-01-2026");

      expectErrorResponse(response, {
        statusCode: 400,
        error: "ValidationError",
        message: "Date must use YYYY-MM-DD format"
      });
    });
  });

  it("KAN-35 should retrieve an empty task list for a day with no tasks", async function () {
    await registerUser("empty_day_user", "planner123");
    const token = await getToken("empty_day_user", "planner123");
    const response = await getTasksForDay(token, "2026-05-04");

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      message: "Tasks retrieved successfully",
      date: "2026-05-04",
      tasks: []
    });
  });

  it("KAN-37 should reject task retrieval without an authorization token", async function () {
    const response = await getTasksForDay(undefined, "2026-05-01");

    expectErrorResponse(response, {
      statusCode: 401,
      error: "AuthenticationError",
      message: "Authorization token is required"
    });
  });
});
