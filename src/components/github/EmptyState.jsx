import { FolderOpen, Search } from "lucide-react";

/**
 * EmptyState
 * Shown when a filter/search returns 0 results.
 */
function EmptyState({ type = "repos", query = "", onReset }) {
  const isSearch = Boolean(query);

  return (
    <div className="gh-empty" role="status">
      <span className="gh-empty__icon" aria-hidden="true">
        {isSearch ? <Search size={40} strokeWidth={1.2} /> : <FolderOpen size={40} strokeWidth={1.2} />}
      </span>

      <h3 className="gh-empty__title">
        {isSearch ? `No results for "${query}"` : "No repositories found"}
      </h3>

      <p className="gh-empty__desc">
        {isSearch
          ? "Try a different search term or adjust your filters."
          : type === "user"
          ? "This user has no public repositories yet."
          : "No repositories match the selected filters."}
      </p>

      {onReset && (
        <button
          type="button"
          className="gh-empty__reset-btn"
          onClick={onReset}
        >
          Reset filters
        </button>
      )}
    </div>
  );
}

export default EmptyState;
