const express = require("express");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { loadSwaggerSpec } = require("./config/swagger");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");

const app = express();
const swaggerDocument = loadSwaggerSpec();
const clientDistPath = path.join(__dirname, "../client/dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Daily Planner API is running",
    docs: "/docs"
  });
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (fs.existsSync(clientIndexPath)) {
  app.use("/app", express.static(clientDistPath));
  app.get("/app/*", (_req, res) => {
    res.sendFile(clientIndexPath);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
