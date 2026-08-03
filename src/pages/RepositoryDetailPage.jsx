import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Container from "../components/ui/Container";
import RepositoryHeader from "../components/github/RepositoryHeader";
import RepositoryStats  from "../components/github/RepositoryStats";
import ErrorState       from "../components/github/ErrorState";
import { RepoDetailSkeleton } from "../components/github/LoadingSkeleton";
import { useGithubRepo } from "../hooks/useGithubRepo";
import "../styles/github-explorer.css";

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  HTML: "#e34c26", CSS: "#563d7c", "Jupyter Notebook": "#DA5B0B",
  Java: "#b07219", "C++": "#f34b7d", Go: "#00ADD8", Rust: "#dea584",
};
const lc = (l) => LANG_COLORS[l] ?? "#D2B48C";

/* ── Language bar ─────────────────────────────────────────── */
function LanguageBar({ languages }) {
  if (!languages) return null;
  const total = Object.values(languages).reduce((s, b) => s + b, 0);
  if (!total) return null;

  const sorted = Object.entries(languages)
    .map(([name, bytes]) => ({ name, pct: (bytes / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="repo-lang-section">
      <h3 className="repo-section-title">Languages</h3>
      <div className="repo-lang-bar" role="img" aria-label="Language distribution">
        {sorted.map((l) => (
          <div
            key={l.name}
            className="repo-lang-bar__seg"
            style={{ width: `${l.pct}%`, background: lc(l.name) }}
            title={`${l.name}: ${l.pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <ul className="repo-lang-legend">
        {sorted.map((l) => (
          <li key={l.name}>
            <span className="repo-lang-dot" style={{ background: lc(l.name) }} />
            {l.name} <em>{l.pct.toFixed(1)}%</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── README renderer ─────────────────────────────────────── */
function ReadmeSection({ readmeObj }) {
  const html = useMemo(() => {
    if (!readmeObj?.content) return null;
    try {
      const decoded = atob(readmeObj.content.replace(/\n/g, ""));
      // Render as plain pre-formatted text (no markdown parser dep)
      return decoded;
    } catch {
      return null;
    }
  }, [readmeObj]);

  if (!html) return null;

  return (
    <section className="repo-readme">
      <h3 className="repo-section-title">README</h3>
      <div className="repo-readme__content">
        <pre className="repo-readme__pre">{html}</pre>
      </div>
    </section>
  );
}

/* ── Topics ──────────────────────────────────────────────── */
function TopicsSection({ topics }) {
  if (!topics?.length) return null;
  return (
    <div className="repo-topics-section">
      <h3 className="repo-section-title">Topics</h3>
      <div className="repo-card__topics">
        {topics.map((t) => (
          <span key={t} className="repo-topic">{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
function RepositoryDetailPage() {
  const { username, repoName } = useParams();
  const { repo, readme, languages, loading, error, refetch } = useGithubRepo(username, repoName);

  if (loading && !repo) {
    return (
      <div className="repo-detail-page">
        <Container><RepoDetailSkeleton /></Container>
      </div>
    );
  }

  if (error) {
    const errMsg = error === "NOT_FOUND" ? "REPO_NOT_FOUND" : error;
    return (
      <div className="repo-detail-page">
        <Container>
          <ErrorState message={errMsg} context={`${username}/${repoName}`} onRetry={refetch} />
        </Container>
      </div>
    );
  }

  if (!repo) return null;

  return (
    <div className="repo-detail-page">
      <Container>
        <div className="repo-detail-layout">

          {/* Left: header + readme */}
          <div className="repo-detail-layout__main">
            <RepositoryHeader repo={repo} />
            <TopicsSection    topics={repo.topics} />
            <LanguageBar      languages={languages} />
            <ReadmeSection    readmeObj={readme} />
          </div>

          {/* Right: stats sidebar */}
          <aside className="repo-detail-layout__aside">
            <RepositoryStats repo={repo} languages={languages} />
          </aside>

        </div>
      </Container>
    </div>
  );
}

export default RepositoryDetailPage;
