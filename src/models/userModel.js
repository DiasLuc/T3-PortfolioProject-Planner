const db = require("./db");

function findByUsername(username) {
  return db.users.find((user) => user.username === username) || null;
}

function findById(id) {
  return db.users.find((user) => user.id === id) || null;
}

function create({ username, password }) {
  const id = `user-${String(db.counters.user).padStart(3, "0")}`;
  db.counters.user += 1;

  const user = { id, username, password };
  db.users.push(user);
  return user;
}

module.exports = {
  findById,
  findByUsername,
  create
};
