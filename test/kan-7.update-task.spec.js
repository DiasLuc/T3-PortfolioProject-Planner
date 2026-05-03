const { expect } = require("chai");

const { getToken } = require("./helpers/getToken");
const { updateTask } = require("./helpers/updateTask");
const { replaceDay } = require("./helpers/replaceDay");
const { expectErrorResponse } = require("./helpers/expectErrorResponse");

describe("KAN-7 Update a task or replace a day", function () {
  let token;

  beforeEach(async function () {
    token = await getToken("alice", "planner123");
  });

  describe("single-task updates", function () {
    it("KAN-38 should update a single task successfully", async function () {
      global.testDb.removeTasks((task) => task.userId === "user-001" && task.id !== "task-0001");

      const response = await updateTask(token, "task-0001", {
        date: "2026-05-01",
        startTime: "10:00",
        endTime: "11:00",
        title: "Updated task",
        notes: "Adjusted plan"
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({
        message: "Task updated successfully",
        task: {
          id: "task-0001",
          userId: "user-001",
          date: "2026-05-01",
          startTime: "10:00",
          endTime: "11:00",
          title: "Updated task",
          notes: "Adjusted plan"
        }
      });
    });

    it("KAN-39 should reject a single-task update when the task belongs to another user", async function () {
      global.testDb.seedTask({
        id: "task-9999",
        userId: "user-002",
        date: "2026-05-01",
        startTime: "08:00",
        endTime: "09:00",
        title: "Other user task"
      });

      const response = await updateTask(token, "task-9999", {
        date: "2026-05-01",
        startTime: "10:00",
        endTime: "11:00",
        title: "Unauthorized update"
      });

      expectErrorResponse(response, {
        statusCode: 404,
        error: "NotFoundError",
        message: "Task not found"
      });
    });

    it("KAN-40 should reject a single-task update with invalid time range", async function () {
      global.testDb.removeTasks((task) => task.userId === "user-001" && task.id !== "task-0001");

      const response = await updateTask(token, "task-0001", {
        date: "2026-05-01",
        startTime: "11:00",
        endTime: "10:00",
        title: "Broken update"
      });

      expectErrorResponse(response, {
        statusCode: 400,
        error: "ValidationError",
        message: "End time must be after start time"
      });
    });
  });

  describe("single-task overlap scenarios", function () {
    beforeEach(function () {
      global.testDb.removeUserTasksForDate("user-001", "2026-05-01");
      global.testDb.seedTask({
        id: "task-0001",
        userId: "user-001",
        date: "2026-05-01",
        startTime: "07:00",
        endTime: "07:45",
        title: "Stretching",
        notes: "Living room routine"
      });
      global.testDb.seedTask({
        userId: "user-001",
        date: "2026-05-01",
        startTime: "12:00",
        endTime: "13:00",
        title: "Protected slot"
      });
    });

    it("KAN-41 should reject a single-task update when it overlaps another task on the same day", async function () {
      const response = await updateTask(token, "task-0001", {
        date: "2026-05-01",
        startTime: "12:30",
        endTime: "13:30",
        title: "Conflicting update"
      });

      expectErrorResponse(response, {
        statusCode: 409,
        error: "ConflictError",
        message: "Task overlaps an existing task for this day"
      });
    });

    it("KAN-42 should allow a single-task update when it becomes adjacent to another task", async function () {
      const response = await updateTask(token, "task-0001", {
        date: "2026-05-01",
        startTime: "13:00",
        endTime: "14:00",
        title: "Adjacent update"
      });

      expect(response.status).to.equal(200);
      expect(response.body.task).to.include({
        id: "task-0001",
        userId: "user-001",
        date: "2026-05-01",
        startTime: "13:00",
        endTime: "14:00",
        title: "Adjacent update"
      });
    });
  });

  describe("day replacement", function () {
    it("KAN-43 should replace a day’s tasks successfully", async function () {
      const response = await replaceDay(token, {
        date: "2026-05-01",
        tasks: [
          {
            startTime: "08:00",
            endTime: "09:00",
            title: "Morning run",
            notes: "Park loop"
          },
          {
            startTime: "09:00",
            endTime: "09:30",
            title: "Breakfast",
            notes: "Protein smoothie"
          }
        ]
      });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Day updated successfully");
      expect(response.body.date).to.equal("2026-05-01");
      expect(response.body.tasks).to.have.lengthOf(2);
      expect(response.body.tasks[0]).to.include({
        userId: "user-001",
        date: "2026-05-01",
        startTime: "08:00",
        endTime: "09:00",
        title: "Morning run",
        notes: "Park loop"
      });
    });

    it("KAN-44 should reject day replacement when tasks is not an array", async function () {
      const response = await replaceDay(token, {
        date: "2026-05-01",
        tasks: {}
      });

      expectErrorResponse(response, {
        statusCode: 400,
        error: "ValidationError",
        message: "Tasks must be an array"
      });
    });

    it("KAN-45 should reject day replacement when provided tasks overlap each other", async function () {
      const response = await replaceDay(token, {
        date: "2026-05-01",
        tasks: [
          {
            startTime: "08:00",
            endTime: "09:30",
            title: "Long block"
          },
          {
            startTime: "09:00",
            endTime: "10:00",
            title: "Overlap block"
          }
        ]
      });

      expectErrorResponse(response, {
        statusCode: 409,
        error: "ConflictError",
        message: "Provided tasks overlap within the day schedule"
      });
    });
  });
});
