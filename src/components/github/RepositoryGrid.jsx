import { useMemo } from "react";
import RepositoryCard from "./RepositoryCard";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import { filterRepositories } from "../../utils/filterRepositories";
import { sortRepositories } from "../../utils/sortRepositories";

/**
 * RepositoryGrid
 * Applies filter + sort pipeline then renders the card grid.
 * Pagination slicing is applied externally (GithubPage passes a paged subset).
 */
function RepositoryGrid({
  repos,
  loading,
  username,
  language,
  type,
  sortBy,
  repoQuery,
  onResetFilters,
  // If paginatedRepos is provided, skip internal processing (GithubPage pre-slices)
  paginatedRepos,
}) {
  const processed = useMemo(() => {
    if (paginatedRepos) return paginatedRepos;
    if (!repos) return [];
    const filtered = filterRepositories(repos, language, type, repoQuery);
    return sortRepositories(filtered, sortBy);
  }, [repos, language, type, sortBy, repoQuery, paginatedRepos]);

  if (loading) return <LoadingSkeleton count={9} />;

  if (!processed.length) {
    return (
      <EmptyState
        query={repoQuery}
        onReset={onResetFilters}
      />
    );
  }

  return (
    <div
      className="repo-grid"
      aria-label={`Repository grid — ${processed.length} repositories`}
    >
      {processed.map((repo) => (
        <RepositoryCard
          key={repo.id}
          repo={repo}
          username={username}
        />
      ))}
    </div>
  );
}

export default RepositoryGrid;
