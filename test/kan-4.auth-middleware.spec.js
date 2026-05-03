const jwt = require("jsonwebtoken");
const { expect } = require("chai");

const { registerUser } = require("./helpers/registerUser");
const { getToken } = require("./helpers/getToken");
const { getTasksForDay } = require("./helpers/getTasksForDay");
const { expectErrorResponse } = require("./helpers/expectErrorResponse");
const { getBaseUrl } = require("./helpers/getBaseUrl");

const { JWT_SECRET } = process.env;

describe("KAN-4 Protect planner endpoints with authentication middleware", function () {
  describe("authenticated requests", function () {
    let token;

    beforeEach(async function () {
      await registerUser("auth_case_user", "planner123");
      token = await getToken("auth_case_user", "planner123");
    });

    it("KAN-22 should allow access to a protected planner endpoint with a valid JWT token", async function () {
      const response = await getTasksForDay(token, "2026-05-01");

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal({
        message: "Tasks retrieved successfully",
        date: "2026-05-01",
        tasks: []
      });
    });

    it("KAN-25 should reject a protected planner request with an invalid token", async function () {
      const response = await getTasksForDay("invalid-jwt-token", "2026-05-01");

      expectErrorResponse(response, {
        statusCode: 401,
        error: "AuthenticationError",
        message: "Invalid or expired token"
      });
    });
  });

  it("KAN-23 should reject a protected planner request without an authorization token", async function () {
    const response = await getTasksForDay(undefined, "2026-05-01");

    expectErrorResponse(response, {
      statusCode: 401,
      error: "AuthenticationError",
      message: "Authorization token is required"
    });
  });

  it("KAN-24 should reject a protected planner request with a malformed authorization header", async function () {
    const response = await require("supertest")(getBaseUrl())
      .get("/tasks/day/2026-05-01")
      .set("Content-Type", "application/json")
      .set("Authorization", "Token invalid-format-token");

    expectErrorResponse(response, {
      statusCode: 401,
      error: "AuthenticationError",
      message: "Authorization token is required"
    });
  });

  it("KAN-26 should reject a protected planner request with an expired token", async function () {
    const expiredToken = jwt.sign(
      { sub: "user-001", username: "alice" },
      JWT_SECRET,
      { expiresIn: -60 }
    );

    const response = await getTasksForDay(expiredToken, "2026-05-01");

    expectErrorResponse(response, {
      statusCode: 401,
      error: "AuthenticationError",
      message: "Invalid or expired token"
    });
  });
});
