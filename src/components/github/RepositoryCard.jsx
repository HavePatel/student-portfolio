import { useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star, GitFork, AlertCircle, Scale,
  Lock, Unlock, Clock, Copy, Check,
  ExternalLink, ArrowRight,
} from "lucide-react";
import { copyToClipboard } from "../../utils/copyToClipboard";

/* ── Language colour palette ───────────────────────────────── */
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  HTML: "#e34c26", CSS: "#563d7c", "Jupyter Notebook": "#DA5B0B",
  Java: "#b07219", "C++": "#f34b7d", C: "#555555", Ruby: "#701516",
  Go: "#00ADD8", Rust: "#dea584", Swift: "#F05138", Kotlin: "#A97BFF",
  Vue: "#41b883", Svelte: "#ff3e00", Shell: "#89e051", PHP: "#4F5D95",
};
const langColor = (lang) => LANG_COLORS[lang] ?? "#D2B48C";

/* ── Formatters ─────────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (secs < 60)   return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60)   return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)   return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function fmtSize(kb) {
  if (!kb) return "0 KB";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/* ── CopyButton ─────────────────────────────────────────────── */
function CopyButton({ text, label = "Copy URL", className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      type="button"
      className={`gh-icon-btn ${className} ${copied ? "gh-icon-btn--success" : ""}`}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : label}
      title={copied ? "Copied!" : label}
    >
      {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
    </button>
  );
}

/* ── RepositoryCard ─────────────────────────────────────────── */
function RepositoryCard({ repo, username: propUsername }) {
  const { username: paramUsername } = useParams();
  const username = propUsername ?? paramUsername;

  const {
    name, description, language, stargazers_count, forks_count,
    open_issues_count, visibility, license, size, updated_at,
    topics = [], html_url, fork, archived,
  } = repo;

  const detailPath = `/github/${username}/${name}`;

  return (
    <article
      className={`repo-card${archived ? " repo-card--archived" : ""}`}
      tabIndex={0}
      aria-label={`Repository: ${name}`}
    >
      {/* ── Header ─────────── */}
      <div className="repo-card__header">
        <div className="repo-card__title-row">
          <Link to={detailPath} className="repo-card__name" title={name}>
            {name}
          </Link>
          <div className="repo-card__badges">
            {fork     && <span className="repo-badge repo-badge--fork">Fork</span>}
            {archived && <span className="repo-badge repo-badge--archived">Archived</span>}
            {visibility === "private"
              ? <Lock   size={13} strokeWidth={2} className="repo-vis-icon" aria-label="Private" />
              : <Unlock size={13} strokeWidth={2} className="repo-vis-icon" aria-label="Public"  />}
          </div>
        </div>

        <p className="repo-card__desc">
          {description || <em className="repo-card__no-desc">No description.</em>}
        </p>
      </div>

      {/* ── Topics ─────────── */}
      {topics.length > 0 && (
        <div className="repo-card__topics">
          {topics.slice(0, 5).map((t) => (
            <span key={t} className="repo-topic">{t}</span>
          ))}
        </div>
      )}

      {/* ── Stats row ──────── */}
      <div className="repo-card__stats">
        {language && (
          <span className="repo-lang">
            <span className="repo-lang__dot" style={{ background: langColor(language) }} />
            {language}
          </span>
        )}
        <span className="repo-stat" title="Stars">
          <Star size={13} strokeWidth={2} /> {stargazers_count}
        </span>
        <span className="repo-stat" title="Forks">
          <GitFork size={13} strokeWidth={2} /> {forks_count}
        </span>
        <span className="repo-stat" title="Open issues">
          <AlertCircle size={13} strokeWidth={2} /> {open_issues_count}
        </span>
        <span className="repo-stat repo-stat--muted" title="Size">
          {fmtSize(size)}
        </span>
        {license?.spdx_id && license.spdx_id !== "NOASSERTION" && (
          <span className="repo-stat repo-stat--muted" title="License">
            <Scale size={12} strokeWidth={2} /> {license.spdx_id}
          </span>
        )}
      </div>

      {/* ── Footer ─────────── */}
      <div className="repo-card__footer">
        <span className="repo-card__updated">
          <Clock size={12} strokeWidth={2} />
          {timeAgo(updated_at)}
        </span>

        <div className="repo-card__actions">
          <CopyButton text={html_url} label="Copy repository URL" />

          <a
            href={html_url}
            target="_blank"
            rel="noreferrer"
            className="gh-icon-btn"
            aria-label="Open on GitHub"
            title="Open on GitHub"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} strokeWidth={2} />
          </a>

          <Link
            to={detailPath}
            className="gh-icon-btn gh-icon-btn--view"
            aria-label="View repository details"
            title="View details"
          >
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default RepositoryCard;
