/**
 * ResetPasswordPage.jsx
 * Password reset execution page.
 * Receives token via route params (/reset-password/:token), accepts new password,
 * validates inputs, sends POST /reset-password/:token request, and provides link back to login.
 */

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { resetPasswordApi } from "../services/authApi";
import "../styles/auth.css";

function ResetPasswordPage() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your new password.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your confirmation.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordApi(token, password.trim());
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || "Password reset token is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(217, 119, 6, 0.1)",
              color: "var(--tan)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <Lock size={24} />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your new password below to update your account credentials.
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div className="auth-success-banner" style={{ marginBottom: "1.5rem", justifyContent: "center" }}>
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>Password reset successfully.</span>
            </div>
            <p className="auth-subtitle" style={{ marginBottom: "1.75rem" }}>
              You can now sign in to your account with your new password.
            </p>
            <Link
              to="/login"
              className="auth-submit-btn"
              style={{ textDecoration: "none" }}
            >
              Return to Login <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="auth-error-banner" style={{ marginBottom: "1.25rem" }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="new-password-input">
                  New Password
                </label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    id="new-password-input"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="confirm-password-input">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    id="confirm-password-input"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="task-spin" /> Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
