/**
 * server/index.js
 * Express REST API for Student Portfolio Task Manager & Authentication (Practical 7)
 * Backed by MongoDB via Mongoose.
 *
 * Auth Routes:
 *   POST   /register       — Register new user with bcrypt password hashing
 *   POST   /login          — User login & JWT issuance
 *   GET    /me             — Safe current user profile (protected)
 *
 * Task Routes (Protected by JWT Auth Middleware & Validation Pipeline):
 *   GET    /tasks          — fetch all tasks from MongoDB
 *   GET    /tasks/:id      — fetch a single task by MongoDB ObjectId (P5 Supplementary)
 *   POST   /tasks          — create a task in MongoDB (validated)
 *   PUT    /tasks/:id      — update a task by MongoDB _id (validated)
 *   DELETE /tasks/:id      — delete a task by MongoDB _id (validated)
 *   GET    /health         — health & DB connection check
 *
 * Run:  node server/index.js   (from project root)
 *       or: npm run server
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Task from "./models/Task.js";
import User from "./models/User.js";
import auth from "./middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} from "./middleware/validation.js";

const app = express();
const PORT = process.env.PORT ?? 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_portfolio";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret";

/* ── MongoDB Connection ──────────────────────────────────── */
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`  ✓  Connected to MongoDB: ${MONGODB_URI}`);
  })
  .catch((err) => {
    console.error("  ✗  MongoDB connection error:", err.message);
    console.error(
      "     Please ensure your MongoDB server is running (e.g. mongod or MongoDB Community Server)."
    );
  });

/* ── Middleware ──────────────────────────────────────────── */
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Request logger middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* ── Health check ────────────────────────────────────────── */
app.get("/health", (_req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : mongoose.connection.readyState === 2
      ? "connecting"
      : "disconnected";
  res.json({
    status: "ok",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

/* ── Auth Endpoints ──────────────────────────────────────── */

// POST /register — Register a new user
app.post("/register", validateRegister, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        errors: ["A user with this email address already exists."],
      });
    }

    // Hash password with bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to register user."],
    });
  }
});

// POST /login — Login & issue JWT token
app.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: ["Invalid email or password."],
      });
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errors: ["Invalid email or password."],
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to log in."],
    });
  }
});

// GET /me — Safe profile endpoint (Protected)
app.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ["User not found."],
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to fetch user info."],
    });
  }
});

/* ── Task Routes (Protected by auth & validation pipeline) ── */

// GET /tasks — fetch all tasks (newest first)
app.get("/tasks", auth, async (_req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tasks, count: tasks.length });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to fetch tasks from database."],
    });
  }
});

/*
 * GET /tasks/:id — fetch a single task by MongoDB ObjectId
 * Practical 5 Supplementary Requirement
 *
 * Responses:
 *   200  task found          { success: true,  data: task }
 *   400  invalid ObjectId    { success: false, errors: ["Invalid task ID"] }
 *   401  no / bad JWT        (handled by auth middleware)
 *   404  valid ID, no doc    { success: false, errors: ["Task not found"] }
 *   500  database error
 *
 * ObjectId validation is handled by the existing validateTaskId middleware
 * which already returns 400 for malformed IDs, so no duplication here.
 */
app.get("/tasks/:id", auth, validateTaskId, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        errors: ["Task not found."],
      });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    console.error("Error fetching task by ID:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to fetch task."],
    });
  }
});

// POST /tasks — create a new task
app.post("/tasks", auth, validateCreateTask, async (req, res) => {
  try {
    const { title, description = "", status, completed, priority } = req.body;

    const isCompleted =
      completed !== undefined ? Boolean(completed) : status === "completed";
    const finalStatus =
      status && ["pending", "completed"].includes(status)
        ? status
        : isCompleted
        ? "completed"
        : "pending";

    const task = await Task.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      completed: isCompleted,
      status: finalStatus,
      // Practical 5 Supplementary — persist priority (defaults to 'medium' via schema)
      ...(priority !== undefined && { priority }),
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error("Error creating task:", err);
    const errors =
      err.name === "ValidationError"
        ? Object.values(err.errors).map((e) => e.message)
        : [err.message || "Failed to create task."];
    res.status(400).json({ success: false, errors });
  }
});

// PUT /tasks/:id — update an existing task
app.put(
  "/tasks/:id",
  auth,
  validateTaskId,
  validateUpdateTask,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, completed, priority } = req.body;
      const updateData = {};

      if (title !== undefined) {
        updateData.title = title.trim();
      }

      if (description !== undefined) {
        updateData.description =
          typeof description === "string" ? description.trim() : "";
      }

      if (completed !== undefined) {
        updateData.completed = Boolean(completed);
        updateData.status = updateData.completed ? "completed" : "pending";
      }

      if (status !== undefined) {
        updateData.status = status;
        if (completed === undefined) {
          updateData.completed = status === "completed";
        }
      }

      // Practical 5 Supplementary — allow priority updates
      if (priority !== undefined) {
        updateData.priority = priority;
      }

      const task = await Task.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!task) {
        return res
          .status(404)
          .json({ success: false, errors: ["Task not found."] });
      }

      res.json({ success: true, data: task });
    } catch (err) {
      console.error("Error updating task:", err);
      const errors =
        err.name === "ValidationError"
          ? Object.values(err.errors).map((e) => e.message)
          : [err.message || "Failed to update task."];
      res.status(400).json({ success: false, errors });
    }
  }
);

// DELETE /tasks/:id — delete a task
app.delete("/tasks/:id", auth, validateTaskId, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, errors: ["Task not found."] });
    }

    res.json({ success: true, message: "Task deleted successfully." });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to delete task."],
    });
  }
});

/* ── 404 catch-all ───────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ success: false, errors: ["Route not found."] });
});

/* ── Start server ────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ✓  Task Manager API running on http://localhost:${PORT}\n`);
});
