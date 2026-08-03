import { ChevronLeft, ChevronRight } from "lucide-react";

const SIBLINGS = 1; // pages shown on each side of current

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function buildPages(current, total) {
  const totalShown = SIBLINGS * 2 + 5; // siblings + current + 2 edges + 2 dots

  if (total <= totalShown) return range(1, total);

  const leftSib  = Math.max(current - SIBLINGS, 2);
  const rightSib = Math.min(current + SIBLINGS, total - 1);
  const showLeft  = leftSib  > 2;
  const showRight = rightSib < total - 1;

  const middle = range(leftSib, rightSib);

  if (!showLeft && showRight)  return [1, ...middle, "…", total];
  if (showLeft  && !showRight) return [1, "…", ...middle, total];
  return [1, "…", ...middle, "…", total];
}

/**
 * Pagination — Desktop: numbered pages. Mobile: Load More button.
 */
function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const pages = buildPages(currentPage, totalPages);

  const prev = () => onPageChange(Math.max(1, currentPage - 1));
  const next = () => onPageChange(Math.min(totalPages, currentPage + 1));

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="gh-pagination" aria-label="Repository pagination">

      {/* Desktop numbered pagination */}
      <div className="gh-pagination__desktop" role="list">
        <button
          className="gh-page-btn gh-page-btn--nav"
          onClick={prev}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          <span>Prev</span>
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dot-${i}`} className="gh-page-dots" aria-hidden="true">…</span>
          ) : (
            <button
              key={p}
              role="listitem"
              className={`gh-page-btn${currentPage === p ? " gh-page-btn--active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={currentPage === p ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className="gh-page-btn gh-page-btn--nav"
          onClick={next}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Mobile: load more */}
      {currentPage < totalPages && (
        <button
          className="gh-pagination__load-more"
          onClick={next}
          aria-label="Load more repositories"
        >
          Load more repositories ({totalItems - end} remaining)
        </button>
      )}

      <p className="gh-pagination__info" aria-live="polite">
        Showing {start}–{end} of {totalItems}
      </p>
    </nav>
  );
}

export default Pagination;
