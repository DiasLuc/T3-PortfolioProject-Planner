const authService = require("../services/authService");

function register(req, res, next) {
  try {
    const result = authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

function login(req, res, next) {
  try {
    const result = authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login
};
