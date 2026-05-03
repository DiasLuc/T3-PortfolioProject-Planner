require("dotenv").config();

const app = require("./app");

if (!process.env.PORT) {
  throw new Error("PORT must be defined in the .env file.");
}

if (!process.env.HOST) {
  throw new Error("HOST must be defined in the .env file.");
}

const PORT = Number(process.env.PORT);
const { HOST } = process.env;

if (Number.isNaN(PORT)) {
  throw new Error("PORT in the .env file must be a valid number.");
}

app.listen(PORT, HOST, () => {
  console.log(`Daily Planner API listening on http://${HOST}:${PORT}`);
});
