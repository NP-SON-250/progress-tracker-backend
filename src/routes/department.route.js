import express from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  searchDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
} from "../controllers/departments.controller.js";
import { normal } from "../middleware/middleware.js";
import fileUpload from "../helper/multer.js";
const departmentRoute = express.Router();

// ============================================
// Protected Routes (require authentication)
// ============================================

// Create a new department (addedBy auto-set from logged-in user)
departmentRoute.post(
  "/new-department",
  fileUpload.none(),
  normal,
  createDepartment,
);

// Get all departments
departmentRoute.get("/departments", normal, getAllDepartments);
// Search departments by name
departmentRoute.get("/departments/search", normal, searchDepartments);
// Get department by ID
departmentRoute.get("/departments/:id", normal, getDepartmentById);
// Update department
departmentRoute.put("/departments/:id", normal, updateDepartment);

export default departmentRoute;
