import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  fullname: { type: String },
  email: { type: String },
  password: { type: String },
  role: {
    type: String,
    enum: ["User", "Admin"],
    default: "User",
  },
  departments: [{ type: mongoose.Schema.ObjectId, ref: "departments" }],
  assignedTasks: [{ type: mongoose.Schema.ObjectId, ref: "tasks" }],
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  lastOTP: { type: String },
  otpExpiry: { type: Date },
  lastLogin: { type: Date },
  registeredOn: { type: Date, default: Date.now },
  deactivatedOn: { type: Date },
});
const UsersModel = mongoose.models.users || mongoose.model("users", userSchema);
export default UsersModel;
