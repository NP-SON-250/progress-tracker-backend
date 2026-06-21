import TasksModel from "../models/tasks.model.js";
import UsersModel from "../models/users.model.js";
import DepartmentsModel from "../models/department.model.js";
import mongoose from "mongoose";

// Helper function to generate task number
const generateTaskNumber = async () => {
  try {
    const lastTask = await TasksModel.findOne(
      { taskNumber: { $regex: /^TSK-\d{5}$/ } },
      { taskNumber: 1 },
    ).sort({ taskNumber: -1 });

    if (!lastTask) {
      return "TSK-00001";
    }

    const lastNumber = parseInt(lastTask.taskNumber.split("-")[1]);
    const newNumber = lastNumber + 1;
    return `TSK-${String(newNumber).padStart(5, "0")}`;
  } catch (error) {
    console.error("Error generating task number:", error);
    throw error;
  }
};
// Create a new task
export const createTask = async (req, res) => {
  try {
    const {
      name,
      description,
      priority,
      taskFor,
      asignedTo,
      startDate,
      deadline,
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task name is required",
      });
    }
    if (!taskFor) {
      return res.status(400).json({
        success: false,
        message: "Department (taskFor) is required",
      });
    }
    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Priority is required",
      });
    }

    // Validate priority enum
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
      });
    }

    // Validate startDate
    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required",
      });
    }

    // Validate deadline
    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: "Deadline is required",
      });
    }

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(deadline);
    end.setHours(0, 0, 0, 0);

    // Check if start date is in the past
    if (start < today) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be in the past. Please select today or a future date.",
      });
    }

    // Check if deadline is before start date
    if (end < start) {
      return res.status(400).json({
        success: false,
        message:
          "Deadline cannot be before start date. Please select a date after the start date.",
      });
    }

    // Validate if department exists
    const department = await DepartmentsModel.findById(taskFor);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Validate if all assigned users exist
    if (!asignedTo || asignedTo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please assign at least one user to this task",
      });
    }

    const users = await UsersModel.find({ _id: { $in: asignedTo } });
    if (!users || users.length !== asignedTo.length) {
      return res.status(404).json({
        success: false,
        message: "One or more assigned users not found",
      });
    }

    // Generate task number
    const taskNumber = await generateTaskNumber();

    // Determine task status
    const taskStatus =
      start.getTime() === today.getTime() ? "Running" : "On Hold";

    // Create new task with default values
    const newTask = new TasksModel({
      taskNumber,
      name: name.trim(),
      description: description ? description.trim() : "",
      status: taskStatus,
      completenessLevel: "L1",
      progress: "0",
      priority,
      taskFor,
      startDate,
      deadline,
      asignedTo,
      managerComment: [],
      extendedDeadline: null,
      reasonsForExtending: null,
    });

    // Save the task
    const savedTask = await newTask.save();

    // Update users' assignedTasks
    await UsersModel.updateMany(
      { _id: { $in: asignedTo } },
      { $push: { assignedTasks: savedTask._id } },
    );

    // Update department's departmentTasks
    await DepartmentsModel.findByIdAndUpdate(taskFor, {
      $push: { departmentTasks: savedTask._id },
      $set: { updatedOn: new Date() },
    });

    // Populate the created task
    const populatedTask = await TasksModel.findById(savedTask._id)
      .populate("taskFor", "name")
      .populate("asignedTo", "fullname email");

    res.status(201).json({
      success: true,
      message: "Task created",
      data: populatedTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create task",
      error: error.message,
    });
  }
};
// Get all tasks with enhanced analytics
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await TasksModel.find()
      .populate("taskFor", "name")
      .populate("asignedTo", "fullname email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};
// Get a single task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TasksModel.findById(id)
      .populate("taskFor", "name")
      .populate("asignedTo", "fullname email");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};
// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      completenessLevel,
      priority,
      taskFor,
      asignedTo,
      startDate,
      deadline,
      completedOn,
      status, // 👈 IMPORTANT: allow status updates
    } = req.body;

    // 1. Find existing task
    const existingTask = await TasksModel.findById(id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // 2. Helper: add status history safely
    const addStatusHistory = (newStatus) => {
      existingTask.statusHistory.push({
        status: newStatus,
        date: new Date(),
      });
    };

    // 3. Prepare updates
    const updateData = {};

    // ---------------- NAME ----------------
    if (name) updateData.name = name.trim();

    // ---------------- DESCRIPTION ----------------
    if (description) updateData.description = description.trim();

    // ---------------- PRIORITY ----------------
    if (priority) {
      const validPriorities = ["Low", "Medium", "High"];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
        });
      }
      updateData.priority = priority;
    }

    // ---------------- COMPLETENESS LEVEL ----------------
    if (completenessLevel) {
      const validLevels = ["L1", "L2", "L3", "L4", "L5", "L6"];

      if (!validLevels.includes(completenessLevel)) {
        return res.status(400).json({
          success: false,
          message: `Invalid completeness level. Must be one of: ${validLevels.join(", ")}`,
        });
      }

      updateData.completenessLevel = completenessLevel;

      const progressMap = {
        L1: "0",
        L2: "20",
        L3: "40",
        L4: "60",
        L5: "80",
        L6: "100",
      };

      updateData.progress = progressMap[completenessLevel];

      // Auto-complete when L6
      if (completenessLevel === "L6") {
        updateData.status = "Completed";
        updateData.completedOn = new Date();

        addStatusHistory("Completed");
      }
    }

    // ---------------- STATUS UPDATE (VERY IMPORTANT) ----------------
    if (status && status !== existingTask.status) {
      const validStatuses = [
        "Running",
        "On Hold",
        "Completed",
        "Closed",
        "Overdue",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      updateData.status = status;

      addStatusHistory(status);

      // if completed
      if (status === "Completed") {
        updateData.completedOn = new Date();
      }
    }

    // ---------------- DATES ----------------
    if (startDate) updateData.startDate = startDate;
    if (deadline) updateData.deadline = deadline;

    // ---------------- ASSIGNED USERS ----------------
    if (asignedTo && Array.isArray(asignedTo)) {
      if (asignedTo.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one assigned user is required",
        });
      }

      const users = await UsersModel.find({ _id: { $in: asignedTo } });

      if (users.length !== asignedTo.length) {
        return res.status(404).json({
          success: false,
          message: "One or more assigned users not found",
        });
      }

      const newUsers = asignedTo.filter(
        (userId) => !existingTask.asignedTo.map(String).includes(userId),
      );

      const removedUsers = existingTask.asignedTo
        .map(String)
        .filter((userId) => !asignedTo.includes(userId));

      if (newUsers.length) {
        await UsersModel.updateMany(
          { _id: { $in: newUsers } },
          { $push: { assignedTasks: existingTask._id } },
        );
      }

      if (removedUsers.length) {
        await UsersModel.updateMany(
          { _id: { $in: removedUsers } },
          { $pull: { assignedTasks: existingTask._id } },
        );
      }

      updateData.asignedTo = asignedTo;
    }

    // ---------------- DEPARTMENT CHANGE ----------------
    if (taskFor) {
      if (taskFor !== existingTask.taskFor.toString()) {
        const department = await DepartmentsModel.findById(taskFor);

        if (!department) {
          return res.status(404).json({
            success: false,
            message: "Department not found",
          });
        }

        await DepartmentsModel.findByIdAndUpdate(existingTask.taskFor, {
          $pull: { departmentTasks: existingTask._id },
        });

        await DepartmentsModel.findByIdAndUpdate(taskFor, {
          $push: { departmentTasks: existingTask._id },
          $set: { updatedOn: new Date() },
        });

        updateData.taskFor = taskFor;
      }
    }

    // ---------------- APPLY UPDATES ----------------
    Object.assign(existingTask, updateData);

    const updatedTask = await existingTask.save();

    // ---------------- POPULATE RESULT ----------------
    const populatedTask = await TasksModel.findById(updatedTask._id)
      .populate("taskFor", "name")
      .populate("asignedTo", "fullname email");

    return res.status(200).json({
      success: true,
      message: "Task updated",
      data: populatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};
// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the logged-in user is an Admin
    const loggedInUser = req.loggedInUser;
    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }
    if (loggedInUser.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Admins can delete tasks.",
      });
    }
    // Find the task
    const task = await TasksModel.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    // Remove task ID from all assigned users
    await UsersModel.updateMany(
      { _id: { $in: task.asignedTo } },
      { $pull: { assignedTasks: task._id } },
    );
    // Remove task ID from department
    await DepartmentsModel.findByIdAndUpdate(task.taskFor, {
      $pull: { departmentTasks: task._id },
    });
    // Delete the task
    await TasksModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Task deleted",
      data: {
        taskId: task._id,
        taskNumber: task.taskNumber,
        deletedBy: loggedInUser.fullname || loggedInUser.email,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};
