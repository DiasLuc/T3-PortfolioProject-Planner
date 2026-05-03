const { loginUser } = require("./loginUser");

async function getToken(username, password = "planner123") {
  const response = await loginUser(username, password);
  return response.body.token;
}

module.exports = {
  getToken
};
