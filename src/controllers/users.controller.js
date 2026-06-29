import UsersModel from "../models/users.model.js";
import DepartmentsModel from "../models/department.model.js";
import TasksModel from "../models/tasks.model.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendWelcomeMessage, sendOTP } from "../utils/emailTemplate.js";
import { OTPGenerator } from "../utils/otpGenerator.js";
import mongoose from "mongoose";

export const newAccount = async (req, res) => {
  try {
    const { fullname, email, password, role, status } = req.body;

    // Parse departments from JSON string if it's a string
    let departments = req.body.departments;
    if (typeof departments === "string") {
      try {
        departments = JSON.parse(departments);
      } catch (e) {
        return res.status(400).json({
          status: "400",
          message: "Invalid departments format",
        });
      }
    }

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        status: "400",
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        status: "400",
        message: "Password is required",
      });
    }
    if (!fullname) {
      return res.status(400).json({
        status: "400",
        message: "User full name is required",
      });
    }

    // Check if email already exists
    const checkUserEmail = await UsersModel.findOne({ email });
    if (checkUserEmail) {
      return res.status(400).json({
        status: "400",
        message: "Email already used",
      });
    }

    // Validate role if provided
    const validRoles = ["User", "Admin"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role, Role must be either 'User' or 'Admin'",
      });
    }

    // Validate and convert departments to ObjectIds if provided
    let departmentIds = [];
    if (departments && Array.isArray(departments)) {
      const invalidIds = departments.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid department ID(s) provided",
        });
      }
      departmentIds = departments.map((id) => new mongoose.Types.ObjectId(id));
    }

    // Validate status if provided
    const validStatuses = ["Active", "Inactive"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be either 'Active' or 'Inactive'",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await UsersModel.create({
      fullname,
      email,
      password: hashedPassword,
      role: role || "User",
      departments: departmentIds,
      status: status || "Active",
      registeredOn: new Date(),
      lastLogin: null,
      deactivatedOn: null,
      lastOTP: null,
      otpExpiry: null,
      assignedTasks: [],
    });

    // Update department numberOfUsers
    if (departmentIds.length > 0) {
      await DepartmentsModel.updateMany(
        { _id: { $in: departmentIds } },
        { $inc: { numberOfUsers: 1 } },
      );
    }

    // Send welcome email asynchronously (don't await)
    await sendWelcomeMessage(createdUser.email, createdUser.fullname, password);

    // Remove password from response
    const userResponse = createdUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      status: "201",
      message: "User registered",
      data: userResponse,
    });
  } catch (error) {
    console.error("newAccount error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to register",
      error: error.message,
    });
  }
};

export const authenticateUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        status: "400",
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        status: "400",
        message: "Password is required",
      });
    }

    // Find user by email
    const userData = await UsersModel.findOne({ email });
    if (!userData) {
      return res.status(404).json({
        status: "404",
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "401",
        message: "Incorrect password",
      });
    }

    // Generate OTP
    const otp = OTPGenerator.generateOTP(6);
    const expiry = OTPGenerator.expiryTime(15);

    // Save OTP to user
    userData.lastOTP = otp;
    userData.otpExpiry = expiry;
    await userData.save();

    // Send OTP email
    await sendOTP(userData.email, userData.fullname, otp);

    // Send proper response
    return res.status(200).json({
      status: "200",
      message: `OTP code sent to ${userData.email}`,
      data: {
        email: userData.email,
        otpExpiry: expiry,
        requiresOTP: true,
      },
    });
  } catch (error) {
    console.error("authenticateUser error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Authentication failed",
      error: error.message,
    });
  }
};

