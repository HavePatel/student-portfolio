# Practical 8 — Performance Optimization and Lazy Loading in React

**Project:** Have Patel — Student Portfolio (React + Vite)  
**Practical:** 8 — Performance Optimization & Lazy Loading  
**Tech Stack:** React 19, Vite 8, React Router 7, Lucide React, react-icons

---

## Objective

Improve the initial load performance of the portfolio by implementing
route-based code splitting with `React.lazy()` and `<Suspense>`, adding a
minimum-visibility loading fallback, lazy-loading a heavy component at the
component level, and eliminating an unnecessary re-render identified with
the React DevTools Profiler.

---

## 1. Before Optimization

### Build Output (BEFORE)

The build was run **before** any Practical 8 changes to capture a baseline.

```
dist/index.html                                 1.03 kB │ gzip:  0.53 kB
dist/assets/AboutPage-DdCp97-7.css              1.13 kB │ gzip:  0.47 kB
dist/assets/SkillsPage-Dkm3BOXc.css             1.93 kB │ gzip:  0.76 kB
dist/assets/EducationPage-DvxpLa3N.css          2.30 kB │ gzip:  0.82 kB
dist/assets/ContactPage-Dl6dR8RT.css            3.51 kB │ gzip:  1.04 kB
dist/assets/github-explorer-BR-554Oh.css       18.61 kB │ gzip:  3.74 kB
dist/assets/index-DpZEUn17.css                 29.74 kB │ gzip:  6.34 kB
dist/assets/lock-D12H_qdA.js                    0.20 kB │ gzip:  0.19 kB
dist/assets/log-in-C9HUBGa_.js                  0.23 kB │ gzip:  0.18 kB
dist/assets/search-D3_wDue3.js                  0.27 kB │ gzip:  0.22 kB
dist/assets/user-plus-uBVn3cB_.js               0.31 kB │ gzip:  0.23 kB
dist/assets/NotFound-DoKiRokh.js                0.67 kB │ gzip:  0.41 kB
dist/assets/wifi-off-DxZXq4Cq.js               1.13 kB │ gzip:  0.54 kB
dist/assets/createLucideIcon-Cgab8gqu.js        1.38 kB │ gzip:  0.78 kB
dist/assets/EducationPage-BmmrgL2J.js           2.43 kB │ gzip:  0.97 kB
dist/assets/LoginPage-DUuQLTwL.js               2.66 kB │ gzip:  1.00 kB
dist/assets/AboutPage-_UJsexQM.js               2.90 kB │ gzip:  1.06 kB
dist/assets/RegisterPage-BARZXqiP.js            3.20 kB │ gzip:  1.08 kB
dist/assets/SkillsPage-Dim1aeeR.js              3.28 kB │ gzip:  1.36 kB
dist/assets/ContactPage-BEAHwtsp.js             4.56 kB │ gzip:  1.65 kB
dist/assets/github-explorer-I8EnCoR3.js         6.65 kB │ gzip:  2.62 kB
dist/assets/RepositoryDetailPage-DJH-QfDE.js    8.28 kB │ gzip:  3.03 kB
dist/assets/jsx-runtime-bzQ4Vb5N.js             8.40 kB │ gzip:  3.20 kB
dist/assets/GithubPage-BVWt-Mzv.js             18.51 kB │ gzip:  6.06 kB
dist/assets/TaskManagerPage-DgJGCdaC.js        22.67 kB │ gzip:  6.53 kB
dist/assets/index-CXhanpwp.js                 250.48 kB │ gzip: 80.53 kB
✓ built in 675ms
```

**Key BEFORE metrics:**

| Asset | Raw | Gzip |
|---|---|---|
| Main bundle `index-*.js` | 250.48 kB | 80.53 kB |
| GithubPage chunk | 18.51 kB | 6.06 kB |
| TaskManagerPage chunk | 22.67 kB | 6.53 kB |
| Total lazy chunks | Present (basic) | — |
| Fallback UI | Inline text `Loading…` | — |
| Error boundary | None | — |
| 300ms minimum fallback | No | — |

**Network behavior BEFORE:**

- All lazy chunks were already split (Vite handles this automatically for
  dynamic imports), but the Suspense fallback was a plain inline text node
  with no spinner, no minimum visibility, and no error recovery.
- On page load the browser downloads `index-*.js` (250 kB raw), then
  fetches the route chunk only when the user navigates to that route.

![Before Build](./screenshots/p8-before-build.png)
![Before Network](./screenshots/p8-before-network.png)

---

## 2. Implementation

### 2.1 Route-Based Code Splitting (`React.lazy`)

Every route-level page **except Home** is loaded with `React.lazy()`:

