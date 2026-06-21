import mongoose from "mongoose";
const departmentSchema = new mongoose.Schema({
  name: { type: String },
  numberOfUsers: { type: Number },
  departmentTasks: [{ type: mongoose.Schema.ObjectId, ref: "tasks" }],
  addedBy: { type: mongoose.Schema.ObjectId, ref: "users" },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date },
});
const DepartmentsModel =
  mongoose.models.departments ||
  mongoose.model("departments", departmentSchema);
export default DepartmentsModel;
