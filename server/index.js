/**
 * server/index.js
 * Express REST API for Student Portfolio Task Manager & Authentication (Practical 7)
 * Backed by MongoDB via Mongoose. Email delivery via central Nodemailer service.
 *
 * Auth Routes:
 *   POST   /register              — Register new user with bcrypt password hashing
 *   POST   /login                 — User login & JWT issuance (creates server-side session)
 *   GET    /me                    — Safe current user profile (protected)
 *   POST   /auth/refresh          — Renew JWT + slide inactivity window (active sessions only)
 *   POST   /auth/logout           — Terminate the server-side session (protected)
 *   POST   /forgot-password       — Request password reset (emails reset link)
 *   POST   /reset-password/:token — Reset password using valid token
 *
 * Task Routes (Protected by JWT Auth Middleware & Validation Pipeline):
 *   GET    /tasks          — fetch all tasks from MongoDB
 *   GET    /tasks/:id      — fetch a single task by MongoDB ObjectId (P5 Supplementary)
 *   POST   /tasks          — create a task in MongoDB (validated)
 *   PUT    /tasks/:id      — update a task by MongoDB _id (validated; emails on → completed)
 *   DELETE /tasks/:id      — delete a task by MongoDB _id (validated)
 *   GET    /health         — health & DB connection check
 *
 * Run:  node server/index.js   (from project root)
 *       or: npm run server
 *       or: cd server && npm run dev
 */

import "./loadEnv.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import Task from "./models/Task.js";
import User from "./models/User.js";
import Session from "./models/Session.js";
import auth, { INACTIVITY_TIMEOUT_MS } from "./middleware/auth.js";
import requireAdmin from "./middleware/admin.js";
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} from "./middleware/validation.js";
import {
  verifyTransporter,
  sendPasswordResetEmail,
  sendTaskCompletedEmail,
} from "./services/emailService.js";
import PDFDocument from "pdfkit";

const app = express();
const PORT = process.env.PORT ?? 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_portfolio";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret";
// Single source of truth for JWT lifetime (login + refresh)
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || "15m";

/**
 * Normalize task status for legacy documents that may only have `completed`.
 * Prefer an explicit usable status when present.
 */
function normalizeTaskStatus(task) {
  if (
    task?.status &&
    ["pending", "ongoing", "completed"].includes(task.status)
  ) {
    return task.status;
  }
  if (task?.completed === true) return "completed";
  if (task?.completed === false) return "pending";
  return "pending";
}

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

    // Generate JWT with a unique jti linking the token to a server-side
    // session record (used for inactivity enforcement).
    const jti = crypto.randomUUID();
    const token = jwt.sign(
      { id: user._id, role: user.role, jti },
      JWT_SECRET,
      { expiresIn: TOKEN_TTL }
    );

    // Create the server-side session. The auth middleware checks its
    // lastActivityAt on every protected request (30s inactivity window).
    await Session.create({
      userId: user._id,
      jti,
      lastActivityAt: new Date(),
    });

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

// POST /auth/refresh — Renew JWT for active users (PROTECTED)
// Requires a valid, non-expired JWT AND an active server-side session:
// the session's lastActivityAt must be within the inactivity window.
// This prevents indefinite renewal of an abandoned session. On success the
// inactivity window slides forward and a new JWT is issued with the SAME
// jti, so every tab sharing the token remains valid.
app.post("/auth/refresh", auth, async (req, res) => {
  try {
    // req.user is populated by auth middleware from the verified JWT
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: ["User not found."],
      });
    }

    // Inactivity check — defense in depth on top of the auth middleware
    const session = await Session.findOne({ jti: req.user.jti });
    if (!session) {
      return res.status(401).json({
        success: false,
        errors: ["Your session has expired. Please log in again."],
      });
    }

    if (Date.now() - session.lastActivityAt.getTime() > INACTIVITY_TIMEOUT_MS) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        success: false,
        errors: [
          "Your session has expired due to inactivity. Please log in again.",
        ],
      });
    }

    // Slide the inactivity window forward
    session.lastActivityAt = new Date();
    await session.save();

    // Issue new JWT with same id, role, and jti — role always from DB,
    // never from client
    const newToken = jwt.sign(
      { id: user._id, role: user.role, jti: req.user.jti },
      JWT_SECRET,
      { expiresIn: TOKEN_TTL }
    );

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error refreshing token:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to refresh token."],
    });
  }
});

// POST /auth/logout — Terminate the server-side session (PROTECTED)
// Deletes the session record so the current JWT is rejected on the next
// request everywhere, including other tabs sharing the same token.
app.post("/auth/logout", auth, async (req, res) => {
  try {
    if (req.user.jti) {
      await Session.deleteOne({ jti: req.user.jti });
    }

    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({
      success: false,
      errors: ["Failed to log out."],
    });
  }
});

