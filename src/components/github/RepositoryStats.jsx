import {
  Star, GitFork, Eye, AlertCircle, Scale, Calendar,
  GitBranch, Package, ExternalLink,
} from "lucide-react";

function timeAgo(iso) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (secs < 60)   return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60)   return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 365)  return `${days}d ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="repo-stat-card">
      <span className="repo-stat-card__icon" aria-hidden="true">{icon}</span>
      <div className="repo-stat-card__body">
        <strong className="repo-stat-card__value">{value ?? "—"}</strong>
        <span className="repo-stat-card__label">{label}</span>
        {sub && <span className="repo-stat-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

/**
 * RepositoryStats
 * Grid of stat cards for stars, forks, watchers, size, license, etc.
 */
function RepositoryStats({ repo, languages }) {
  const {
    stargazers_count, forks_count, watchers_count,
    open_issues_count, size, license, default_branch, created_at,
    updated_at, homepage,
  } = repo;

  const primaryLang = languages
    ? Object.keys(languages).sort((a, b) => languages[b] - languages[a])[0]
    : null;

  const stats = [
    { icon: <Star size={18} strokeWidth={2} />,         label: "Stars",       value: stargazers_count },
    { icon: <GitFork size={18} strokeWidth={2} />,      label: "Forks",       value: forks_count },
    { icon: <Eye size={18} strokeWidth={2} />,          label: "Watchers",    value: watchers_count },
    { icon: <AlertCircle size={18} strokeWidth={2} />,  label: "Open Issues", value: open_issues_count },
    { icon: <Package size={18} strokeWidth={2} />,      label: "Size",        value: `${Math.round(size)} KB` },
    { icon: <GitBranch size={18} strokeWidth={2} />,    label: "Branch",      value: default_branch },
    primaryLang && { icon: <span style={{ fontSize: "1.1rem" }}>◉</span>, label: "Primary Language", value: primaryLang },
    license?.spdx_id && license.spdx_id !== "NOASSERTION" && {
      icon: <Scale size={18} strokeWidth={2} />,
      label: "License",
      value: license.spdx_id,
    },
    { icon: <Calendar size={18} strokeWidth={2} />, label: "Created", value: fmtDate(created_at), sub: timeAgo(created_at) },
    { icon: <Calendar size={18} strokeWidth={2} />, label: "Updated", value: fmtDate(updated_at), sub: timeAgo(updated_at) },
  ].filter(Boolean);

  return (
    <div className="repo-stats">
      <div className="repo-stats__grid">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {homepage && (
        <div className="repo-stats__homepage">
          <a href={homepage} target="_blank" rel="noreferrer" className="gh-btn gh-btn--outline">
            <ExternalLink size={14} strokeWidth={2} />
            Visit Homepage
          </a>
        </div>
      )}
    </div>
  );
}

export default RepositoryStats;
