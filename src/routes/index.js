import express from "express";
import docrouter from "../docs/Docs.js";
import userRoute from "./users.route.js";
import departmentRoute from "./department.route.js";
import taskRoute from "./tasks.route.js";
const router = express.Router();

router.use("/docs", docrouter);
router.use("/users", userRoute);
router.use("/departments", departmentRoute);
router.use("/tasks", taskRoute);


export default router;
