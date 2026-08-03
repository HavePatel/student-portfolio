import { ClipboardList, PlusCircle } from "lucide-react";

/**
 * EmptyState
 * Shown when the task list is empty — either no tasks exist,
 * or the current search / filter returned zero results.
 */
function EmptyState({ filtered = false, onClear }) {
  return (
    <div className="task-empty" role="status">
      <div className="task-empty__icon" aria-hidden="true">
        <ClipboardList size={48} strokeWidth={1.2} />
      </div>

      <h3 className="task-empty__title">
        {filtered ? "No Matching Tasks" : "No Tasks Yet"}
      </h3>

      <p className="task-empty__desc">
        {filtered
          ? "Try a different search term or filter."
          : "Create your first task using the form above."}
      </p>

      {filtered && onClear && (
        <button
          type="button"
          className="task-btn task-btn--outline task-btn--sm"
          onClick={onClear}
        >
          <PlusCircle size={15} strokeWidth={2} />
          Clear filters
        </button>
      )}
    </div>
  );
}

export default EmptyState;
