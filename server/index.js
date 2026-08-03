/**
 * server/index.js
 * Express REST API for the Task Manager (Practical 4)
 *
 * Routes:
 *   GET    /tasks          — fetch all tasks
 *   POST   /tasks          — create a task
 *   PUT    /tasks/:id      — update a task
 *   DELETE /tasks/:id      — delete a task
 *
 * Run:  node server/index.js   (from project root)
 *       or: npm run server
 */

import express from "express";
import cors    from "cors";
import { randomUUID } from "crypto";

const app  = express();
const PORT = process.env.PORT ?? 5000;

/* ── Middleware ──────────────────────────────────────────── */
app.use(cors({ origin: "http://localhost:5173" }));  // Vite dev server
app.use(express.json());

// Request logger middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* ── In-memory data store ────────────────────────────────── */
// Seeded with demo tasks so the UI is never blank on first load.
let tasks = [
  {
    id:          randomUUID(),
    title:       "Set up Express server",
    description: "Initialise the Node/Express backend with CORS and JSON middleware.",
    status:      "completed",
    createdAt:   new Date("2025-07-01T09:00:00Z").toISOString(),
    updatedAt:   new Date("2025-07-01T09:30:00Z").toISOString(),
  },
  {
    id:          randomUUID(),
    title:       "Build REST API endpoints",
    description: "Implement GET, POST, PUT and DELETE routes for the task resource.",
    status:      "completed",
    createdAt:   new Date("2025-07-01T10:00:00Z").toISOString(),
    updatedAt:   new Date("2025-07-01T11:00:00Z").toISOString(),
  },
  {
    id:          randomUUID(),
    title:       "Integrate React frontend",
    description: "Connect the React Task Manager page to the Express API using fetch.",
    status:      "pending",
    createdAt:   new Date("2025-07-02T08:00:00Z").toISOString(),
    updatedAt:   new Date("2025-07-02T08:00:00Z").toISOString(),
  },
];

/* ── Validation helper ───────────────────────────────────── */
function validateTask({ title, description, status }) {
  const errors = [];
  if (!title?.trim())       errors.push("Title is required.");
  if (!description?.trim()) errors.push("Description is required.");
  if (status && !["pending", "completed"].includes(status))
    errors.push("Status must be 'pending' or 'completed'.");
  return errors;
}

/* ── Routes ──────────────────────────────────────────────── */

// GET /tasks
app.get("/tasks", (_req, res) => {
  res.json({ success: true, data: tasks, count: tasks.length });
});

// POST /tasks
app.post("/tasks", (req, res) => {
  const { title, description, status = "pending" } = req.body;

  const errors = validateTask({ title, description, status });
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const now  = new Date().toISOString();
  const task = {
    id:          randomUUID(),
    title:       title.trim(),
    description: description.trim(),
    status,
    createdAt:   now,
    updatedAt:   now,
  };

  tasks.unshift(task);   // newest first
  res.status(201).json({ success: true, data: task });
});

// PUT /tasks/:id
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const index  = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, errors: ["Task not found."] });
  }

  const { title, description, status } = req.body;
  const errors = validateTask({
    title:       title       ?? tasks[index].title,
    description: description ?? tasks[index].description,
    status:      status      ?? tasks[index].status,
  });
  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  tasks[index] = {
    ...tasks[index],
    title:       (title       ?? tasks[index].title).trim(),
    description: (description ?? tasks[index].description).trim(),
    status:      status ?? tasks[index].status,
    updatedAt:   new Date().toISOString(),
  };

  res.json({ success: true, data: tasks[index] });
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);

  if (tasks.length === before) {
    return res.status(404).json({ success: false, errors: ["Task not found."] });
  }

  res.json({ success: true, message: "Task deleted." });
});

/* ── 404 catch-all ───────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ success: false, errors: ["Route not found."] });
});

/* ── Start ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ✓  Task Manager API running on http://localhost:${PORT}\n`);
});