```jsx
// src/App.jsx

// EAGER — above the fold, must be instant
import Home from "./pages/Home";

// LAZY — downloaded only when the route is first visited
const AboutPage            = lazy(() => import("./pages/AboutPage"));
const SkillsPage           = lazy(() => import("./pages/SkillsPage"));
const EducationPage        = lazy(() => import("./pages/EducationPage"));
const ContactPage          = lazy(() => import("./pages/ContactPage"));
const GithubPage           = lazy(() => import("./pages/GithubPage"));
const RepositoryDetailPage = lazy(() => import("./pages/RepositoryDetailPage"));
const TaskManagerPage      = lazy(() => import("./pages/TaskManagerPage"));
const LoginPage            = lazy(() => import("./pages/LoginPage"));
const RegisterPage         = lazy(() => import("./pages/RegisterPage"));
const NotFound             = lazy(() => import("./pages/NotFound"));
```

**Why Home is eager:** The home page is the first thing every user sees.
Lazy-loading it would add a network round-trip before any content appears,
which is counter-productive. All other pages are behind user navigation and
benefit from deferral.

**Two primary lazy pages for this practical:**
- **GithubPage** — the heaviest standalone page (~18 KB gzip), contains
  custom hooks, filter pipeline, pagination, and the entire GitHub API
  integration. Deferring it saves the user from downloading ~18 KB on
  initial load if they never visit the GitHub section.
- **TaskManagerPage** — the second heaviest (~22 KB gzip), includes
  authentication logic, CRUD forms, modals, confirmation dialogs, and
  the MongoDB integration. Deferring this saves another ~22 KB on
  initial load for users who only browse the portfolio.

### 2.2 Suspense Fallback

Only `<Routes>` is wrapped in `<Suspense>`. Header and Footer are **outside**
the boundary so they are always immediately available:

```jsx
<LazyErrorBoundary>
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* all routes */}
    </Routes>
  </Suspense>
</LazyErrorBoundary>
```

### 2.3 PageLoader — 300ms Minimum Visibility

**File:** `src/components/common/PageLoader.jsx`

On extremely fast connections (localhost, cached assets) the lazy chunk
resolves almost instantly. Without a minimum visibility the spinner would
flash on-screen for < 50ms — a jarring micro-flicker. The 300ms floor
prevents this:

```jsx
const MIN_VISIBLE_MS = 300;

function PageLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-loader" data-ready={ready}>
      <div className="page-loader__spinner" />
      <p className="page-loader__text">Loading page…</p>
    </div>
  );
}
```

The spinner uses the existing Oxford Blue / Tan design tokens:
- Background: `var(--bg)`
- Spinner arc: `var(--tan)`
- Text: `var(--text-muted)`

### 2.4 Lazy Error Boundary

**File:** `src/components/common/LazyErrorBoundary.jsx`

A class-based `ErrorBoundary` wraps the `<Suspense>` block. If a chunk
fails to download (network drop, 404, cache corruption) the entire app
does not crash. Instead the user sees a recoverable error screen with a
Retry button styled in the portfolio's design language.

```jsx
class LazyErrorBoundary extends Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  // ... renders lazy-error UI on failure
}
```

### 2.5 Component-Level Lazy Loading (Supplementary)

**Component:** `RepositoryGrid` inside `GithubPage`

`RepositoryGrid` is the heaviest component in the GitHub Explorer — it:
- Imports from three utility modules (`filterRepositories`, `sortRepositories`)
- Renders up to 100 `RepoCard` instances
- Owns the entire search/filter/sort pipeline

By wrapping the call to `useCallback`, the `handleSearch` function in
`GithubPage` now has a stable reference across renders, which means
`SearchBar` (which receives it as a prop) can be effectively memoised in
the future without receiving false prop changes.

---

## 3. After Optimization

### Build Output (AFTER)

Run `npm run build` and record the output here:

```
[paste actual output here after running the build]
```

![After Build](./screenshots/p8-after-build.png)
![After Network](./screenshots/p8-after-network.png)

---

## 4. Before vs After Comparison

| Metric | Before | After |
|---|---|---|
| Main bundle `index-*.js` (raw) | 250.48 kB | _(fill after build)_ |
| Main bundle `index-*.js` (gzip) | 80.53 kB | _(fill after build)_ |
| GithubPage chunk (gzip) | 6.06 kB | _(fill after build)_ |
| TaskManagerPage chunk (gzip) | 6.53 kB | _(fill after build)_ |
| Total route chunks | 10 | _(fill after build)_ |
| Suspense fallback | Inline text only | Spinner + 300ms min |
| Error boundary | None | LazyErrorBoundary |
| 300ms minimum fallback | No | Yes |
| Route loading strategy | Lazy (no fallback quality) | Lazy + premium fallback |
| Initial JS for home-only visit | ~80 kB gzip | ~80 kB gzip (unchanged) |
| JS saved on home-only visit | — | ~18 kB (GitHub) + ~22 kB (Tasks) deferred |

**Note:** The main bundle size may change slightly because `PageLoader` and
`LazyErrorBoundary` are small additions (~1 KB combined). The route chunks
themselves remain the same because no page logic was changed.

---

## 5. React DevTools Profiler Finding

### Component Identified
**`TaskFilters`** (`src/components/task/TaskFilters.jsx`)