// Verify OTP and generate JWT
export const verifyOTP = async (req, res) => {
  try {
    const { email, inputOTP } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        status: "400",
        message: "Email is required",
      });
    }
    if (!inputOTP) {
      return res.status(400).json({
        status: "400",
        message: "OTP is required",
      });
    }

    // Find user by email and populate related data
    const user = await UsersModel.findOne({ email: email.toLowerCase() })
      .populate({
        path: "departments",
        model: "departments",
        select: "name numberOfUsers createdOn addedBy",
        populate: {
          path: "addedBy",
          model: "users",
          select: "fullname email",
        },
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select:
          "taskNumber name description status priority completenessLevel progress startDate deadline completedOn overdued extendedDeadline reasonsForExtending",
        populate: [
          {
            path: "taskFor",
            model: "departments",
            select: "name",
          },
          {
            path: "asignedTo",
            model: "users",
            select: "fullname email",
          },
        ],
      });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        status: "404",
        message: "User not found",
      });
    }

    // Check if user is active
    if (user.status !== "Active") {
      return res.status(403).json({
        status: "403",
        message: "Account is deactivated. Please contact admin for support.",
      });
    }

    // Check if OTP exists
    if (!user.lastOTP) {
      return res.status(400).json({
        status: "400",
        message: "No OTP found. Please request a new one.",
      });
    }

    // Check if OTP is expired
    if (new Date() > new Date(user.otpExpiry)) {
      // Clear expired OTP
      user.lastOTP = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(401).json({
        status: "401",
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.lastOTP !== inputOTP) {
      return res.status(401).json({
        status: "401",
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid - clear it and update user
    user.lastOTP = null;
    user.otpExpiry = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = Jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRE_DATE || "5d" },
    );

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.lastOTP;
    delete userResponse.otpExpiry;

    // Format response with populated data
    return res.status(200).json({
      status: "200",
      message: "OTP verified",
      data: {
        user: userResponse,
        departments: user.departments || [],
        assignedTasks: user.assignedTasks || [],
        token: token,
      },
    });
  } catch (error) {
    console.error("verifyOTP error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

export const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, password, role, departments, status } = req.body;

    // Check if user exists
    const checkUser = await UsersModel.findById(id);
    if (!checkUser) {
      return res.status(404).json({
        status: "404",
        message: "User not found",
      });
    }

    // Check if email already exists for another user
    if (email) {
      const checkEmail = await UsersModel.findOne({ email });
      if (checkEmail && checkEmail._id.toString() !== id) {
        return res.status(400).json({
          status: "400",
          message: "Email already exists",
        });
      }
    }
    // Prepare update data
    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    // Handle departments update - convert to ObjectIds
    if (departments && Array.isArray(departments)) {
      const invalidIds = departments.filter(
        (deptId) => !mongoose.Types.ObjectId.isValid(deptId),
      );
      if (invalidIds.length > 0) {
        return res.status(400).json({
          status: "400",
          message: "Invalid department ID(s) provided",
        });
      }
      updateData.departments = departments.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    }

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // If departments are being updated, update numberOfUsers counts
    if (departments && Array.isArray(departments)) {
      // Remove user from old departments
      const oldDepartmentIds = checkUser.departments || [];
      if (oldDepartmentIds.length > 0) {
        await DepartmentsModel.updateMany(
          { _id: { $in: oldDepartmentIds } },
          { $inc: { numberOfUsers: -1 } },
        );
      }

      // Add user to new departments
      const newDepartmentIds = departments.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      if (newDepartmentIds.length > 0) {
        await DepartmentsModel.updateMany(
          { _id: { $in: newDepartmentIds } },
          { $inc: { numberOfUsers: 1 } },
        );
      }
    }

    const updatedUser = await UsersModel.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate({
        path: "departments",
        model: "departments",
        select: "name numberOfUsers createdOn",
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select: "taskNumber name status priority",
      });

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.lastOTP;
    delete userResponse.otpExpiry;

    return res.status(200).json({
      status: "200",
      message: "User updated",
      data: userResponse,
    });
  } catch (error) {
    console.error("updateData error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to update data",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL USERS - With full population
// ============================================
export const getAll = async (req, res) => {
  try {
    const users = await UsersModel.find()
      .populate({
        path: "departments",
        model: "departments",
        select: "name numberOfUsers createdOn addedBy",
        populate: {
          path: "addedBy",
          model: "users",
          select: "fullname email",
        },
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select:
          "taskNumber name description status priority completenessLevel progress startDate deadline completedOn",
        populate: [
          {
            path: "taskFor",
            model: "departments",
            select: "name",
          },
          {
            path: "asignedTo",
            model: "users",
            select: "fullname email",
          },
        ],
      })
      .select("-password -lastOTP -otpExpiry")
      .sort({ fullname: 1 });

    return res.status(200).json({
      status: "200",
      message: "All users retrieved",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("getAll error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

// ============================================
// GET USERS BY DEPARTMENT ID - With full population
// ============================================
export const getUsersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        status: "400",
        message: "Invalid department ID format",
      });
    }

    const department = await DepartmentsModel.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        status: "404",
        message: "Department not found",
      });
    }

    const deptObjectId = new mongoose.Types.ObjectId(departmentId);

    // Find users using multiple approaches to handle both string and ObjectId storage
    let users = [];

    // Approach 1: Using native MongoDB driver
    const nativeDb = mongoose.connection.db;
    const nativeUsers = await nativeDb
      .collection("users")
      .find({ departments: deptObjectId })
      .toArray();

    if (nativeUsers.length > 0) {
      const userIds = nativeUsers.map((u) => u._id);
      users = await UsersModel.find({ _id: { $in: userIds } })
        .populate({
          path: "departments",
          model: "departments",
          select: "name numberOfUsers createdOn addedBy",
          populate: {
            path: "addedBy",
            model: "users",
            select: "fullname email",
          },
        })
        .populate({
          path: "assignedTasks",
          model: "tasks",
          select:
            "taskNumber name description status priority completenessLevel progress startDate deadline completedOn overdued",
          populate: [
            {
              path: "taskFor",
              model: "departments",
              select: "name",
            },
            {
              path: "asignedTo",
              model: "users",
              select: "fullname email",
            },
          ],
        })
        .select("-password -lastOTP -otpExpiry")
        .sort({ fullname: 1 });
    } else {
      // Approach 2: Using $elemMatch
      const elemMatchUsers = await UsersModel.find({
        departments: { $elemMatch: { $eq: deptObjectId } },
      }).select("_id");

      if (elemMatchUsers.length > 0) {
        const userIds = elemMatchUsers.map((u) => u._id);
        users = await getPopulatedUsers(userIds);
      } else {
        // Approach 3: Using aggregation pipeline
        const aggUsers = await UsersModel.aggregate([
          { $match: { departments: deptObjectId } },
          { $project: { _id: 1 } },
        ]);

        if (aggUsers.length > 0) {
          const userIds = aggUsers.map((u) => u._id);
          users = await getPopulatedUsers(userIds);
        } else {
          // Approach 4: Using $expr with $toString
          const stringMatchUsers = await UsersModel.find({
            $expr: {
              $in: [
                departmentId,
                {
                  $map: {
                    input: "$departments",
                    as: "dept",
                    in: { $toString: "$$dept" },
                  },
                },
              ],
            },
          }).select("_id");

          if (stringMatchUsers.length > 0) {
            const userIds = stringMatchUsers.map((u) => u._id);
            users = await getPopulatedUsers(userIds);
          }
        }
      }
    }

    // Helper function to get populated users
    async function getPopulatedUsers(userIds) {
      return await UsersModel.find({ _id: { $in: userIds } })
        .populate({
          path: "departments",
          model: "departments",
          select: "name numberOfUsers createdOn addedBy",
          populate: {
            path: "addedBy",
            model: "users",
            select: "fullname email",
          },
        })
        .populate({
          path: "assignedTasks",
          model: "tasks",
          select:
            "taskNumber name description status priority completenessLevel progress startDate deadline completedOn overdued",
          populate: [
            {
              path: "taskFor",
              model: "departments",
              select: "name",
            },
            {
              path: "asignedTo",
              model: "users",
              select: "fullname email",
            },
          ],
        })
        .select("-password -lastOTP -otpExpiry")
        .sort({ fullname: 1 });
    }

    return res.status(200).json({
      status: "200",
      message: "Users retrieved",
      count: users.length,
      department: {
        id: department._id,
        name: department.name,
      },
      data: users,
    });
  } catch (error) {
    console.error("getUsersByDepartment error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

export const singleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "400",
        message: "Invalid user ID format",
      });
    }

    const user = await UsersModel.findById(id)
      .populate({
        path: "departments",
        model: "departments",
        select: "name numberOfUsers createdOn addedBy",
        populate: {
          path: "addedBy",
          model: "users",
          select: "fullname email",
        },
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select:
          "taskNumber name description status priority completenessLevel progress startDate deadline completedOn overdued extendedDeadline reasonsForExtending",
        populate: [
          {
            path: "taskFor",
            model: "departments",
            select: "name",
          },
          {
            path: "asignedTo",
            model: "users",
            select: "fullname email",
          },
        ],
      })
      .select("-password -lastOTP -otpExpiry");

    if (!user) {
      return res.status(404).json({
        status: "404",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "200",
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("singleUser error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve user",
      error: error.message,
    });
  }
};

export const getUsersByDepartmentName = async (req, res) => {
  try {
    const { departmentName } = req.params;

    // Find department by name (case insensitive)
    const department = await DepartmentsModel.findOne({
      name: { $regex: new RegExp(`^${departmentName}$`, "i") },
    });

    if (!department) {
      return res.status(404).json({
        status: "404",
        message: "Department not found",
      });
    }

    const departmentId = department._id.toString();
    const deptObjectId = new mongoose.Types.ObjectId(departmentId);

    // Get users in this department - handle both string and ObjectId
    const users = await UsersModel.find({
      $or: [
        { departments: { $in: [departmentId] } },
        { departments: { $in: [deptObjectId] } },
      ],
    })
      .populate({
        path: "departments",
        model: "departments",
        select: "name numberOfUsers createdOn",
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select: "taskNumber name status priority progress",
        populate: {
          path: "taskFor",
          model: "departments",
          select: "name",
        },
      })
      .select("-password -lastOTP -otpExpiry")
      .sort({ fullname: 1 });

    return res.status(200).json({
      status: "200",
      message: "Users retrieved by department name",
      count: users.length,
      department: {
        id: department._id,
        name: department.name,
      },
      data: users,
    });
  } catch (error) {
    console.error("getUsersByDepartmentName error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

export const getUsersWithStats = async (req, res) => {
  try {
    const users = await UsersModel.find()
      .populate({
        path: "departments",
        model: "departments",
        select: "name",
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select: "status priority progress",
      })
      .select("-password -lastOTP -otpExpiry")
      .sort({ fullname: 1 });

    // Calculate stats for each user
    const usersWithStats = users.map((user) => {
      const tasks = user.assignedTasks || [];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(
        (task) => task.status === "Completed",
      ).length;
      const runningTasks = tasks.filter(
        (task) => task.status === "Running",
      ).length;
      const overdueTasks = tasks.filter(
        (task) => task.status === "Overdue",
      ).length;
      const highPriorityTasks = tasks.filter(
        (task) => task.priority === "High",
      ).length;

      // Calculate average progress
      let avgProgress = 0;
      if (totalTasks > 0) {
        const totalProgress = tasks.reduce((sum, task) => {
          return sum + (parseInt(task.progress) || 0);
        }, 0);
        avgProgress = Math.round(totalProgress / totalTasks);
      }

      return {
        ...user.toObject(),
        stats: {
          totalTasks,
          completedTasks,
          runningTasks,
          overdueTasks,
          highPriorityTasks,
          avgProgress,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        },
      };
    });

    return res.status(200).json({
      status: "200",
      message: "Users with statistics retrieved",
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    console.error("getUsersWithStats error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve users with stats",
      error: error.message,
    });
  }
};

export const getActiveUsersWithTasks = async (req, res) => {
  try {
    const users = await UsersModel.find({ status: "Active" })
      .populate({
        path: "departments",
        model: "departments",
        select: "name",
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select: "taskNumber name status priority progress deadline",
        match: { status: { $in: ["Running", "On Hold"] } },
        populate: {
          path: "taskFor",
          model: "departments",
          select: "name",
        },
      })
      .select("-password -lastOTP -otpExpiry")
      .sort({ fullname: 1 });

    return res.status(200).json({
      status: "200",
      message: "Active users with tasks retrieved",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("getActiveUsersWithTasks error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve active users",
      error: error.message,
    });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await UsersModel.find({ role: "Admin" })
      .populate({
        path: "departments",
        model: "departments",
        select: "name",
      })
      .select("-password -lastOTP -otpExpiry")
      .sort({ fullname: 1 });

    return res.status(200).json({
      status: "200",
      message: "Admins retrieved",
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    console.error("getAdmins error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve admins",
      error: error.message,
    });
  }
};

export const migrateDepartmentIds = async (req, res) => {
  try {
    // This should only be run by admin
    const users = await UsersModel.find();
    let updatedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        if (user.departments && user.departments.length > 0) {
          // Check if any departments are strings
          const hasStringIds = user.departments.some(
            (id) => typeof id === "string",
          );

          if (hasStringIds) {
            // Convert all department IDs to ObjectIds
            const objectIds = user.departments
              .filter((id) => mongoose.Types.ObjectId.isValid(id))
              .map((id) => new mongoose.Types.ObjectId(id));

            if (objectIds.length > 0) {
              await UsersModel.findByIdAndUpdate(user._id, {
                $set: { departments: objectIds },
              });
              updatedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`Error updating user ${user._id}:`, error.message);
        errorCount++;
      }
    }

    return res.status(200).json({
      status: "200",
      message: "Department IDs migration completed",
      data: {
        totalUsersProcessed: users.length,
        usersUpdated: updatedCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("migrateDepartmentIds error:", error.message);
    return res.status(500).json({
      status: "500",
      message: "Migration failed",
      error: error.message,
    });
  }
};