// POST /forgot-password — Request password reset link (PUBLIC)
app.post("/forgot-password", validateForgotPassword, async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    if (user) {
      // Generate 32-byte secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Hash raw token using SHA-256
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
      await user.save();

      const resetUrl = `${CLIENT_ORIGIN}/reset-password/${rawToken}`;

      // Deliver reset link by email (failure must not change generic response)
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
      });

      if (!emailResult.success) {
        console.error(
          "Forgot-password email failed for registered user. Ensure SMTP is configured (MAIL_* in server/.env)."
        );
      }

      // Development-only reset link logging (backup when SMTP is unavailable)
      if (process.env.NODE_ENV !== "production") {
        console.log("\n==========================================");
        console.log("Password reset link:");
        console.log(resetUrl);
        console.log("==========================================\n");
      }
    }

    // Account enumeration protection: Return generic success message
    res.json({
      success: true,
      message:
        "If an account exists for this email, password reset instructions have been generated.",
    });
  } catch (err) {
    console.error("Error during forgot-password request:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to process password reset request."],
    });
  }
});

// POST /reset-password/:token — Reset password using valid token (PUBLIC)
app.post("/reset-password/:token", validateResetPassword, async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        errors: ["Password reset token is required."],
      });
    }

    // Hash raw token with SHA-256 to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        errors: ["Password reset token is invalid or has expired."],
      });
    }

    // Hash new password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error("Error during password reset:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to reset password."],
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
        role: user.role,
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

// GET /tasks — fetch tasks (newest first)
// Normal users see only their own tasks; admins see all tasks.
app.get("/tasks", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "admin" ? {} : { userId: req.user.id };
    const tasks = await Task.find(query).sort({ createdAt: -1 });
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
 * Normal users can only access their own tasks; admins can access any task.
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

    // Enforce ownership for non-admin users
    if (req.user.role !== "admin" && task.userId?.toString() !== req.user.id) {
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
// userId is always set from the authenticated user; client-supplied userId is ignored.
app.post("/tasks", auth, validateCreateTask, async (req, res) => {
  try {
    const { title, description = "", status, completed, priority } = req.body;

    let finalStatus = "pending";
    if (status && ["pending", "ongoing", "completed"].includes(status)) {
      finalStatus = status;
    } else if (completed !== undefined) {
      finalStatus = completed ? "completed" : "pending";
    }

    const isCompleted = finalStatus === "completed";

    const task = await Task.create({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      completed: isCompleted,
      status: finalStatus,
      // Practical 5 Supplementary — persist priority (defaults to 'medium' via schema)
      ...(priority !== undefined && { priority }),
      // Always set ownership from authenticated user — never trust client
      userId: req.user.id,
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
// Normal users can only update their own tasks; admins can update any task.
// Client cannot change task ownership via this endpoint.
app.put(
  "/tasks/:id",
  auth,
  validateTaskId,
  validateUpdateTask,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, completed, priority } = req.body;

      const existingTask = await Task.findById(id);
      if (!existingTask) {
        return res
          .status(404)
          .json({ success: false, errors: ["Task not found."] });
      }

      // Enforce ownership for non-admin users
      if (
        req.user.role !== "admin" &&
        existingTask.userId?.toString() !== req.user.id
      ) {
        return res
          .status(404)
          .json({ success: false, errors: ["Task not found."] });
      }

      const previousStatus = normalizeTaskStatus(existingTask);
      const updateData = {};

      if (title !== undefined) {
        updateData.title = title.trim();
      }

      if (description !== undefined) {
        updateData.description =
          typeof description === "string" ? description.trim() : "";
      }

      if (status !== undefined) {
        updateData.status = status;
        updateData.completed = status === "completed";
      } else if (completed !== undefined) {
        updateData.completed = Boolean(completed);
        updateData.status = updateData.completed ? "completed" : "pending";
      }

      // Practical 5 Supplementary — allow priority updates
      if (priority !== undefined) {
        updateData.priority = priority;
      }

      // Prevent ownership reassignment through task update
      // userId is never included in updateData

      const task = await Task.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!task) {
        return res
          .status(404)
          .json({ success: false, errors: ["Task not found."] });
      }

      const newStatus = normalizeTaskStatus(task);

      // Return successful task update to client immediately
      res.json({ success: true, data: task });

      // Attempt task completion notification asynchronously (non-blocking)
      if (previousStatus !== "completed" && newStatus === "completed") {
        User.findById(req.user.id)
          .then((user) => {
            if (user?.email) {
              sendTaskCompletedEmail({
                to: user.email,
                task,
              })
                .then((emailResult) => {
                  if (!emailResult.success) {
                    console.error(
                      "Task completion email failed after successful MongoDB update. Task remains completed. Diagnostic:",
                      emailResult.error
                    );
                  }
                })
                .catch((emailErr) => {
                  console.error(
                    "Task completion email error (task update preserved):",
                    emailErr?.message || emailErr
                  );
                });
            } else {
              console.error(
                "Task completion email skipped: authenticated user email not found."
              );
            }
          })
          .catch((userErr) => {
            console.error(
              "Task completion email skipped: failed to fetch user record.",
              userErr?.message || userErr
            );
          });
      }
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
// Normal users can only delete their own tasks; admins can delete any task.
app.delete("/tasks/:id", auth, validateTaskId, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, errors: ["Task not found."] });
    }

    // Enforce ownership for non-admin users
    if (req.user.role !== "admin" && task.userId?.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, errors: ["Task not found."] });
    }

    await Task.findByIdAndDelete(id);

    res.json({ success: true, message: "Task deleted successfully." });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "Failed to delete task."],
    });
  }
});

