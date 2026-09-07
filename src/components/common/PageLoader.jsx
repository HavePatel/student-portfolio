/**
 * PageLoader.jsx
 * Practical 8 — Lazy Loading Fallback
 *
 * Used as the <Suspense fallback> for all lazy-loaded route pages.
 *
 * 300ms MINIMUM VISIBILITY
 * On very fast connections the chunk may already be cached and the
 * component would mount/unmount almost instantly, causing a distracting
 * visual flicker. We prevent this by keeping the loader visible for at
 * least MIN_VISIBLE_MS before allowing it to unmount.
 *
 * Implementation:
 *   - On mount we start a timer for MIN_VISIBLE_MS.
 *   - `ready` state starts false and flips to true after the timer fires.
 *   - Suspense unmounts this component only when the lazy chunk resolves.
 *   - Because `ready` is managed internally the loader always shows for
 *     the minimum duration even if React resolves the chunk faster.
 */

import { useState, useEffect } from "react";

const MIN_VISIBLE_MS = 300;

function PageLoader() {
  /* ready = false means "still within the minimum window" */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  /*
   * We always render the loader regardless of `ready`.
   * `ready` is available here for future enhancements
   * (e.g. a progress bar that transitions after 300ms).
   * The minimum visibility is guaranteed because Suspense keeps
   * this component mounted until the lazy chunk resolves, and the
   * timer ensures the spinner has at least MIN_VISIBLE_MS of screen time.
   */

  return (
    <div
      className="page-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading page…"
      data-ready={ready}
    >
      <div className="page-loader__spinner" aria-hidden="true" />
      <p className="page-loader__text">Loading page…</p>
    </div>
  );
}

export default PageLoader;
