/**
 * server/services/emailService.js
 * Central Nodemailer email service for Student Portfolio.
 *
 * Responsibilities:
 *   - Create one SMTP transporter from environment variables
 *   - Validate required SMTP configuration at startup
 *   - Support optional custom CA certificate via MAIL_CA_PATH
 *   - Support opt-in local dev TLS bypass via MAIL_TLS_ALLOW_INSECURE
 *   - Verify transporter on backend startup (non-fatal, categorized diagnostics)
 *   - Send password-reset emails
 *   - Send task-completion notification emails
 *
 * Credentials are read ONLY from process.env (server/.env).
 * Never hard-code SMTP secrets here.
 */

import nodemailer from "nodemailer";
import fs from "fs";

const OXFORD = "#002147";
const TAN = "#D2B48C";
const LIGHT_BG = "#f7f5f2";

/** Lazily create one shared transporter so env vars are available after loadEnv. */
let transporter = null;

/**
 * Validate required email configuration environment variables without exposing sensitive values.
 * @returns {{ valid: boolean, missing: string[], error?: string }}
 */
export function validateEmailConfig() {
  const missing = [];
  if (!process.env.MAIL_HOST) missing.push("MAIL_HOST");
  if (!process.env.MAIL_PORT) missing.push("MAIL_PORT");
  if (!process.env.MAIL_USER) missing.push("MAIL_USER");
  if (!process.env.MAIL_PASS) missing.push("MAIL_PASS");
  if (!process.env.MAIL_FROM) missing.push("MAIL_FROM");

  if (missing.length > 0) {
    const missingList = missing.join(", ");
    return {
      valid: false,
      missing,
      error: `Missing required environment variable(s): ${missingList}. Configure your Gmail App Password and SMTP settings in server/.env.`,
    };
  }

  return { valid: true, missing: [] };
}

