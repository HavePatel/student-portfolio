import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Eagerly loaded (above-fold)
import Home from "./pages/Home";

// Lazy loaded pages (code splitting)
const AboutPage             = lazy(() => import("./pages/AboutPage"));
const SkillsPage            = lazy(() => import("./pages/SkillsPage"));
const EducationPage         = lazy(() => import("./pages/EducationPage"));
const ContactPage           = lazy(() => import("./pages/ContactPage"));
const GithubPage            = lazy(() => import("./pages/GithubPage"));
const RepositoryDetailPage  = lazy(() => import("./pages/RepositoryDetailPage"));
const TaskManagerPage       = lazy(() => import("./pages/TaskManagerPage"));
const NotFound              = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading…</span>
    </div>
  );
}

function App() {
  return (
    <>
      <Header />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Static portfolio routes ───────────────────── */}
            <Route path="/"           element={<Home />}          />
            <Route path="/about"      element={<AboutPage />}     />
            <Route path="/skills"     element={<SkillsPage />}    />
            <Route path="/education"  element={<EducationPage />} />
            <Route path="/contact"    element={<ContactPage />}   />

            {/* ── GitHub Explorer routes ────────────────────── */}
            {/* /github           → Explorer with default user (HavePatel) */}
            {/* /github/:username → Explorer for any user                  */}
            {/* /github/:username/:repoName → Repository detail            */}
            <Route path="/github"                        element={<GithubPage />}           />
            <Route path="/github/:username"              element={<GithubPage />}           />
            <Route path="/github/:username/:repoName"    element={<RepositoryDetailPage />} />

            {/* ── Task Manager (Practical 4 — temporary) ───── */}
            <Route path="/tasks" element={<TaskManagerPage />} />

            {/* ── 404 ───────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

export default App;
