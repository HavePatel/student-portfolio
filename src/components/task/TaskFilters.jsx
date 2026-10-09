/**
 * TaskFilters.jsx
 *
 * Practical 8 — React DevTools Profiler Finding + Optimisation
 *
 * PROBLEM IDENTIFIED (React DevTools Profiler):
 * TaskManagerPage re-renders whenever any piece of state changes
 * (e.g. a task is toggled, the edit modal opens/closes, or a toast
 * fires). Because TaskFilters received all its props as primitives
 * but was NOT memoised, it re-rendered on EVERY parent re-render —
 * even when `search`, `status`, `totalCount`, and `filteredCount`
 * had not changed.
 *
 * In the Profiler this appeared as TaskFilters showing a render bar
 * on EVERY parent commit, including commits triggered by editingTask
 * or taskToDelete state changes that have nothing to do with filters.
 *
 * WHY IT WAS UNNECESSARY:
 * TaskFilters is a pure presentational component. Its output is
 * determined solely by its props. When those props are unchanged the
 * DOM output is identical, so the work is wasted.
 *
 * OPTIMISATION APPLIED:
 * React.memo() wraps the component. React performs a shallow
 * comparison of props before deciding to re-render. Because all props
 * are primitives (strings, numbers, functions) and the parent passes
 * callbacks stabilised with useCallback, React.memo correctly skips
 * re-renders when nothing relevant has changed.
 *
 * RESULT:
 * TaskFilters now re-renders ONLY when search text, status filter,
 * or task counts actually change — not on every parent commit.
 */

import { memo } from "react";
import { Search, X } from "lucide-react";

const STATUS_FILTERS = [
  { value: "all",       label: "All"       },
  { value: "pending",   label: "Pending"   },
  { value: "ongoing",   label: "Ongoing"   },
  { value: "completed", label: "Completed" },
];

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

/* React.memo — skip re-render when props are shallowly equal */
export default memo(TaskFilters);
