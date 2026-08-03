import { AlertTriangle, WifiOff, UserX, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ERROR_MAP = {
  NOT_FOUND: {
    icon: <UserX size={44} strokeWidth={1.2} />,
    title: "User Not Found",
    desc: (ctx) => `No GitHub account found for "${ctx}". Check the username and try again.`,
    canRetry: false,
  },
  RATE_LIMITED: {
    icon: <WifiOff size={44} strokeWidth={1.2} />,
    title: "Rate Limit Reached",
    desc: (ctx) => `GitHub API rate limit exceeded. Resets at ${ctx}. Try again shortly.`,
    canRetry: false,
  },
  REPO_NOT_FOUND: {
    icon: <AlertTriangle size={44} strokeWidth={1.2} />,
    title: "Repository Not Found",
    desc: () => "This repository doesn't exist or is private.",
    canRetry: false,
  },
  default: {
    icon: <WifiOff size={44} strokeWidth={1.2} />,
    title: "Something Went Wrong",
    desc: () => "Could not load data from GitHub. Check your connection and try again.",
    canRetry: true,
  },
};

function parseError(message = "") {
  if (message === "NOT_FOUND")           return ["NOT_FOUND",    ""];
  if (message.startsWith("RATE_LIMITED"))return ["RATE_LIMITED", message.split(":")[1] ?? "soon"];
  if (message === "REPO_NOT_FOUND")      return ["REPO_NOT_FOUND",""];
  return ["default", ""];
}

function ErrorState({ message, context = "", onRetry, showBack = true }) {
  const navigate = useNavigate();
  const [key, ctx] = parseError(message);
  const cfg = ERROR_MAP[key] ?? ERROR_MAP.default;

  return (
    <div className="gh-error" role="alert" aria-live="assertive">
      <span className="gh-error__icon" aria-hidden="true">{cfg.icon}</span>

      <h3 className="gh-error__title">{cfg.title}</h3>
      <p  className="gh-error__desc">{cfg.desc(context || ctx)}</p>

      <div className="gh-error__actions">
        {cfg.canRetry && onRetry && (
          <button
            type="button"
            className="gh-btn gh-btn--primary"
            onClick={onRetry}
          >
            <RefreshCw size={15} strokeWidth={2} />
            Retry
          </button>
        )}
        {showBack && (
          <button
            type="button"
            className="gh-btn gh-btn--outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;
