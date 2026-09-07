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
        values: ["pending", "completed"],
        message: "Status must be either 'pending' or 'completed'.",
      },
      default: "pending",
    },
    /*
     * Practical 5 Supplementary — Priority field
     * Restricted to three values via Mongoose enum validation.
     * Existing documents without priority will read as undefined
     * but default to 'medium' on next save.
     */
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be 'low', 'medium', or 'high'.",
      },
      default: "medium",
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

/*
 * Pre-save hook — runs before every Task.save() call.
 *
 * Responsibility 1 (existing): Keep completed ↔ status in sync.
 * Responsibility 2 (Practical 5 Supplementary): Trim whitespace from title.
 *
 * Both concerns are handled in a single hook to avoid duplicate
 * middleware registration and keep execution order predictable.
 */
taskSchema.pre("save", function (next) {
  // Practical 5 Supplementary — auto-trim title whitespace
  if (this.title && typeof this.title === "string") {
    this.title = this.title.trim();
  }

  // Existing — keep completed boolean and status string in sync
  if (this.isModified("completed") && !this.isModified("status")) {
    this.status = this.completed ? "completed" : "pending";
  } else if (this.isModified("status") && !this.isModified("completed")) {
    this.completed = this.status === "completed";
  }

  next();
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
