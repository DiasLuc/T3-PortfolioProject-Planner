const taskService = require("../services/taskService");

function createTask(req, res, next) {
  try {
    const result = taskService.createTask(req.user.id, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

function getTasksForDay(req, res, next) {
  try {
    const result = taskService.getTasksForDay(req.user.id, req.params.date);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

function updateTask(req, res, next) {
  try {
    const result = taskService.updateTask(req.user.id, req.params.taskId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

function replaceDay(req, res, next) {
  try {
    const result = taskService.replaceDay(req.user.id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

function deleteTask(req, res, next) {
  try {
    const result = taskService.deleteTask(req.user.id, req.params.taskId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

function deleteDay(req, res, next) {
  try {
    const result = taskService.deleteDay(req.user.id, req.params.date);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  getTasksForDay,
  updateTask,
  replaceDay,
  deleteTask,
  deleteDay
};
