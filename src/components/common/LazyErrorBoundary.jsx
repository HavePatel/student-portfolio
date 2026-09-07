/**
 * LazyErrorBoundary.jsx
 * Practical 8 — Error Boundary for lazy-loaded routes
 *
 * React.lazy() failures (network timeout, chunk 404, syntax error in
 * a code-split module) would otherwise crash the entire application.
 * This boundary catches those failures and renders a recoverable UI
 * that matches the existing portfolio design system.
 *
 * Must be a class component — React error boundaries cannot be
 * implemented with function components (hooks do not support
 * componentDidCatch / getDerivedStateFromError).
 */

import { Component } from "react";
import { RefreshCw } from "lucide-react";

class LazyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    /* Log for developer visibility — not shown to the user */
    console.error("[LazyErrorBoundary] Failed to load page chunk:", error, info);
  }

  handleRetry = () => {
    /* Clear the error state — React will re-attempt rendering the child */
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="lazy-error" role="alert" aria-live="assertive">
        <div className="lazy-error__inner">
          <span className="lazy-error__code" aria-hidden="true">⚠</span>
          <h2 className="lazy-error__title">Page failed to load</h2>
          <p className="lazy-error__desc">
            The page could not be downloaded. Check your connection and try again.
          </p>
          <button
            type="button"
            className="lazy-error__btn"
            onClick={this.handleRetry}
          >
            <RefreshCw size={15} strokeWidth={2} aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    );
  }
}

export default LazyErrorBoundary;
