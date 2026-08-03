import { Search, SlidersHorizontal, X } from "lucide-react";
import { LANGUAGE_FILTERS, TYPE_FILTERS } from "../../utils/filterRepositories";
import { SORT_OPTIONS } from "../../utils/sortRepositories";

/**
 * Filters
 * Language pills + type pills + sort dropdown + repo name search.
 * Fully controlled — all state lives in the parent (GithubPage).
 */
function Filters({
  language,
  onLanguageChange,
  type,
  onTypeChange,
  sortBy,
  onSortChange,
  repoQuery,
  onRepoQueryChange,
  totalCount,
  filteredCount,
}) {
  return (
    <div className="gh-filters" role="region" aria-label="Repository filters">

      {/* ── Top row: repo search + sort ─────────────── */}
      <div className="gh-filters__top">
        <div className="gh-filters__search">
          <Search size={15} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            value={repoQuery}
            onChange={(e) => onRepoQueryChange(e.target.value)}
            placeholder="Filter repositories…"
            className="gh-filters__search-input"
            aria-label="Filter repositories by name"
          />
          {repoQuery && (
            <button
              type="button"
              className="gh-filters__search-clear"
              onClick={() => onRepoQueryChange("")}
              aria-label="Clear filter"
            >
              <X size={13} strokeWidth={2} />
            </button>
          )}
        </div>

        <div className="gh-filters__sort">
          <SlidersHorizontal size={15} strokeWidth={1.8} aria-hidden="true" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="gh-filters__select"
            aria-label="Sort repositories"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Language pills ──────────────────────────── */}
      <div className="gh-filters__pills-row" role="group" aria-label="Filter by language">
        <span className="gh-filters__label">Language</span>
        <div className="gh-filters__pills">
          {LANGUAGE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`gh-pill${language === f.value ? " gh-pill--active" : ""}`}
              onClick={() => onLanguageChange(f.value)}
              aria-pressed={language === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Type pills ──────────────────────────────── */}
      <div className="gh-filters__pills-row" role="group" aria-label="Filter by repository type">
        <span className="gh-filters__label">Type</span>
        <div className="gh-filters__pills">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`gh-pill${type === f.value ? " gh-pill--active" : ""}`}
              onClick={() => onTypeChange(f.value)}
              aria-pressed={type === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result count ────────────────────────────── */}
      <p className="gh-filters__count" aria-live="polite">
        Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> repositories
      </p>
    </div>
  );
}

export default Filters;
