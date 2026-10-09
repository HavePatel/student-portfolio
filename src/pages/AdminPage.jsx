import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Shield, FileText, Download } from "lucide-react";
import Container from "../components/ui/Container";
import { getTaskReport, downloadTaskReportPdf } from "../services/taskApi";
import "../styles/admin.css";

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Report state — must be before any early return
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // Frontend guard — backend also enforces this via requireAdmin middleware
  if (user && user.role !== "admin") {
    navigate("/login", { replace: true });
    return null;
  }

  // Date validation
  const isDateValid = fromDate && toDate && fromDate <= toDate;

  // Format date for display
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!isDateValid) {
      setError("Please select a valid date range.");
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const res = await getTaskReport(fromDate, toDate);
      setReportData(res);
    } catch (err) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!isDateValid) {
      setPdfError("Please select a valid date range.");
      return;
    }

    setPdfLoading(true);
    setPdfError(null);

    try {
      await downloadTaskReportPdf(fromDate, toDate);
    } catch (err) {
      setPdfError(err.message || "Failed to download PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  // Calculate summary
  const summary = reportData?.data
    ? {
        total: reportData.data.length,
        pending: reportData.data.filter((t) => t.status === "pending").length,
        ongoing: reportData.data.filter((t) => t.status === "ongoing").length,
        completed: reportData.data.filter((t) => t.status === "completed").length,
      }
    : null;

  return (
    <div className="task-page admin-page">
      <div className="task-hero admin-hero">
        <Container>
          <p className="task-hero__eyebrow">ADMIN AREA</p>
          <h1 className="task-hero__headline">Admin Dashboard</h1>
          <p className="task-hero__sub">
            This area is restricted to administrators only.
          </p>
        </Container>
      </div>
      <div className="task-body">
        <Container>
          {/* Admin card */}
          <div className="admin-card">
            <div className="admin-icon">
              <Shield size={28} />
            </div>
            <h2 className="admin-title">
              Admin Area
            </h2>
            <p className="admin-subtitle">
              Welcome, {user?.email}. This is a placeholder for future admin features such as reports and PDF generation.
            </p>
          </div>

          {/* Report Section */}
          <div className="admin-section">
            <h3 className="admin-section-title">
              <FileText size={20} /> Task Report
            </h3>

            {/* Date Range Inputs */}
            <div className="admin-input-group">
              <div className="admin-input-wrapper">
                <label className="admin-input-label">
                  From Date
                </label>
                <input
                  type="date"
                  className="admin-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="admin-input-wrapper">
                <label className="admin-input-label">
                  To Date
                </label>
                <input
                  type="date"
                  className="admin-input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            {/* Generate Report Button */}
            <button
              className="admin-btn-primary"
              onClick={handleGenerateReport}
              disabled={loading || !isDateValid}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>

            {/* Error Message */}
            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            {/* Report Results */}
            {reportData && (
              <div className="admin-report">
                {/* Summary */}
                {summary && (
                  <div className="admin-summary">
                    <div className="admin-summary-card admin-summary-card--total">
                      <div className="admin-summary-value">{summary.total}</div>
                      <div className="admin-summary-label">Total</div>
                    </div>
                    <div className="admin-summary-card admin-summary-card--pending">
                      <div className="admin-summary-value">{summary.pending}</div>
                      <div className="admin-summary-label">Pending</div>
                    </div>
                    <div className="admin-summary-card admin-summary-card--ongoing">
                      <div className="admin-summary-value">{summary.ongoing}</div>
                      <div className="admin-summary-label">Ongoing</div>
                    </div>
                    <div className="admin-summary-card admin-summary-card--completed">
                      <div className="admin-summary-value">{summary.completed}</div>
                      <div className="admin-summary-label">Completed</div>
                    </div>
                  </div>
                )}

                {/* Results Table */}
                {reportData.data.length === 0 ? (
                  <div className="admin-empty">
                    No tasks found for the selected date range.
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>User</th>
                          <th>Created</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.map((task) => (
                          <tr key={task.id || task._id}>
                            <td className="task-title">{task.title}</td>
                            <td className="task-desc">{task.description || "—"}</td>
                            <td>
                              <span className={`admin-status-badge admin-status-badge--${task.status}`}>
                                {task.status}
                              </span>
                            </td>
                            <td>
                              <span className={`admin-priority-badge admin-priority-badge--${task.priority || "medium"}`}>
                                {task.priority || "medium"}
                              </span>
                            </td>
                            <td className="task-user">{task.userId?.email || "Unknown User"}</td>
                            <td className="task-date">{formatDateTime(task.createdAt)}</td>
                            <td className="task-date">{formatDateTime(task.updatedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Download PDF Button */}
                <div className="admin-actions">
                  <button
                    className="admin-btn-secondary"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading || !isDateValid}
                  >
                    <Download size={16} />
                    {pdfLoading ? "Downloading..." : "Download PDF"}
                  </button>
                </div>

                {/* PDF Error */}
                {pdfError && (
                  <div className="admin-error">
                    {pdfError}
                  </div>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}

export default AdminPage;
