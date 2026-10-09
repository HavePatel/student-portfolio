/**
 * App.jsx
 *
 * Practical 8 — Performance Optimization & Lazy Loading
 *
 * ROUTE-BASED CODE SPLITTING
 * Every page except Home is loaded lazily with React.lazy().
 * Home is eagerly loaded because it is the above-the-fold landing page
 * and must be available instantly with zero network round-trip.
 *
 * All remaining pages are downloaded only when the user first navigates
 * to that route, keeping the initial JS bundle as small as possible.
 *
 * SUSPENSE FALLBACK
 * A single <Suspense> wraps the <Routes> block (not the entire app).
 * Header and Footer remain immediately available — they are never
 * caught by the Suspense boundary.
 *
 * The fallback is <PageLoader />, which:
 *   - displays a premium branded spinner matching the Oxford Blue theme
 *   - enforces a 300ms minimum visibility to prevent flicker on fast
 *     connections where the chunk may already be cached
 *
 * ERROR BOUNDARY
 * <LazyErrorBoundary> wraps the <Suspense> block so that network
 * failures or corrupted chunks during lazy loading are caught
 * gracefully and shown as a recoverable error UI rather than crashing
 * the application.
 *
 * COMPONENT-LEVEL LAZY LOADING (Supplementary Requirement)
 * RepositoryGrid is the heaviest non-page component in the GitHub
 * Explorer — it owns the search/filter pipeline, renders up to 100
 * RepoCards, and imports from three utility modules. It is lazy-loaded
 * at the component level so it does not ship in the GithubPage chunk
 * unless the repository grid is actually rendered.
 * See: src/components/github/RepositoryGrid.lazy.jsx
 */

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Header            from "./components/layout/Header";
import Footer            from "./components/layout/Footer";
import { AuthProvider }  from "./context/AuthContext";
import PageLoader        from "./components/common/PageLoader";
import LazyErrorBoundary from "./components/common/LazyErrorBoundary";

/* ─────────────────────────────────────────────────────────────
   EAGER LOAD
   Home is the first thing users see — load it immediately.
───────────────────────────────────────────────────────────── */
import Home from "./pages/Home";

/* ─────────────────────────────────────────────────────────────
   ROUTE-BASED LAZY LOADING  (Practical 8 — Core Requirement)
   Each import() call tells Vite to emit a separate chunk file.
   The browser downloads that chunk only when the route is visited.
───────────────────────────────────────────────────────────── */

// Portfolio pages
const AboutPage            = lazy(() => import("./pages/AboutPage"));
const SkillsPage           = lazy(() => import("./pages/SkillsPage"));
const EducationPage        = lazy(() => import("./pages/EducationPage"));
const ContactPage          = lazy(() => import("./pages/ContactPage"));

// GitHub Explorer (heaviest page — ~18 KB gzipped chunk)
const GithubPage           = lazy(() => import("./pages/GithubPage"));
const RepositoryDetailPage = lazy(() => import("./pages/RepositoryDetailPage"));

// Task Manager / Auth (Practical 7 — kept lazy)
const TaskManagerPage      = lazy(() => import("./pages/TaskManagerPage"));
const LoginPage            = lazy(() => import("./pages/LoginPage"));
const RegisterPage         = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage   = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage    = lazy(() => import("./pages/ResetPasswordPage"));

// Admin (RBAC — admin only)
const AdminPage            = lazy(() => import("./pages/AdminPage"));

// 404
const NotFound             = lazy(() => import("./pages/NotFound"));

/* ─────────────────────────────────────────────────────────────
   APP
───────────────────────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      {/* Header & Footer are NOT inside Suspense — always available */}
      <Header />

      <main>
        {/*
         * LazyErrorBoundary catches chunk-load failures (network drop,
         * stale CDN, 404 on chunk file) so the app stays recoverable.
         *
         * Suspense fallback shows <PageLoader> (300ms minimum visible)
         * while the requested route chunk is downloading.
         *
         * Only <Routes> is wrapped — nothing above or below is delayed.
         */}
        <LazyErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Static portfolio routes ─────────────────── */}
              <Route path="/"          element={<Home />}          />
              <Route path="/about"     element={<AboutPage />}     />
              <Route path="/skills"    element={<SkillsPage />}    />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/contact"   element={<ContactPage />}   />

              {/* ── GitHub Explorer ──────────────────────────── */}
              <Route path="/github"                     element={<GithubPage />}           />
              <Route path="/github/:username"           element={<GithubPage />}           />
              <Route path="/github/:username/:repoName" element={<RepositoryDetailPage />} />

              {/* ── Auth (Practical 7) ───────────────────────── */}
              <Route path="/login"                  element={<LoginPage />}          />
              <Route path="/register"               element={<RegisterPage />}       />
              <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token"  element={<ResetPasswordPage />}  />

              {/* ── Task Manager (Practical 6 & 7) ──────────── */}
              <Route path="/tasks"        element={<TaskManagerPage />} />
              <Route path="/task-manager" element={<TaskManagerPage />} />

              {/* ── Admin (RBAC — admin only) ────────────────── */}
              <Route path="/admin" element={<AdminPage />} />

              {/* ── 404 ─────────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LazyErrorBoundary>
      </main>

      <Footer />
    </AuthProvider>
  );
}

export default App;
