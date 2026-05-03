require("dotenv").config();

const app = require("../src/app");
const db = require("../src/models/db");
const { seededUsers, seededTasks } = require("../src/data/seedData");

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL must be defined in the .env file for the test environment.");
}

if (!process.env.PORT) {
  throw new Error("PORT must be defined in the .env file for the test environment.");
}

if (!process.env.HOST) {
  throw new Error("HOST must be defined in the .env file for the test environment.");
}

const configuredBaseUrl = new URL(process.env.BASE_URL);
const TEST_HOST = process.env.HOST;
const TEST_PORT = Number(process.env.PORT);

if (Number.isNaN(TEST_PORT)) {
  throw new Error("PORT in the .env file must be a valid number.");
}

let server;

function resetDb() {
  db.users.splice(0, db.users.length, ...structuredClone(seededUsers));
  db.tasks.splice(0, db.tasks.length, ...structuredClone(seededTasks));
  db.counters.user = seededUsers.length + 1;
  db.counters.task = seededTasks.length + 1;
}

function seedTask({
  id,
  userId,
  date,
  startTime,
  endTime,
  title,
  notes = ""
}) {
  const task = {
    id: id || `task-${String(db.counters.task).padStart(4, "0")}`,
    userId,
    date,
    startTime,
    endTime,
    title,
    notes
  };

  db.tasks.push(task);

  if (!id) {
    db.counters.task += 1;
  }

  return task;
}

function removeTasks(filterFn) {
  const remainingTasks = db.tasks.filter((task) => !filterFn(task));
  db.tasks.splice(0, db.tasks.length, ...remainingTasks);
}

function removeUserTasksForDate(userId, date) {
  removeTasks((task) => task.userId === userId && task.date === date);
}

global.testDb = {
  resetDb,
  seedTask,
  removeTasks,
  removeUserTasksForDate
};

exports.mochaHooks = {
  beforeAll(done) {
    server = app.listen(TEST_PORT, TEST_HOST, done);
  },
  beforeEach() {
    resetDb();
  },
  afterAll(done) {
    if (!server || !server.listening) {
      done();
      return;
    }

    server.close(done);
  }
};
