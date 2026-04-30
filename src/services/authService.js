const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");
const { AppError } = require("../utils/errors");
const { sanitizeUser } = require("../utils/sanitize");
const { validateUsernameAndPassword } = require("../utils/validation");

const JWT_SECRET = process.env.JWT_SECRET || "daily-planner-secret";

function register({ username, password }) {
  validateUsernameAndPassword(username, password);

  if (userModel.findByUsername(username)) {
    throw new AppError(400, "ValidationError", "Username already exists");
  }

  const user = userModel.create({ username, password });

  return {
    message: "User registered successfully",
    user: sanitizeUser(user)
  };
}

function login({ username, password }) {
  validateUsernameAndPassword(username, password);

  const user = userModel.findByUsername(username);
  if (!user || user.password !== password) {
    throw new AppError(401, "AuthenticationError", "Invalid username or password");
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

  return {
    message: "Login successful",
    token,
    user: sanitizeUser(user)
  };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_error) {
    throw new AppError(401, "AuthenticationError", "Invalid or expired token");
  }
}

module.exports = {
  register,
  login,
  verifyToken
};
