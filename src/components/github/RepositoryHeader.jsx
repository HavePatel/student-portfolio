import { ExternalLink, Copy, Check, ArrowLeft, Lock } from "lucide-react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { copyToClipboard } from "../../utils/copyToClipboard";

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.preventDefault();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      type="button"
      className={`gh-btn gh-btn--sm${copied ? " gh-btn--success" : ""}`}
      onClick={handleCopy}
      aria-label={copied ? "Copied!" : label}
    >
      {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
      {copied ? "Copied" : label}
    </button>
  );
}

/**
 * RepositoryHeader
 * Displays repo name, owner, description, and action buttons.
 */
function RepositoryHeader({ repo }) {
  const navigate = useNavigate();
  const {
    name, full_name, description, html_url, clone_url, ssh_url,
    owner, visibility,
  } = repo;

  return (
    <header className="repo-header">
      <button
        className="repo-header__back"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back
      </button>

      <div className="repo-header__main">
        <div className="repo-header__title-row">
          <h1 className="repo-header__name">{name}</h1>
          <span className={`repo-visibility repo-visibility--${visibility}`}>
            {visibility === "private" && <Lock size={13} strokeWidth={2} />}
            {visibility}
          </span>
        </div>

        <p className="repo-header__full-name">{full_name}</p>

        {description && <p className="repo-header__desc">{description}</p>}

        {/* Owner */}
        <div className="repo-header__owner">
          <img
            src={owner.avatar_url}
            alt={`${owner.login} avatar`}
            className="repo-header__avatar"
            loading="lazy"
          />
          <a
            href={owner.html_url}
            target="_blank"
            rel="noreferrer"
            className="repo-header__owner-link"
          >
            {owner.login}
          </a>
        </div>

        {/* Actions */}
        <div className="repo-header__actions">
          <a
            href={html_url}
            target="_blank"
            rel="noreferrer"
            className="gh-btn gh-btn--primary"
          >
            <ExternalLink size={14} strokeWidth={2} />
            Open on GitHub
          </a>
          <CopyBtn text={clone_url} label="Copy HTTPS" />
          <CopyBtn text={ssh_url}   label="Copy SSH"   />
        </div>
      </div>
    </header>
  );
}

export default RepositoryHeader;
