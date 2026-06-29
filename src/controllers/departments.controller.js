import DepartmentsModel from "../models/department.model.js";
import TasksModel from "../models/tasks.model.js";

// ============================================
// CREATE - Add a new department (uses logged-in user)
// ============================================
export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const loggedInUser = req.loggedInUser;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        status: "400",
        message: "Department name is required",
      });
    }

    // Check if department already exists
    const existingDepartment = await DepartmentsModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingDepartment) {
      return res.status(400).json({
        status: "400",
        message: "Department with this name already exists",
      });
    }

    // Create department with logged-in user as addedBy
    const department = await DepartmentsModel.create({
      name: name,
      addedBy: loggedInUser._id,
    });

    // Populate addedBy user details
    const populatedDepartment = await DepartmentsModel.findById(
      department._id,
    ).populate("addedBy", "fullname email role");

    return res.status(201).json({
      status: "201",
      message: "Department created",
      data: populatedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to create department",
      error: error.message,
    });
  }
};

// ============================================
// READ - Get all departments
// ============================================
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await DepartmentsModel.find()
      .populate("addedBy", "fullname email role")
      .sort({ createdOn: -1 });

    return res.status(200).json({
      status: "200",
      message: "All departments retrieved successfully",
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve departments",
      error: error.message,
    });
  }
};

// ============================================
// READ - Get single department by ID
// ============================================
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await DepartmentsModel.findById(id).populate(
      "addedBy",
      "fullname email role",
    );

    if (!department) {
      return res.status(404).json({
        status: "404",
        message: "Department not found",
      });
    }

    return res.status(200).json({
      status: "200",
      message: "Department retrieved successfully",
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve department",
      error: error.message,
    });
  }
};

// ============================================
// READ - Search departments by name
// ============================================
export const searchDepartments = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: "400",
        message: "Search query is required",
      });
    }

    const departments = await DepartmentsModel.find({
      name: { $regex: query, $options: "i" },
    })
      .populate("addedBy", "fullname email role")
      .sort({ name: 1 });

    return res.status(200).json({
      status: "200",
      message: "Departments found",
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to search departments",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE - Update department
// ============================================
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if department exists
    const department = await DepartmentsModel.findById(id);
    if (!department) {
      return res.status(404).json({
        status: "404",
        message: "Department not found",
      });
    }

    const existingDepartment = await DepartmentsModel.findOne({ name: name });
    if (existingDepartment && existingDepartment._id !== department._id) {
      return res.status(400).json({
        status: "400",
        message: "The name was assigned to other department",
      });
    }

    const updatedDepartment = await DepartmentsModel.findByIdAndUpdate(
      id,
      {
        name,
        updatedOn: new Date(),
      },
      { new: true },
    ).populate("addedBy", "fullname email role");

    return res.status(200).json({
      status: "200",
      message: `Department updated`,
      data: updatedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to update user count",
      error: error.message,
    });
  }
};

// ============================================
// DELETE - Delete department (Only creator or Admin)
// ============================================
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.loggedInUser;

    // Check if department exists
    const department = await DepartmentsModel.findById(id);
    if (!department) {
      return res.status(404).json({
        status: "404",
        message: "Department not found",
      });
    }

    // Check authorization: Only creator or Admin can delete
    if (
      department.addedBy.toString() !== loggedInUser._id.toString() &&
      loggedInUser.role !== "Admin"
    ) {
      return res.status(403).json({
        status: "403",
        message: "Access denied. You can only delete departments you created",
      });
    }

    // Check if department has assigned tasks
    const hasTasks = await TasksModel.findOne({ taskFor: id });
    if (hasTasks) {
      return res.status(400).json({
        status: "400",
        message:
          "Cannot delete department with assigned tasks. Reassign or delete tasks first.",
      });
    }

    // Delete department
    await DepartmentsModel.findByIdAndDelete(id);

    return res.status(200).json({
      status: "200",
      message: "Department deleted successfully",
      data: {
        id: id,
        name: department.name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to delete department",
      error: error.message,
    });
  }
};

// ============================================
// GET - Department statistics
// ============================================
export const getDepartmentStats = async (req, res) => {
  try {
    const totalDepartments = await DepartmentsModel.countDocuments();

    const stats = await DepartmentsModel.aggregate([
      {
        $group: {
          _id: null,
          totalDepartments: { $sum: 1 },
          totalUsers: { $sum: "$numberOfUsers" },
          averageUsersPerDept: { $avg: "$numberOfUsers" },
          maxUsers: { $max: "$numberOfUsers" },
          minUsers: { $min: "$numberOfUsers" },
        },
      },
    ]);

    const recentDepartments = await DepartmentsModel.find()
      .sort({ createdOn: -1 })
      .limit(5)
      .populate("addedBy", "fullname");

    return res.status(200).json({
      status: "200",
      message: "Department statistics retrieved",
      data: {
        stats: stats[0] || {
          totalDepartments: 0,
          totalUsers: 0,
          averageUsersPerDept: 0,
          maxUsers: 0,
          minUsers: 0,
        },
        recentDepartments: recentDepartments,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve statistics",
      error: error.message,
    });
  }
};
