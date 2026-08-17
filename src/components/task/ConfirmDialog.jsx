import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

/**
 * ConfirmDialog
 * Supplementary Problem (Practical 6): Confirmation modal dialog before deleting a task.
 *
 * Props:
 *   - isOpen: boolean
 *   - task: { id, title }
 *   - onConfirm: function (called when user clicks Delete)
 *   - onCancel: function (called when user clicks Cancel or presses Escape)
 *   - loading: boolean (deleting in-progress)
 */
function ConfirmDialog({ isOpen, task, onConfirm, onCancel, loading = false }) {
  const cancelBtnRef = useRef(null);

  // Focus cancel button on mount for safety (prevent accidental Enter-to-delete)
  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, loading]);

  if (!isOpen || !task) return null;

  return (
    <div
      className="task-modal-backdrop"
      onClick={() => {
        if (!loading) onCancel();
      }}
      role="presentation"
    >
      <div
        className="task-modal task-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="task-modal__header">
          <div className="task-confirm-modal__title-wrap">
            <span className="task-confirm-modal__icon" aria-hidden="true">
              <AlertTriangle size={20} />
            </span>
            <h2 id="confirm-dialog-title" className="task-modal__title">
              Delete Task?
            </h2>
          </div>
          <button
            type="button"
            className="task-modal__close"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="task-confirm-modal__body" id="confirm-dialog-desc">
          <p className="task-confirm-modal__lead">
            Are you sure you want to delete{" "}
            <strong>&ldquo;{task.title}&rdquo;</strong>?
          </p>
          <p className="task-confirm-modal__warning">
            This action cannot be undone and will permanently remove the task
            from the MongoDB database.
          </p>
        </div>

        {/* Actions */}
        <div className="task-modal__actions">
          <button
            type="button"
            ref={cancelBtnRef}
            className="task-btn task-btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="task-btn task-btn--danger"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="task-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 size={15} /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
