import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";

const INITIAL_STATE = {
  title: "",
  description: "",
  completed: false,
  ongoing: false,
  priority: "medium",   // Practical 5 Supplementary — default matches schema
};

/**
 * TaskForm
 * Form for creating new tasks in MongoDB via Express POST /tasks.
 * Supports Title (required), Description (optional), Initial Status (Completed / Ongoing / Pending), and Priority.
 */
function TaskForm({ onSubmit, loading: externalLoading }) {
  const [fields, setFields] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loadingInternal, setLoadingInternal] = useState(false);
  const [apiError, setApiError] = useState("");

  const isLoading = externalLoading || loadingInternal;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "completed") {
        setFields((prev) => ({
          ...prev,
          completed: checked,
          ongoing: checked ? false : prev.ongoing,
        }));
      } else if (name === "ongoing") {
        setFields((prev) => ({
          ...prev,
          ongoing: checked,
          completed: checked ? false : prev.completed,
        }));
      }
    } else {
      setFields((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!fields.title.trim()) {
      errs.title = "Task title is required.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoadingInternal(true);
    setApiError("");

    const initialStatus = fields.completed
      ? "completed"
      : fields.ongoing
      ? "ongoing"
      : "pending";

    try {
      await onSubmit({
        title: fields.title.trim(),
        description: fields.description.trim(),
        completed: Boolean(fields.completed),
        status: initialStatus,
        priority: fields.priority,   // Practical 5 Supplementary
      });
      // Clear form on success
      setFields(INITIAL_STATE);
      setErrors({});
    } catch (err) {
      setApiError(err.message || "Failed to create task.");
    } finally {
      setLoadingInternal(false);
    }
  };

  return (
    <div className="task-form-card">
      <h2 className="task-form-card__title">New Task</h2>

      {apiError && (
        <div className="task-api-error" role="alert">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Title (Required) */}
        <div className="task-field">
          <label htmlFor="task-title" className="task-label">
            Task Title <span aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            name="title"
            type="text"
            className={`task-input${errors.title ? " task-input--error" : ""}`}
            value={fields.title}
            onChange={handleChange}
            placeholder="e.g. Complete Practical 6"
            autoComplete="off"
            maxLength={120}
            aria-describedby={errors.title ? "task-title-err" : undefined}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <span id="task-title-err" className="task-field-error" role="alert">
              {errors.title}
            </span>
          )}
        </div>

        {/* Description (Optional) */}
        <div className="task-field">
          <label htmlFor="task-desc" className="task-label">
            Description <span className="task-label-opt">(optional)</span>
          </label>
          <textarea
            id="task-desc"
            name="description"
            className="task-textarea"
            value={fields.description}
            onChange={handleChange}
            placeholder="Add task notes or details…"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Completed status checkbox */}
        <div className="task-field task-field--checkbox">
          <label className="task-checkbox-label">
            <input
              type="checkbox"
              name="completed"
              checked={fields.completed}
              onChange={handleChange}
              className="task-checkbox"
            />
            <span>Mark as Completed initially</span>
          </label>
        </div>

        {/* Ongoing status checkbox — placed directly BELOW completed checkbox */}
        <div className="task-field task-field--checkbox">
          <label className="task-checkbox-label">
            <input
              type="checkbox"
              name="ongoing"
              checked={fields.ongoing}
              onChange={handleChange}
              className="task-checkbox"
            />
            <span>Mark as Ongoing initially</span>
          </label>
        </div>

        {/* Priority — Practical 5 Supplementary */}
        <div className="task-field">
          <label htmlFor="task-priority" className="task-label">
            Priority
          </label>
          <select
            id="task-priority"
            name="priority"
            className="task-select"
            value={fields.priority}
            onChange={handleChange}
            aria-label="Task priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="task-btn task-btn--primary task-btn--full"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="task-spin" /> Creating…
            </>
          ) : (
            <>
              <PlusCircle size={16} /> Create Task
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TaskForm;
