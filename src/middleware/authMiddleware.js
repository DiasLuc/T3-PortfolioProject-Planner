const userModel = require("../models/userModel");
const authService = require("../services/authService");
const { AppError } = require("../utils/errors");

function authenticate(req, _res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new AppError(401, "AuthenticationError", "Authorization token is required");
    }

    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new AppError(401, "AuthenticationError", "Authorization token is required");
    }

    const payload = authService.verifyToken(token);
    const user = userModel.findById(payload.sub);

    if (!user) {
      throw new AppError(401, "AuthenticationError", "Invalid or expired token");
    }

    req.user = {
      id: user.id,
      username: user.username
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticate
};