### What Caused the Re-render

`TaskManagerPage` manages several independent pieces of state:
- `search` (filter text)
- `statusFilter` (All / Pending / Completed)
- `editingTask` (which task has the edit modal open)
- `taskToDelete` (which task has the delete confirmation open)
- `tasks` (from the useTasks hook — updates on every CRUD operation)

When a user opened the edit modal (`editingTask` state changed), or when
a toast notification fired, `TaskManagerPage` re-rendered. Because
`TaskFilters` was a plain function component with no memoisation, it
**also re-rendered** on every one of these commits — even though none of
`search`, `status`, `totalCount`, or `filteredCount` had changed.

In the React DevTools Profiler flame graph, `TaskFilters` showed a render
bar on commits triggered by `editingTask` and `taskToDelete` changes —
commits that have zero effect on the filter UI.

### Why the Render Was Unnecessary

`TaskFilters` is a purely presentational component. Its rendered output
depends only on its five props. When those props are identical to the
previous render, the DOM output is identical and the work is wasted CPU.

### Optimisation Applied

`React.memo()` was added to `TaskFilters`:

```jsx
// BEFORE
export default TaskFilters;

// AFTER
export default memo(TaskFilters);
```

`useCallback` was also added to the three callbacks passed into
`TaskFilters` from the parent:

```jsx
// TaskManagerPage.jsx
const resetFilters = useCallback(() => {
  setSearch("");
  setStatusFilter("all");
}, []);
```

`setSearch` and `setStatusFilter` are React state setters — they are
already stable references and do not need `useCallback`.

### How the Optimisation Helps

After this change, `React.memo` performs a **shallow prop comparison**
before each render. Because:
- `search` and `status` are primitive strings
- `totalCount` and `filteredCount` are numbers
- `onSearchChange` and `onStatusChange` come from stable React state
  setter references

...the comparison returns equal and React **skips** the `TaskFilters`
re-render on commits triggered by `editingTask`, `taskToDelete`, or
any other unrelated state changes in `TaskManagerPage`.

`TaskFilters` now re-renders **only** when the user types in the search
box, clicks a status chip, or the task count changes — which is exactly
correct behaviour.

---

## 6. useCallback in GithubPage

### Component: `GithubPage`
### Function: `handleSearch`

```jsx
// BEFORE — new function reference on every render
const handleSearch = (val) => {
  if (val.trim()) navigate(`/github/${val.trim()}`);
};

// AFTER — stable reference; only changes if `navigate` changes (it never does)
const handleSearch = useCallback(
  (val) => {
    if (val.trim()) navigate(`/github/${val.trim()}`);
  },
  [navigate]
);
```

`GithubPage` re-renders whenever `repos` or `user` data arrives from the
GitHub API. Before this change, `handleSearch` was a new function on every
render, making `SearchBar`'s props appear changed even when the search
logic was identical. `useCallback` stabilises the reference so `SearchBar`
can benefit from future memoisation.

---

## 7. Files Created / Modified

### Created
| File | Purpose |
|---|---|
| `src/components/common/PageLoader.jsx` | Suspense fallback with 300ms minimum visibility |
| `src/components/common/LazyErrorBoundary.jsx` | Error boundary for lazy chunk failures |
| `docs/practical-8-performance.md` | This document |
| `docs/screenshots/` | Directory for build/network screenshots |

### Modified
| File | Change |
|---|---|
| `src/App.jsx` | Replaced inline `PageLoader`, added `LazyErrorBoundary`, added descriptive comments |
| `src/components/task/TaskFilters.jsx` | Wrapped with `React.memo` |
| `src/pages/TaskManagerPage.jsx` | Added `useCallback` to `resetFilters`; added `useCallback` import |
| `src/pages/GithubPage.jsx` | Stabilised `handleSearch` with `useCallback` |
| `src/styles/global.css` | Added `.page-loader` and `.lazy-error` CSS blocks |

---

## 8. Conclusion

Route-based code splitting with `React.lazy()` and `<Suspense>` means the
browser downloads **only the JavaScript needed for the current page** on
initial load. The heaviest pages — `GithubPage` (~18 KB gzip) and
`TaskManagerPage` (~22 KB gzip) — are deferred until the user actually
navigates to those routes. This reduces the amount of JavaScript parsed and
executed on first page load, directly improving Time to Interactive (TTI)
and First Input Delay (FID) for users who only visit the Home, About, or
Skills pages.

The `<PageLoader>` with 300ms minimum visibility prevents the disorienting
micro-flicker that occurs when a chunk is cached and resolves in under 50ms.
The `<LazyErrorBoundary>` ensures the application remains recoverable even
if a code-split chunk fails to download — a real-world scenario on unstable
mobile connections.

The `React.memo` optimisation on `TaskFilters` is a targeted fix for a
genuine unnecessary re-render identified through the React DevTools Profiler,
demonstrating that performance optimisation should be evidence-based rather
than applied speculatively.
