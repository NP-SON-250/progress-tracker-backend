import UsersModel from "../models/users.model.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendWelcomeMessage, sendOTP } from "../utils/emailTemplate.js";
import { OTPGenerator } from "../utils/otpGenerator.js";
import mongoose from "mongoose";
export const newAccount = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createdUser = await UsersModel.create({
      fullname,
      email,
      password: hashedPassword,
      lastOTP: null,
      otpExpiry: null,
      lastLogin: null,
    });
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
//Verify OTP and generate JWT
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
        select: "name numberOfUsers createdOn",
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select: "taskNumber name description status priority startDate endDate",
        populate: {
          path: "taskFor",
          model: "departments",
          select: "name",
        },
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
    const { fullname, email, password, role } = req.body;

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

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await UsersModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return res.status(200).json({
      status: "200",
      message: "User updated",
      data: userResponse,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to update data",
      error: error.message,
    });
  }
};
export const getAll = async (req, res) => {
  try {
    const users = await UsersModel.find().select("-password");
    return res.status(200).json({
      status: "200",
      message: "All users retrieved",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};
// Get users by department ID
export const getUsersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    // Validate departmentId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        status: "400",
        message: "Invalid department ID format",
      });
    }
    // Find users that belong to this department
    const users = await UsersModel.find({
      departments: { $in: [departmentId] },
    })
      .populate({
        path: "departments",
        model: "departments",
        select: "name",
      })
      .select("-password -lastOTP -otpExpiry")
      .sort({ fullname: 1 });

    return res.status(200).json({
      status: "200",
      message: "Users retrieved",
      data: users,
      count: users.length,
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
// Get a single user by ID with populated data
export const singleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UsersModel.findById(id)
      .populate({
        path: "departments",
        model: "departments",
        select: "name numberOfUsers createdOn",
      })
      .populate({
        path: "assignedTasks",
        model: "tasks",
        select:
          "taskNumber name description status priority startDate endDate completenessLevel progress",
        populate: {
          path: "taskFor",
          model: "departments",
          select: "name",
        },
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
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const findUser = await UsersModel.findById(id);
    if (!findUser) {
      return res.status(404).json({
        status: "404",
        message: "User not found",
      });
    }

    const deletedUser = await UsersModel.findByIdAndDelete(id);

    return res.status(200).json({
      status: "200",
      message: "User deleted",
      data: deletedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "500",
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
