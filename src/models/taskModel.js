const db = require("./db");

function findById(taskId) {
  return db.tasks.find((task) => task.id === taskId) || null;
}

function findByUserAndDate(userId, date) {
  return db.tasks
    .filter((task) => task.userId === userId && task.date === date)
    .sort((left, right) => left.startTime.localeCompare(right.startTime));
}

function create({ userId, date, startTime, endTime, title, notes = "" }) {
  const id = `task-${String(db.counters.task).padStart(4, "0")}`;
  db.counters.task += 1;

  const task = { id, userId, date, startTime, endTime, title, notes };
  db.tasks.push(task);
  return task;
}

function update(taskId, updates) {
  const task = findById(taskId);
  if (!task) {
    return null;
  }

  Object.assign(task, updates);
  return task;
}

function deleteById(taskId) {
  const index = db.tasks.findIndex((task) => task.id === taskId);
  if (index === -1) {
    return null;
  }

  const [task] = db.tasks.splice(index, 1);
  return task;
}

function replaceDay(userId, date, tasks) {
  db.tasks = db.tasks.filter((task) => !(task.userId === userId && task.date === date));
  db.tasks.push(...tasks);
}

function deleteDay(userId, date) {
  const dayTasks = findByUserAndDate(userId, date);
  db.tasks = db.tasks.filter((task) => !(task.userId === userId && task.date === date));
  return dayTasks;
}

module.exports = {
  findById,
  findByUserAndDate,
  create,
  update,
  deleteById,
  replaceDay,
  deleteDay
};