// Get tasks by department with enhanced analytics
export const getTasksByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Validate departmentId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format",
      });
    }
    // Get all tasks for the department
    const tasks = await TasksModel.find({ taskFor: departmentId })
      .populate("taskFor", "name")
      .populate("asignedTo", "fullname email")
      .sort({ createdAt: -1 });

    // Get department details
    const department = await DepartmentsModel.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }
    const statusAnalytics = {
      totalTasks: tasks.length,
      runningTasks: tasks.filter((t) => t.status === "Running").length,
      onHoldTasks: tasks.filter((t) => t.status === "On Hold").length,
      completedTasks: tasks.filter((t) => t.status === "Completed").length,
      overdueTasks: tasks.filter((t) => t.status === "Overdue").length,
      closedTasks: tasks.filter((t) => t.status === "Closed").length,
    };
    const pieChart = [
      {
        name: "Running",
        value: statusAnalytics.runningTasks,
      },
      {
        name: "On Hold",
        value: statusAnalytics.onHoldTasks,
      },
      {
        name: "Completed",
        value: statusAnalytics.completedTasks,
      },
      {
        name: "Overdue",
        value: statusAnalytics.overdueTasks,
      },
      {
        name: "Closed",
        value: statusAnalytics.closedTasks,
      },
    ];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const weeklyStatusAnalytics = {
      Running: 0,
      "On Hold": 0,
      Completed: 0,
      Closed: 0,
      Overdue: 0,
    };

    tasks.forEach((task) => {
      task.statusHistory.forEach((item) => {
        if (item.date >= startOfWeek) {
          weeklyStatusAnalytics[item.status]++;
        }
      });
    });
    const dailyPerformance = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };
    tasks.forEach((task) => {
      if (task.status === "Running" || task.status === "Completed") {
        const progress = Number(task.progress);

        const day = new Date(task.startDate).toLocaleDateString("en-US", {
          weekday: "short",
        });

        if (dailyPerformance[day]) {
          dailyPerformance[day].push(progress);
        }
      }
    });
    const barChart = Object.keys(dailyPerformance).map((day) => {
      const values = dailyPerformance[day];

      return {
        day,
        performance: values.length
          ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          : 0,
      };
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysTasks = tasks.filter(
      (task) => task.startDate >= today && task.startDate < tomorrow,
    );
    const departmentPerformance = tasks.length
      ? Math.round(
          tasks.reduce((sum, t) => sum + Number(t.progress), 0) / tasks.length,
        )
      : 0;
    res.status(200).json({
      success: true,
      data: {
        tasks,

        cards: {
          totalTasks: statusAnalytics.totalTasks,
          runningTasks: statusAnalytics.runningTasks,
          onHoldTasks: statusAnalytics.onHoldTasks,
          completedTasks: statusAnalytics.completedTasks,
          overdueTasks: statusAnalytics.overdueTasks,
          closedTasks: statusAnalytics.closedTasks,
        },

        performance: departmentPerformance,

        pieChart,

        weeklyStatusAnalytics,

        barChart,

        todaysTasks,
      },
    });
  } catch (error) {
    console.error("Error fetching department tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department tasks",
      error: error.message,
    });
  }
};
// Get tasks assigned to a specific user
export const getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const tasks = await TasksModel.find({ asignedTo: userId })
      .populate("taskFor", "name")
      .populate("asignedTo", "fullname email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user tasks",
      error: error.message,
    });
  }
};
