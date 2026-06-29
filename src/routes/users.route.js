import express from "express";
import {
  authenticateUser,
  getAll,
  newAccount,
  updateData,
  verifyOTP,
  singleUser,
  deleteUser,
  getUsersByDepartment,
  migrateDepartmentIds,
} from "../controllers/users.controller.js";
import { normal } from "../middleware/middleware.js";
import fileUpload from "../helper/multer.js";

const userRoute = express.Router();

// Public routes
userRoute.post("/new-account", fileUpload.none(), newAccount);
userRoute.post("/auth", fileUpload.none(), authenticateUser);
userRoute.post("/verify", fileUpload.none(), verifyOTP);
userRoute.post("/migrate-departments", migrateDepartmentIds);

// Protected routes (require authentication)
userRoute.get("/all-users", normal, getAll);
userRoute.get("/single-user/:id", normal, singleUser);
userRoute.get(
  "/users-by-department/:departmentId",
  normal,
  getUsersByDepartment,
);
userRoute.put("/update-user/:id", normal, updateData);

export default userRoute;
