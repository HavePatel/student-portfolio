/**
 * server/models/Task.js
 * Mongoose schema and model for Task resource (Practical 6).
 *
 * Fields:
 *   title       — string, required, trimmed, max 120 chars
 *   description — string, optional, trimmed, max 500 chars
 *   completed   — boolean, default false
 *   status      — string enum ('pending' | 'completed'), default 'pending'
 *   createdAt   — Date (timestamps: true)
 *   updatedAt   — Date (timestamps: true)
 */

import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      minlength: [1, "Title cannot be empty."],
      maxlength: [120, "Title cannot exceed 120 characters."],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: "Status must be either 'pending' or 'completed'.",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        // Synchronize status and completed in JSON output
        if (ret.completed !== undefined) {
          ret.status = ret.completed ? "completed" : "pending";
        } else if (ret.status !== undefined) {
          ret.completed = ret.status === "completed";
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Keep completed (boolean) and status (string enum) in sync before saving
taskSchema.pre("save", function (next) {
  if (this.isModified("completed") && !this.isModified("status")) {
    this.status = this.completed ? "completed" : "pending";
  } else if (this.isModified("status") && !this.isModified("completed")) {
    this.completed = this.status === "completed";
  }
  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
