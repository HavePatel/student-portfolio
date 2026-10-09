# Nodemailer Email Integration

**Project:** Student Portfolio + Task Manager  
**Feature:** Real email notifications via Nodemailer + SMTP  
**Scope:** Additive backend email layer (password reset + task completion)

---

## 1. What Nodemailer Is Doing

Nodemailer is the Node.js library used by the Express backend to send real
emails through an SMTP provider (typically Gmail).

This project uses Nodemailer for two transactional emails:

1. **Password reset** — after `POST /forgot-password` stores a secure reset token
2. **Task completion** — after `PUT /tasks/:id` transitions a task into `completed`

All Nodemailer logic lives in one place:

`server/services/emailService.js`

React never sends email. The backend is the source of truth.

---

## 2. SMTP Architecture

```
React Portfolio
       ↓
Express API
       ↓
JWT / Validation Middleware
       ↓
MongoDB
       ↓
Central Email Service (emailService.js)
       ↓
Nodemailer
       ↓
Gmail SMTP (or compatible provider)
       ↓
User Inbox
```

Password reset flow:

```
Forgot Password
       ↓
Secure raw token + hashed token in MongoDB
       ↓
Nodemailer → Reset email
       ↓
Reset Password page (/reset-password/:token)
```

Task completion flow:

```
Edit Task → Save
       ↓
PUT /tasks/:id
       ↓
MongoDB update first
       ↓
Detect non-completed → completed
       ↓
Load authenticated user email (req.user.id)
       ↓
Nodemailer → Completion email
       ↓
Return successful task response
```

---

## 3. Environment Variables

Copy placeholders from `server/.env.example` into `server/.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student_portfolio
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-here

MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM=your-email@gmail.com
```

| Variable | Purpose |
|---|---|
| `MAIL_HOST` | SMTP hostname |
| `MAIL_PORT` | SMTP port (`465` for SSL) |
| `MAIL_SECURE` | `"true"` for TLS/SSL |
| `MAIL_USER` | SMTP login email |
| `MAIL_PASS` | SMTP password / App Password |
| `MAIL_FROM` | From address shown to recipients |

**Rules**

- Real credentials belong only in `server/.env`
- Never hard-code credentials in JavaScript
- Never commit `server/.env`
- `server/.env.example` is safe to commit (placeholders only)

`server/loadEnv.js` loads `server/.env` regardless of whether you start the
API from the project root or the `server/` directory.

---

## 4. Gmail App Password Setup

For Gmail SMTP:

1. Enable 2-Step Verification on the Google Account.
2. Create a Google **App Password** (not your normal Gmail password).
3. Put that 16-character App Password in `MAIL_PASS`.
4. Set `MAIL_USER` and `MAIL_FROM` to the same Gmail address.

Without a valid App Password, transporter verification and delivery will fail.
The API still starts; email simply will not send until SMTP is configured.

---

## 5. Password Reset Email Flow

1. Client submits email to `POST /forgot-password`.
2. Backend normalizes email and looks up the user.
3. If the user exists:
   - Generate a cryptographically secure raw token (`crypto.randomBytes`)
   - Store only the SHA-256 hash + 15-minute expiry in MongoDB
   - Build `CLIENT_ORIGIN/reset-password/<rawToken>`
   - Call `sendPasswordResetEmail({ to, resetUrl })`
4. Always return the same generic success response (no account enumeration).
5. User opens the emailed link and submits a new password to
   `POST /reset-password/:token`.
6. Token is hashed and matched; password is bcrypt-hashed; token fields cleared.

Email subject:

`Reset Your Password — Student Portfolio`

The message includes HTML and plain-text versions, a Reset Password button,
and a 15-minute expiry notice. It never includes passwords, JWTs, or SMTP secrets.

If SMTP delivery fails:

- Backend logs the failure
- Generic frontend response is unchanged
- Non-production environments still log the reset URL to the server console as a local fallback

---

## 6. Task Completion Email Flow

1. Authenticated client calls `PUT /tasks/:id`.
2. Backend reads the existing task and computes `previousStatus`.
3. MongoDB update runs first and must succeed.
4. Backend computes `newStatus` from the updated document.
5. Email is sent only when:

