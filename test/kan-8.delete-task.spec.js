const { expect } = require("chai");

const { getToken } = require("./helpers/getToken");
const { deleteTask } = require("./helpers/deleteTask");
const { deleteDay } = require("./helpers/deleteDay");
const { expectErrorResponse } = require("./helpers/expectErrorResponse");

describe("KAN-8 Delete a task or all tasks for a day", function () {
  let token;

  beforeEach(async function () {
    token = await getToken("alice", "planner123");
  });

  describe("single-task deletion", function () {
    it("KAN-46 should delete an owned task successfully", async function () {
      const response = await deleteTask(token, "task-0003");

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({
        message: "Task deleted successfully",
        taskId: "task-0003"
      });
    });

    it("KAN-47 should return not found when deleting another user's task", async function () {
      const response = await deleteTask(token, "task-0011");

      expectErrorResponse(response, {
        statusCode: 404,
        error: "NotFoundError",
        message: "Task not found"
      });
    });

    it("KAN-48 should return not found when deleting a non-existent task", async function () {
      const response = await deleteTask(token, "task-9999");

      expectErrorResponse(response, {
        statusCode: 404,
        error: "NotFoundError",
        message: "Task not found"
      });
    });

    it("KAN-49 should return unauthorized when deleting a task without authentication", async function () {
      const response = await deleteTask(undefined, "task-0003");

      expectErrorResponse(response, {
        statusCode: 401,
        error: "AuthenticationError",
        message: "Authorization token is required"
      });
    });
  });

  describe("day deletion", function () {
    it("KAN-50 should delete all owned tasks for a populated day successfully", async function () {
      const response = await deleteDay(token, "2026-05-01");

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({
        message: "Day tasks deleted successfully",
        date: "2026-05-01",
        deletedCount: 3
      });
    });

    it("KAN-51 should return a validation error when deleting a day with an invalid date format", async function () {
      const response = await deleteDay(token, "05-01-2026");

      expectErrorResponse(response, {
        statusCode: 400,
        error: "ValidationError",
        message: "Date must use YYYY-MM-DD format"
      });
    });

    it("KAN-52 should return not found when deleting a day with no tasks for the authenticated user", async function () {
      const response = await deleteDay(token, "2026-05-08");

      expectErrorResponse(response, {
        statusCode: 404,
        error: "NotFoundError",
        message: "No tasks found for the given date"
      });
    });

    it("KAN-53 should return unauthorized when deleting a day without authentication", async function () {
      const response = await deleteDay(undefined, "2026-05-01");

      expectErrorResponse(response, {
        statusCode: 401,
        error: "AuthenticationError",
        message: "Authorization token is required"
      });
    });
  });
});