function getTransporter() {
  const check = validateEmailConfig();
  if (!check.valid) {
    throw new Error(check.error);
  }

  if (!transporter) {
    const tlsOptions = {};

    // Step B — Optional custom CA certificate for enterprise/antivirus SSL inspection environments
    if (process.env.MAIL_CA_PATH) {
      try {
        if (fs.existsSync(process.env.MAIL_CA_PATH)) {
          const caCert = fs.readFileSync(process.env.MAIL_CA_PATH);
          tlsOptions.ca = [caCert];
          tlsOptions.rejectUnauthorized = true;
          console.log(`  [Email Service] Loaded custom CA certificate from ${process.env.MAIL_CA_PATH}`);
        } else {
          console.warn(`  [Email Service] Warning: Custom CA certificate file not found: ${process.env.MAIL_CA_PATH}`);
        }
      } catch (caErr) {
        console.warn(`  [Email Service] Warning: Failed to load CA certificate: ${caErr.message}`);
      }
    }

    // Step C — Local-only emergency opt-in bypass setting
    if (
      process.env.MAIL_TLS_ALLOW_INSECURE === "true" ||
      process.env.MAIL_REJECT_UNAUTHORIZED === "false" ||
      process.env.MAIL_ALLOW_INVALID_CERT === "true"
    ) {
      tlsOptions.rejectUnauthorized = false;
      console.warn("\n  WARNING: SMTP TLS certificate verification is disabled.");
      console.warn("  This setting is intended ONLY for local development.");
      console.warn("  Do not enable MAIL_TLS_ALLOW_INSECURE in production.\n");
    } else if (tlsOptions.rejectUnauthorized === undefined) {
      tlsOptions.rejectUnauthorized = true;
    }

    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: tlsOptions,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
}

/**
 * Categorize SMTP verification and delivery errors into clear human-readable diagnostics.
 */
function categorizeSmtpError(err) {
  const msg = err?.message || String(err || "");
  const code = err?.code || "";

  if (
    msg.includes("self-signed certificate") ||
    msg.includes("SELF_SIGNED_CERT_IN_CHAIN") ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    (msg.includes("certificate") && !msg.includes("invalid credential"))
  ) {
    return {
      category: "EMAIL TLS ERROR",
      summary: "Certificate validation failed.",
      diagnostic: `Diagnostic: ${msg}`,
      hint: "If using antivirus SSL inspection (e.g. Avast/Kaspersky), set MAIL_CA_PATH in server/.env to your local CA cert, or set MAIL_TLS_ALLOW_INSECURE=true for local dev.",
    };
  }

  if (
    code === "EAUTH" ||
    msg.includes("Invalid login") ||
    msg.includes("535 5.7.8") ||
    msg.includes("Username and Password not accepted") ||
    msg.includes("authentication failed")
  ) {
    return {
      category: "EMAIL AUTH ERROR",
      summary: "Gmail authentication failed.",
      diagnostic: `Diagnostic: ${msg}`,
      hint: "Check MAIL_USER and ensure MAIL_PASS contains a 16-character Gmail App Password.",
    };
  }

  if (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    msg.includes("connect")
  ) {
    return {
      category: "EMAIL CONNECTION ERROR",
      summary: `Unable to connect to ${process.env.MAIL_HOST || "smtp.gmail.com"}:${process.env.MAIL_PORT || "587"}.`,
      diagnostic: `Diagnostic: ${msg}`,
      hint: "Check your internet connection, firewall settings, and SMTP host/port settings.",
    };
  }

  return {
    category: "EMAIL ERROR",
    summary: "SMTP service check failed.",
    diagnostic: `Diagnostic: ${msg}`,
    hint: "Check MAIL_HOST, MAIL_PORT, MAIL_USER and MAIL_PASS in server/.env.",
  };
}

/**
 * Verify SMTP transporter connectivity.
 * Must not throw — SMTP unavailability must not crash the backend.
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function verifyTransporter() {
  const check = validateEmailConfig();
  if (!check.valid) {
    console.error("\n  ✗ Email service unavailable");
    console.error("    EMAIL CONFIG ERROR:");
    console.error(`    ${check.error}\n`);
    return { success: false, error: check.error };
  }

  try {
    transporter = null;
    await getTransporter().verify();
    console.log("  ✓ Email service ready (SMTP transporter verified).");
    return { success: true };
  } catch (err) {
    transporter = null;
    const cat = categorizeSmtpError(err);
    console.error("\n  ✗ Email service unavailable");
    console.error(`    ${cat.category}:`);
    console.error(`    ${cat.summary}`);
    console.error(`    ${cat.diagnostic}`);
    if (cat.hint) {
      console.error(`    Hint: ${cat.hint}`);
    }
    console.error();
    return { success: false, error: err?.message || cat.summary };
  }
}

/**
 * Shared branded HTML shell for transactional emails.
 */
function buildEmailLayout({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${LIGHT_BG};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e0d6;">
          <tr>
            <td style="background:${OXFORD};padding:20px 28px;">
              <p style="margin:0;font-size:18px;letter-spacing:0.04em;color:${TAN};font-weight:700;">Student Portfolio</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#faf8f5;border-top:1px solid #e6e0d6;">
              <p style="margin:0;font-size:12px;color:#6b655c;font-family:Arial,Helvetica,sans-serif;">
                This message was sent by Student Portfolio. Do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPriority(priority) {
  if (!priority) return "Medium";
  return String(priority).charAt(0).toUpperCase() + String(priority).slice(1);
}

function formatCompletedDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date instanceof Date ? date : new Date(date));
}

/**
 * Send a password reset email with HTML + plain text bodies.
 * @param {{ to: string, resetUrl: string }} options
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendPasswordResetEmail({ to, resetUrl }) {
  const check = validateEmailConfig();
  if (!check.valid) {
    console.error("Password reset email failed: Email configuration invalid.", check.error);
    return { success: false, error: check.error };
  }

  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  const subject = "Reset Your Password — Student Portfolio";

  const text = [
    "Student Portfolio",
    "",
    "Reset Your Password",
    "",
    "We received a request to reset your password.",
    "",
    `Reset your password: ${resetUrl}`,
    "",
    "This link expires in 15 minutes.",
    "",
    "If you did not request this password reset, you can safely ignore this email.",
  ].join("\n");

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;color:${OXFORD};">Reset Your Password</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#333;font-family:Arial,Helvetica,sans-serif;">
      We received a request to reset your password.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${escapeHtml(resetUrl)}"
         style="display:inline-block;background:${OXFORD};color:${TAN};text-decoration:none;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;">
        Reset Password
      </a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#555;font-family:Arial,Helvetica,sans-serif;">
      This link expires in 15 minutes.
    </p>
    <p style="margin:0;font-size:13px;line-height:1.5;color:#555;font-family:Arial,Helvetica,sans-serif;">
      If you did not request this password reset, you can safely ignore this email.
    </p>
  `;

  try {
    await getTransporter().sendMail({
      from,
      to,
      subject,
      text,
      html: buildEmailLayout({ title: subject, bodyHtml }),
    });
    return { success: true };
  } catch (err) {
    console.error("Password reset email delivery failed:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to send password reset email.",
    };
  }
}

/**
 * Send a task completion notification email.
 * @param {{ to: string, task: { title?: string, description?: string, priority?: string, updatedAt?: Date|string } }} options
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendTaskCompletedEmail({ to, task }) {
  const check = validateEmailConfig();
  if (!check.valid) {
    console.error("Task completion email failed: Email configuration invalid.", check.error);
    return { success: false, error: check.error };
  }

  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  const title = task?.title?.trim() || "Untitled Task";
  const description =
    typeof task?.description === "string" && task.description.trim()
      ? task.description.trim()
      : "No description provided.";
  const priorityLabel = formatPriority(task?.priority);
  const completedAt = formatCompletedDate(task?.updatedAt || new Date());
  const subject = `Task Completed — ${title}`;

  const text = [
    "Student Portfolio",
    "",
    "Task Completed",
    "",
    "Your task has been marked as completed.",
    "",
    `Task: ${title}`,
    `Description: ${description}`,
    `Priority: ${priorityLabel}`,
    "Status: Completed",
    `Completed: ${completedAt}`,
  ].join("\n");

  const bodyHtml = `
    <h1 style="margin:0 0 8px;font-size:22px;color:${OXFORD};">✓ Task Completed</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#333;font-family:Arial,Helvetica,sans-serif;">
      Your task has been marked as completed.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;">
      <tr>
        <td style="padding:8px 0;color:#6b655c;width:110px;vertical-align:top;">Task</td>
        <td style="padding:8px 0;font-weight:700;color:${OXFORD};">${escapeHtml(title)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b655c;vertical-align:top;">Description</td>
        <td style="padding:8px 0;">${escapeHtml(description)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b655c;">Priority</td>
        <td style="padding:8px 0;">${escapeHtml(priorityLabel)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b655c;">Status</td>
        <td style="padding:8px 0;">Completed</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#6b655c;">Completed</td>
        <td style="padding:8px 0;">${escapeHtml(completedAt)}</td>
      </tr>
    </table>
  `;

  try {
    await getTransporter().sendMail({
      from,
      to,
      subject,
      text,
      html: buildEmailLayout({ title: subject, bodyHtml }),
    });
    return { success: true };
  } catch (err) {
    console.error("Task completion email delivery failed:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to send task completion email.",
    };
  }
}

