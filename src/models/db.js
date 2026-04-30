const { seededUsers, seededTasks } = require("../data/seedData");

const db = {
  users: structuredClone(seededUsers),
  tasks: structuredClone(seededTasks),
  counters: {
    user: seededUsers.length + 1,
    task: seededTasks.length + 1
  }
};

module.exports = db;
