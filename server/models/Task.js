/**
 * server/models/Task.js
 * Mongoose schema and model for Task resource (Practical 6 + Practical 5 Supplementary).
 *
 * Fields:
 *   title       — string, required, trimmed, max 120 chars
 *   description — string, optional, trimmed, max 500 chars
 *   completed   — boolean, default false
 *   status      — string enum ('pending' | 'completed'), default 'pending'
 *   priority    — string enum ('low' | 'medium' | 'high'), default 'medium'
 *                 [Practical 5 Supplementary Requirement]
 *   createdAt   — Date (timestamps: true)
 *   updatedAt   — Date (timestamps: true)
 *
 * Pre-save hooks:
 *   1. Sync completed ↔ status fields.
 *   2. Trim whitespace from title.  [Practical 5 Supplementary Requirement]
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
        values: ["pending", "ongoing", "completed"],
        message: "Status must be 'pending', 'ongoing', or 'completed'.",
      },
      default: "pending",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be 'low', 'medium', or 'high'.",
      },
      default: "medium",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        // Synchronize status and completed in JSON output safely
        if (ret.status !== undefined) {
          ret.completed = ret.status === "completed";
        } else if (ret.completed !== undefined) {
          ret.status = ret.completed ? "completed" : "pending";
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

/*
 * Pre-save hook — runs before every Task.save() call.
 *
 * Responsibility 1: Keep completed ↔ status in sync.
 * Responsibility 2 (Practical 5 Supplementary): Trim whitespace from title.
 */
taskSchema.pre("save", function (next) {
  // Auto-trim title whitespace
  if (this.title && typeof this.title === "string") {
    this.title = this.title.trim();
  }

  // Keep completed boolean and status string in sync
  if (this.isModified("completed") && !this.isModified("status")) {
    this.status = this.completed ? "completed" : "pending";
  } else if (this.isModified("status")) {
    this.completed = this.status === "completed";
  }

  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
