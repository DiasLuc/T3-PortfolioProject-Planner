const { AppError } = require("./errors");

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function assertRequiredString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(400, "ValidationError", `${fieldName} is required`);
  }
}

function validateUsernameAndPassword(username, password) {
  if (!username || !password) {
    throw new AppError(400, "ValidationError", "Username and password are required");
  }
}

function validateDate(date) {
  if (!DATE_REGEX.test(date)) {
    throw new AppError(400, "ValidationError", "Date must use YYYY-MM-DD format");
  }
}

function validateTime(time, fieldName) {
  if (!TIME_REGEX.test(time)) {
    throw new AppError(400, "ValidationError", `${fieldName} must use HH:MM format`);
  }
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function validateTaskPayload(payload) {
  const { date, startTime, endTime, title } = payload;

  validateDate(date);
  validateTime(startTime, "Start time");
  validateTime(endTime, "End time");
  assertRequiredString(title, "Title");

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    throw new AppError(400, "ValidationError", "End time must be after start time");
  }
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

module.exports = {
  validateUsernameAndPassword,
  validateDate,
  validateTaskPayload,
  overlaps
};
