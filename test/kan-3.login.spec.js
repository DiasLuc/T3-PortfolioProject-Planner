const { expect } = require("chai");

const { loginUser } = require("./helpers/loginUser");
const { expectErrorResponse } = require("./helpers/expectErrorResponse");

describe("KAN-3 Log in and receive JWT token", function () {
  it("KAN-17 should log in successfully with valid credentials", async function () {
    const response = await loginUser("alice", "planner123");

    expect(response.status).to.equal(200);
    expect(response.body.message).to.equal("Login successful");
    expect(response.body.user).to.deep.equal({
      id: "user-001",
      username: "alice"
    });
    expect(response.body.token).to.be.a("string").and.not.empty;
  });

  it("KAN-18 should reject login with unknown username", async function () {
    const response = await loginUser("unknown_user", "planner123");

    expectErrorResponse(response, {
      statusCode: 401,
      error: "AuthenticationError",
      message: "Invalid username or password"
    });
  });

  it("KAN-19 should reject login with incorrect password", async function () {
    const response = await loginUser("alice", "wrong-password");

    expectErrorResponse(response, {
      statusCode: 401,
      error: "AuthenticationError",
      message: "Invalid username or password"
    });
  });

  it("KAN-20 should reject login when username is missing", async function () {
    const response = await loginUser(undefined, "planner123");

    expectErrorResponse(response, {
      statusCode: 400,
      error: "ValidationError",
      message: "Username and password are required"
    });
  });

  it("KAN-21 should reject login when password is missing", async function () {
    const response = await loginUser("alice", undefined);

    expectErrorResponse(response, {
      statusCode: 400,
      error: "ValidationError",
      message: "Username and password are required"
    });
  });
});
