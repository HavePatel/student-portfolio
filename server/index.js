/**
 * server/index.js
 * Express REST API for Student Portfolio Task Manager (Practical 6)
 * Backed by MongoDB via Mongoose.
 *
 * Routes:
 *   GET    /tasks          — fetch all tasks from MongoDB
 *   POST   /tasks          — create a task in MongoDB
 *   PUT    /tasks/:id      — update a task by MongoDB _id
 *   DELETE /tasks/:id      — delete a task by MongoDB _id
 *   GET    /health         — health & DB connection check
 *
 * Run:  node server/index.js   (from project root)
 *       or: npm run server
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Task from "./models/Task.js";

const app = express();
const PORT = process.env.PORT ?? 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_portfolio";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

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
    allowedHeaders: ["Content-Type"],
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

/* ── Routes ──────────────────────────────────────────────── */

// GET /tasks — fetch all tasks (newest first)
app.get("/tasks", async (_req, res) => {
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

// POST /tasks — create a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, description = "", status, completed } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, errors: ["Title is required."] });
    }

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
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, errors: ["Invalid task ID format."] });
    }

    const { title, description, status, completed } = req.body;
    const updateData = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res
          .status(400)
          .json({ success: false, errors: ["Title cannot be empty."] });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = typeof description === "string" ? description.trim() : "";
    }

    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
      updateData.status = updateData.completed ? "completed" : "pending";
    }

    if (status !== undefined) {
      if (!["pending", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          errors: ["Status must be 'pending' or 'completed'."],
        });
      }
      updateData.status = status;
      if (completed === undefined) {
        updateData.completed = status === "completed";
      }
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
});

// DELETE /tasks/:id — delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, errors: ["Invalid task ID format."] });
    }

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