```
previousStatus !== "completed"
AND
newStatus === "completed"
```

6. Destination email comes from `User.findById(req.user.id).email`
   (never from `req.body.email`).
7. Successful task response is returned even if SMTP fails.

Email subject:

`Task Completed — <task title>`

Body includes title, description, priority, status, and completion date/time.

---

## 7. Status Transition Logic

| Transition | Email? |
|---|---|
| pending → completed | Yes (one) |
| ongoing → completed | Yes (one) |
| pending → ongoing | No |
| ongoing → pending | No |
| completed → ongoing | No |
| completed → pending | No |
| completed → completed | No |
| completed → ongoing → completed | Yes (one new email) |

Legacy documents without a usable `status` field:

- `completed: true` → treat as `completed`
- `completed: false` → treat as `pending`

Normalization uses the same status/`completed` rules already used by the Task model.

---

## 8. Error Handling

### Startup verification

`verifyTransporter()` runs when the API starts.

- Success → logs a short ready message
- Failure → logs that the email service is unavailable and which `MAIL_*` vars to check
- The process does **not** crash

### Delivery failures

`sendPasswordResetEmail` and `sendTaskCompletedEmail` catch errors and return:

```js
{ success: true }
// or
{ success: false, error: "..." }
```

- No unhandled promise rejections
- Raw SMTP errors are not exposed to the frontend
- Diagnostics are logged only on the backend

### Database-first rule

If MongoDB marks a task completed but email fails:

- Task remains completed
- No rollback
- Frontend still receives a successful update response

---

## 9. Security Considerations

- SMTP secrets live only in `server/.env` (Git-ignored via `.env` / `.env.*`)
- Reset tokens: raw token emailed, only hash stored, 15-minute expiry, single-use
- Passwords remain bcrypt-hashed
- Forgot-password response is generic (no account enumeration)
- Task notification email address is taken from the authenticated JWT user record
- Emails never include passwords, JWTs, database internals, or SMTP credentials
- Frontend cannot trigger email via `useEffect` or UI “Send Email” buttons

---

## 10. Testing Procedure

### TEST 1 — Backend startup

```bash
cd server
npm run dev
```

Expect MongoDB connection, Express listen, and SMTP verification attempt.
Credentials must not appear in logs.

### TEST 2 — Password reset email

1. Open `/login` → Forgot your password?
2. Enter a registered email.
3. Confirm generic success message.
4. Confirm inbox email with Reset Password button.
5. Button opens `/reset-password/<token>`.

### TEST 3 — Reset password

1. Open emailed link and set a new password.
2. Confirm success, single-use token, new login works, old password fails.

### TEST 4 — Task completion

1. Create task (status `pending`).
2. Change `pending` → `ongoing` → expect **no** email.
3. Change `ongoing` → `completed` → expect **exactly one** email.

### TEST 5 — Already completed

Edit a completed task without changing status → **no** new email.

### TEST 6 — Re-completion

`completed` → `ongoing` → `completed` → **one** new email.

### TEST 7 — SMTP failure

1. Temporarily set an invalid `MAIL_PASS`.
2. Complete a task.
3. Confirm MongoDB status is completed and the UI update succeeds.
4. Confirm backend logs email failure.
5. Restore valid SMTP credentials.

### TEST 8 — Existing functionality

Confirm login/register/logout, password recovery, task CRUD, search, filters,
priority, delete confirmation, GitHub Explorer, light/dark theme, and Practical 8
lazy-loading still work.

---

## Related Files

| File | Role |
|---|---|
| `server/services/emailService.js` | Central Nodemailer service |
| `server/loadEnv.js` | Loads `server/.env` |
| `server/index.js` | Forgot-password + task update wiring + startup verify |
| `server/.env.example` | SMTP placeholder variables |
| `server/package.json` | Includes `nodemailer` dependency |

---

## Notes for Local Practicals

Email delivery requires valid SMTP configuration in `server/.env`.
Without it, auth and task APIs still work; only outbound mail fails safely.
