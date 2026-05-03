const { expect } = require("chai");

const { getToken } = require("./helpers/getToken");
const { createTask } = require("./helpers/createTask");
const { expectErrorResponse } = require("./helpers/expectErrorResponse");

describe("KAN-5 Create planner tasks", function () {
  let token;

  function expectTaskToInclude(responseTask, expectedTask) {
    expect(responseTask).to.include(expectedTask);
    expect(responseTask.id).to.match(/^task-\d{4}$/);
  }

  beforeEach(async function () {
    token = await getToken("alice", "planner123");
  });

  it("KAN-27 should create a task successfully for the authenticated user", async function () {

    const response = await createTask(token, {
      date: "2026-05-01",
      startTime: "12:30",
      endTime: "13:00",
      title: "Grocery pickup",
      notes: "Collect vegetables and fruit after lunch"
    });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("Task created successfully");
    expectTaskToInclude(response.body.task, {
      userId: "user-001",
      date: "2026-05-01",
      startTime: "12:30",
      endTime: "13:00",
      title: "Grocery pickup",
      notes: "Collect vegetables and fruit after lunch"
    });
  });

  it("KAN-28 should create a task successfully for a past date", async function () {
    const response = await createTask(token, {
      date: "2025-12-01",
      startTime: "08:00",
      endTime: "09:00",
      title: "Retro note",
      notes: "Log what was done that day"
    });

    expect(response.status).to.equal(201);
    expectTaskToInclude(response.body.task, {
      userId: "user-001",
      date: "2025-12-01",
      startTime: "08:00",
      endTime: "09:00",
      title: "Retro note",
      notes: "Log what was done that day"
    });
  });

  it("KAN-29 should reject task creation when end time is not after start time", async function () {
    const response = await createTask(token, {
      date: "2026-05-01",
      startTime: "13:00",
      endTime: "12:30",
      title: "Broken schedule"
    });

    expectErrorResponse(response, {
      statusCode: 400,
      error: "ValidationError",
      message: "End time must be after start time"
    });
  });

  it("KAN-30 should reject task creation when title is missing", async function () {
    const response = await createTask(token, {
      date: "2026-05-01",
      startTime: "12:30",
      endTime: "13:00"
    });

    expectErrorResponse(response, {
      statusCode: 400,
      error: "ValidationError",
      message: "Title is required"
    });
  });

  describe("overlap handling", function () {
    beforeEach(function () {
      global.testDb.seedTask({
        userId: "user-001",
        date: "2026-05-01",
        startTime: "12:00",
        endTime: "13:00",
        title: "Protected slot"
      });
    });

    it("KAN-31 should reject task creation when the new task overlaps an existing task on the same day", async function () {
      const response = await createTask(token, {
        date: "2026-05-01",
        startTime: "12:30",
        endTime: "13:30",
        title: "Conflicting task"
      });

      expectErrorResponse(response, {
        statusCode: 409,
        error: "ConflictError",
        message: "Task overlaps an existing task for this day"
      });
    });

    it("KAN-32 should allow task creation when the new task starts exactly when an existing task ends", async function () {
      const response = await createTask(token, {
        date: "2026-05-01",
        startTime: "13:00",
        endTime: "14:00",
        title: "Adjacent task"
      });

      expect(response.status).to.equal(201);
      expectTaskToInclude(response.body.task, {
        userId: "user-001",
        date: "2026-05-01",
        startTime: "13:00",
        endTime: "14:00",
        title: "Adjacent task"
      });
    });
  });
});