/* ── Admin Routes (Protected by auth + requireAdmin) ────── */

// GET /admin — admin-only endpoint (placeholder for future reports/PDF)
app.get("/admin", auth, requireAdmin, (_req, res) => {
  res.json({
    success: true,
    message: "Admin access granted.",
    data: { area: "admin" },
  });
});

// ── Helper: Validate date range query params ─────────────
function validateDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) {
    return { valid: false, error: "Both fromDate and toDate are required." };
  }
  const start = new Date(fromDate + "T00:00:00.000Z");
  const end = new Date(toDate + "T23:59:59.999Z");
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: "Invalid date format. Use YYYY-MM-DD." };
  }
  if (start > end) {
    return { valid: false, error: "fromDate must be before or equal to toDate." };
  }
  return { valid: true, start, end };
}

// ── Helper: Generate PDF report ──────────────────────────
function generateTaskReportPdf(tasks, dateRange, res) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="task-report-${dateRange.fromDate}-to-${dateRange.toDate}.pdf"`
  );

  doc.pipe(res);

  const pageWidth = doc.page.width - 100;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const year = d.getUTCFullYear();
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  // Title
  doc.fontSize(24).text("TASK REPORT", { align: "center", width: pageWidth });
  doc.moveDown(2);

  // Date range
  doc.fontSize(12);
  doc.text("Date Range:", { width: pageWidth });
  doc.text(`  From: ${formatDate(dateRange.fromDate)}`, { width: pageWidth });
  doc.text(`  To: ${formatDate(dateRange.toDate)}`, { width: pageWidth });
  doc.moveDown();

  // Generated timestamp
  doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, { width: pageWidth });
  doc.moveDown(2);

  // Summary
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const ongoing = tasks.filter((t) => t.status === "ongoing").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  doc.fontSize(16).text("SUMMARY", { width: pageWidth });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Total Tasks: ${total}`, { width: pageWidth });
  doc.text(`Pending: ${pending}`, { width: pageWidth });
  doc.text(`Ongoing: ${ongoing}`, { width: pageWidth });
  doc.text(`Completed: ${completed}`, { width: pageWidth });
  doc.moveDown(2);

  // Task details
  doc.fontSize(16).text("TASK DETAILS", { width: pageWidth });
  doc.moveDown();

  if (tasks.length === 0) {
    doc.fontSize(12).text("No tasks found for the selected date range.", { width: pageWidth });
  } else {
    tasks.forEach((task, index) => {
      if (doc.y > 650) {
        doc.addPage();
      }

      doc.fontSize(14).text(`${index + 1}. ${task.title}`, { width: pageWidth });
      doc.fontSize(10);
      doc.text(`Description: ${task.description || "N/A"}`, { width: pageWidth });
      doc.text(`Status: ${task.status}`, { width: pageWidth });
      doc.text(`Priority: ${task.priority}`, { width: pageWidth });
      doc.text(`User: ${task.userId?.email || "Unknown User"}`, { width: pageWidth });
      doc.text(`Created: ${formatDateTime(task.createdAt)}`, { width: pageWidth });
      doc.text(`Updated: ${formatDateTime(task.updatedAt)}`, { width: pageWidth });
      doc.moveDown();
    });
  }

  doc.end();
}

// GET /admin/reports/tasks — admin-only task report (JSON)
app.get("/admin/reports/tasks", auth, requireAdmin, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const validation = validateDateRange(fromDate, toDate);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: [validation.error],
      });
    }

    const tasks = await Task.find({
      createdAt: { $gte: validation.start, $lte: validation.end },
    })
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
      dateRange: { fromDate, toDate },
    });
  } catch (err) {
    console.error("Error generating task report:", err);
    res.status(500).json({
      success: false,
      errors: ["Failed to generate report."],
    });
  }
});

// GET /admin/reports/tasks/pdf — admin-only task report (PDF)
app.get("/admin/reports/tasks/pdf", auth, requireAdmin, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const validation = validateDateRange(fromDate, toDate);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: [validation.error],
      });
    }

    const tasks = await Task.find({
      createdAt: { $gte: validation.start, $lte: validation.end },
    })
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    generateTaskReportPdf(tasks, { fromDate, toDate }, res);
  } catch (err) {
    console.error("Error generating task report PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        errors: ["Failed to generate PDF report."],
      });
    }
  }
});

/* ── 404 catch-all ───────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ success: false, errors: ["Route not found."] });
});

/* ── Start server ────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ✓  Task Manager API running on http://localhost:${PORT}\n`);
  // Non-blocking SMTP check — failure must not crash the process
  verifyTransporter().catch((err) => {
    console.error(
      "  ✗  Email service unavailable.",
      "\n     Check MAIL_HOST, MAIL_PORT, MAIL_USER and MAIL_PASS."
    );
    if (err?.message) {
      console.error(`     Diagnostic: ${err.message}`);
    }
  });
});
