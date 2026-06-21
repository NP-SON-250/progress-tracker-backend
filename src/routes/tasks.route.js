import express from "express";
import {
  createTask,
  getTaskById,
  getAllTasks,
  updateTask,
  deleteTask,
  getTasksByDepartment,
  getTasksByUser,
} from "../controllers/tasks.controller.js";
import { normal } from "../middleware/middleware.js";
import fileUpload from "../helper/multer.js";

const taskRoute = express.Router();

// Public routes (no authentication required)
taskRoute.get("/all-tasks", getAllTasks);
taskRoute.get("/single-task/:id", getTaskById);
taskRoute.get("/task-by-department/:departmentId", getTasksByDepartment);
taskRoute.get("/tasks-by-user/:userId", getTasksByUser);
// Protected routes (authentication required)
taskRoute.post("/new-task", fileUpload.none(), normal, createTask);
taskRoute.put("update-task/:id", normal, updateTask);
// Admin only routes
taskRoute.delete("delete-task/:id", normal, deleteTask);

export default taskRoute;
