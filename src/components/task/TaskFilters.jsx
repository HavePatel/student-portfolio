import { Search, X } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all",       label: "All"       },
  { value: "pending",   label: "Pending"   },
  { value: "completed", label: "Completed" },
];

/**
 * TaskFilters
 * Controlled search input + status filter chips.
 * All state lives in the parent (TaskManagerPage).
 */
function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  totalCount,
  filteredCount,
}) {
  return (
    <div className="task-filters" role="search" aria-label="Filter tasks">

      {/* ── Search bar ──────────────────────────── */}
      <div className="task-search">
        <Search
          className="task-search__icon"
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <input
          type="search"
          className="task-search__input"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          autoComplete="off"
        />
        {search && (
          <button
            type="button"
            className="task-search__clear"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* ── Status filter chips ──────────────────── */}
      <div
        className="task-filter-chips"
        role="group"
        aria-label="Filter by status"
      >
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`task-chip${status === value ? " task-chip--active" : ""}`}
            onClick={() => onStatusChange(value)}
            aria-pressed={status === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Result count ─────────────────────────── */}
      <p className="task-filters__count" aria-live="polite">
        {filteredCount === totalCount
          ? `${totalCount} task${totalCount !== 1 ? "s" : ""}`
          : `${filteredCount} of ${totalCount} tasks`}
      </p>

    </div>
  );
}

export default TaskFilters;
