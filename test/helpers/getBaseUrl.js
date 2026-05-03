function getBaseUrl() {
  if (!process.env.BASE_URL) {
    throw new Error("BASE_URL must be defined in the .env file.");
  }

  if (!process.env.PORT) {
    throw new Error("PORT must be defined in the .env file.");
  }

  return `${process.env.BASE_URL}:${process.env.PORT}`;
}

module.exports = {
  getBaseUrl
};
