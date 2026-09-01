import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";

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
const LoginPage             = lazy(() => import("./pages/LoginPage"));
const RegisterPage          = lazy(() => import("./pages/RegisterPage"));
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
    <AuthProvider>
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
            <Route path="/github"                        element={<GithubPage />}           />
            <Route path="/github/:username"              element={<GithubPage />}           />
            <Route path="/github/:username/:repoName"    element={<RepositoryDetailPage />} />

            {/* ── Authentication routes (Practical 7) ──────── */}
            <Route path="/login"    element={<LoginPage />}    />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Task Manager (Practical 7 Authenticated Full-Stack Integration) ───── */}
            <Route path="/tasks" element={<TaskManagerPage />} />
            <Route path="/task-manager" element={<TaskManagerPage />} />

            {/* ── 404 ───────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </AuthProvider>
  );
}

export default App;
