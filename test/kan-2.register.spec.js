const { expect } = require("chai");

const { registerUser } = require("./helpers/registerUser");
const { expectErrorResponse } = require("./helpers/expectErrorResponse");

describe("KAN-2 Register a new user", function () {
  it("KAN-13 should register a new user successfully", async function () {
    const response = await registerUser("new_user", "planner123");

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("User registered successfully");
    expect(response.body.user).to.deep.equal({
      id: "user-004",
      username: "new_user"
    });
  });

  it("KAN-14 should reject registration with duplicate username", async function () {
    await registerUser("existing_user", "planner123");

    const response = await registerUser("existing_user", "planner123");

    expectErrorResponse(response, {
      statusCode: 409,
      error: "ConflictError",
      message: "Username already exists"
    });
  });

  it("KAN-15 should reject registration when username is missing", async function () {
    const response = await registerUser(undefined, "planner123");

    expectErrorResponse(response, {
      statusCode: 400,
      error: "ValidationError",
      message: "Username and password are required"
    });
  });

  it("KAN-16 should reject registration when password is missing", async function () {
    const response = await registerUser("new_user", undefined);

    expectErrorResponse(response, {
      statusCode: 400,
      error: "ValidationError",
      message: "Username and password are required"
    });
  });
});
