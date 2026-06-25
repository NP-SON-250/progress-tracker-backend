import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    taskNumber: { type: String },
    name: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ["Running", "On Hold", "Closed", "Completed", "Overdue"],
    },
    completenessLevel: {
      type: String,
      enum: ["L1", "L2", "L3", "L4", "L5", "L6"],
      default: "L1",
    },
    progress: {
      type: String,
      enum: ["0", "20", "40", "60", "80", "100"],
      default: "0",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    managerComment: [
      {
        type: String,
      },
    ],
    extendedDeadline: {
      type: Boolean,
      default: false,
    },
    extendedDate: { type: Date },
    reasonsForExtending: {
      type: String,
    },
    startDate: { type: Date },
    deadline: { type: Date },
    completedOn: { type: Date },
    overdued: { type: Boolean, default: false },
    taskFor: { type: mongoose.Schema.ObjectId, ref: "departments" },
    asignedTo: [{ type: mongoose.Schema.ObjectId, ref: "users" }],
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Running", "On Hold", "Completed", "Closed", "Overdue"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);
const TasksModel = mongoose.models.tasks || mongoose.model("tasks", taskSchema);
export default TasksModel;
