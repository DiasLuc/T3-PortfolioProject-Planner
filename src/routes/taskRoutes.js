const express = require("express");

const taskController = require("../controllers/taskController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", taskController.createTask);
router.put("/", taskController.replaceDay);
router.get("/day/:date", taskController.getTasksForDay);
router.delete("/day/:date", taskController.deleteDay);
router.put("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);

module.exports = router;
