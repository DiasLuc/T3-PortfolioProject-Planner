const taskModel = require("../models/taskModel");
const { AppError } = require("../utils/errors");
const { validateDate, validateTaskPayload, overlaps } = require("../utils/validation");

function assertNoOverlap({ userId, date, startTime, endTime, ignoredTaskId = null }) {
  const tasks = taskModel.findByUserAndDate(userId, date);

  const hasOverlap = tasks.some((task) => {
    if (ignoredTaskId && task.id === ignoredTaskId) {
      return false;
    }

    return overlaps(startTime, endTime, task.startTime, task.endTime);
  });

  if (hasOverlap) {
    throw new AppError(400, "ConflictError", "Task overlaps an existing task for this day");
  }
}

function createTask(userId, payload) {
  validateTaskPayload(payload);
  assertNoOverlap({ userId, ...payload });

  return {
    message: "Task created successfully",
    task: taskModel.create({ userId, ...payload })
  };
}

function getTasksForDay(userId, date) {
  validateDate(date);

  return {
    message: "Tasks retrieved successfully",
    date,
    tasks: taskModel.findByUserAndDate(userId, date)
  };
}

function updateTask(userId, taskId, payload) {
  validateTaskPayload(payload);

  const existingTask = taskModel.findById(taskId);
  if (!existingTask || existingTask.userId !== userId) {
    throw new AppError(404, "NotFoundError", "Task not found");
  }

  assertNoOverlap({ userId, ...payload, ignoredTaskId: taskId });

  return {
    message: "Task updated successfully",
    task: taskModel.update(taskId, payload)
  };
}

function replaceDay(userId, { date, tasks }) {
  validateDate(date);

  if (!Array.isArray(tasks)) {
    throw new AppError(400, "ValidationError", "Tasks must be an array");
  }

  const preparedTasks = tasks.map((task) => {
    validateTaskPayload({ ...task, date });
    return task;
  });

  const sortedTasks = preparedTasks
    .map((task) => ({ ...task }))
    .sort((left, right) => left.startTime.localeCompare(right.startTime));

  for (let index = 1; index < sortedTasks.length; index += 1) {
    const previousTask = sortedTasks[index - 1];
    const currentTask = sortedTasks[index];

    if (overlaps(previousTask.startTime, previousTask.endTime, currentTask.startTime, currentTask.endTime)) {
      throw new AppError(400, "ConflictError", "Provided tasks overlap within the day schedule");
    }
  }

  const createdTasks = sortedTasks.map((task) => taskModel.create({ userId, date, ...task }));
  taskModel.replaceDay(
    userId,
    date,
    createdTasks
  );

  return {
    message: "Day updated successfully",
    date,
    tasks: taskModel.findByUserAndDate(userId, date)
  };
}

function deleteTask(userId, taskId) {
  const task = taskModel.findById(taskId);
  if (!task || task.userId !== userId) {
    throw new AppError(404, "NotFoundError", "Task not found");
  }

  taskModel.deleteById(taskId);

  return {
    message: "Task deleted successfully",
    taskId
  };
}

function deleteDay(userId, date) {
  validateDate(date);

  const dayTasks = taskModel.findByUserAndDate(userId, date);
  if (dayTasks.length === 0) {
    throw new AppError(404, "NotFoundError", "No tasks found for the given date");
  }

  taskModel.deleteDay(userId, date);

  return {
    message: "Day tasks deleted successfully",
    date,
    deletedCount: dayTasks.length
  };
}

module.exports = {
  createTask,
  getTasksForDay,
  updateTask,
  replaceDay,
  deleteTask,
  deleteDay
};
