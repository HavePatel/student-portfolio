/**
 * server/middleware/validation.js
 * Server-Side Validation Middleware Pipeline for Practical 7.
 *
 * Provides validation functions for:
 *   - User registration (validateRegister)
 *   - User login (validateLogin)
 *   - Task creation (validateCreateTask)
 *   - Task updates (validateUpdateTask)
 *   - Task ID format (validateTaskId)
 */

import mongoose from "mongoose";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/**
 * Validates POST /register payload.
 */
export const validateRegister = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address.");
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password is required.");
  } else if (password.trim().length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validates POST /login payload.
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required.");
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validates POST /tasks creation payload.
 * Practical 5 Supplementary: validates optional `priority` field.
 */
export const validateCreateTask = (req, res, next) => {
  const { title, priority } = req.body || {};
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Title is required and cannot be empty.");
  } else if (title.trim().length > 120) {
    errors.push("Title cannot exceed 120 characters.");
  }

  // Practical 5 Supplementary — priority enum validation
  if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be 'low', 'medium', or 'high'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validates PUT /tasks/:id payload for partial task updates.
 * Practical 5 Supplementary: validates optional `priority` field.
 */
export const validateUpdateTask = (req, res, next) => {
  const { title, description, status, completed, priority } = req.body || {};
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      errors.push("Title cannot be empty.");
    } else if (title.trim().length > 120) {
      errors.push("Title cannot exceed 120 characters.");
    }
  }

  if (description !== undefined && typeof description === "string") {
    if (description.trim().length > 500) {
      errors.push("Description cannot exceed 500 characters.");
    }
  }

  if (status !== undefined) {
    if (!["pending", "completed"].includes(status)) {
      errors.push("Status must be either 'pending' or 'completed'.");
    }
  }

  // Practical 5 Supplementary — priority enum validation
  if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be 'low', 'medium', or 'high'.");
  }

  if (
    title === undefined &&
    description === undefined &&
    status === undefined &&
    completed === undefined &&
    priority === undefined
  ) {
    errors.push("At least one valid field must be provided for update.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

/**
 * Validates MongoDB ObjectId parameter format.
 */
export const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      errors: ["Invalid task ID format."],
    });
  }
  next();
};
