/* ============================================================
   GITHUB HELPER UTILITIES
   Pure functions — no side effects, fully testable.
============================================================ */

/* ─────────────────────────────────────────
   AGGREGATION
───────────────────────────────────────── */

/**
 * Sum total stars across all repositories.
 * @param {GitHubRepo[]} repos
 * @returns {number}
 */
export function getTotalStars(repos = []) {
  return repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
}

/**
 * Sum total forks across all repositories.
 * @param {GitHubRepo[]} repos
 * @returns {number}
 */
export function getTotalForks(repos = []) {
  return repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
}

/**
 * Return the most recently updated repository.
 * @param {GitHubRepo[]} repos
 * @returns {GitHubRepo|null}
 */
export function getLatestRepo(repos = []) {
  if (!repos.length) return null;
  return repos.reduce((latest, r) =>
    new Date(r.updated_at) > new Date(latest.updated_at) ? r : latest
  );
}

/* ─────────────────────────────────────────
   LANGUAGE PERCENTAGES
───────────────────────────────────────── */

/**
 * Convert raw language byte totals into sorted percentage array.
 * @param {Record<string, number>} langBytes  { Python: 45000, JavaScript: 12000, … }
 * @param {number} topN  max languages to return (default 8)
 * @returns {{ name: string, bytes: number, percentage: number }[]}
 */
export function calcLanguagePercentages(langBytes = {}, topN = 8) {
  const total = Object.values(langBytes).reduce((s, b) => s + b, 0);
  if (total === 0) return [];

  return Object.entries(langBytes)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / total) * 1000) / 10, // 1 decimal
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, topN);
}

/* ─────────────────────────────────────────
   LANGUAGE COLOURS  (GitHub standard palette)
───────────────────────────────────────── */

const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python:     "#3572A5",
  HTML:       "#e34c26",
  CSS:        "#563d7c",
  SCSS:       "#c6538c",
  Shell:      "#89e051",
  Go:         "#00ADD8",
  Rust:       "#dea584",
  Java:       "#b07219",
  "C++":      "#f34b7d",
  C:          "#555555",
  Ruby:       "#701516",
  Swift:      "#F05138",
  Kotlin:     "#A97BFF",
  Dart:       "#00B4AB",
  PHP:        "#4F5D95",
  "C#":       "#178600",
  "Jupyter Notebook": "#DA5B0B",
  Vue:        "#41b883",
  Svelte:     "#ff3e00",
};

/**
 * Return a hex colour for a given language name.
 * Falls back to a neutral tan-ish colour.
 */
export function getLangColor(lang) {
  return LANG_COLORS[lang] ?? "#D2B48C";
}

/* ─────────────────────────────────────────
   SORTING
───────────────────────────────────────── */

/**
 * Sort repositories by a given field.
 * @param {GitHubRepo[]} repos
 * @param {"updated"|"stars"|"forks"|"name"} by
 * @returns {GitHubRepo[]}
 */
export function sortRepos(repos = [], by = "updated") {
  const clone = [...repos];
  switch (by) {
    case "stars":   return clone.sort((a, b) => b.stargazers_count - a.stargazers_count);
    case "forks":   return clone.sort((a, b) => b.forks_count - a.forks_count);
    case "name":    return clone.sort((a, b) => a.name.localeCompare(b.name));
    case "updated":
    default:        return clone.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }
}

/* ─────────────────────────────────────────
   FILTERING
───────────────────────────────────────── */

const FILTER_MAP = {
  all:        () => true,
  archived:   (r) => r.archived,
  python:     (r) => r.language?.toLowerCase() === "python",
  javascript: (r) => r.language?.toLowerCase() === "javascript",
  typescript: (r) => r.language?.toLowerCase() === "typescript",
  react:      (r) => topicsInclude(r, "react") || r.name.toLowerCase().includes("react"),
  ai:         (r) => topicsInclude(r, ["ai", "artificial-intelligence", "machine-learning", "ml", "deep-learning", "llm"]),
  ml:         (r) => topicsInclude(r, ["machine-learning", "ml", "scikit-learn", "tensorflow", "pytorch"]),
  frontend:   (r) => topicsInclude(r, ["frontend", "front-end", "web", "ui"]) || ["javascript","typescript","css","html"].includes(r.language?.toLowerCase()),
  backend:    (r) => topicsInclude(r, ["backend", "back-end", "api", "server", "fastapi", "flask", "django"]),
};

function topicsInclude(repo, terms) {
  const topics = repo.topics ?? [];
  const arr = Array.isArray(terms) ? terms : [terms];
  return arr.some((t) => topics.includes(t));
}

/**
 * Filter repositories by a named category.
 * @param {GitHubRepo[]} repos
 * @param {string} filter  one of the FILTER_MAP keys
 * @returns {GitHubRepo[]}
 */
export function filterRepos(repos = [], filter = "all") {
  const fn = FILTER_MAP[filter.toLowerCase()] ?? FILTER_MAP.all;
  return repos.filter(fn);
}

/** Return the list of available filter keys */
export const FILTER_KEYS = Object.keys(FILTER_MAP);

/* ─────────────────────────────────────────
   SEARCH
───────────────────────────────────────── */

/**
 * Search repositories by name, description, language, and topics.
 * @param {GitHubRepo[]} repos
 * @param {string} query
 * @returns {GitHubRepo[]}
 */
export function searchRepos(repos = [], query = "") {
  const q = query.toLowerCase().trim();
  if (!q) return repos;

  return repos.filter((r) => {
    const name        = r.name?.toLowerCase() ?? "";
    const desc        = r.description?.toLowerCase() ?? "";
    const lang        = r.language?.toLowerCase() ?? "";
    const topics      = (r.topics ?? []).join(" ").toLowerCase();
    return name.includes(q) || desc.includes(q) || lang.includes(q) || topics.includes(q);
  });
}

/* ─────────────────────────────────────────
   DATE FORMATTING
───────────────────────────────────────── */

/**
 * Format an ISO date string into a human-readable relative time.
 * e.g. "3 days ago", "2 months ago", "1 year ago"
 */
export function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const months  = Math.floor(days / 30);
  const years   = Math.floor(days / 365);

  if (years > 0)  return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0)   return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0)  return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

/**
 * Format an ISO date string into a short readable date.
 * e.g. "Jan 2024"
 */
export function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GB", {
    month: "short",
    year:  "numeric",
  });
}

/**
 * Format a full join date.
 * e.g. "Member since March 2022"
 */
export function formatJoinDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GB", {
    month: "long",
    year:  "numeric",
  });
}

/* ─────────────────────────────────────────
   CONTRIBUTION STREAKS  (from events)
───────────────────────────────────────── */

/**
 * Extract push-event dates from the public events array
 * and compute current + longest streak (in days).
 * @param {GitHubEvent[]} events
 * @returns {{ currentStreak: number, longestStreak: number, totalCommits: number }}
 */
export function calcStreaks(events = []) {
  const pushEvents = events.filter((e) => e.type === "PushEvent");
  const totalCommits = pushEvents.reduce(
    (sum, e) => sum + (e.payload?.commits?.length ?? 0),
    0
  );

  // Build unique set of active day strings "YYYY-MM-DD"
  const days = new Set(
    pushEvents.map((e) => e.created_at?.slice(0, 10)).filter(Boolean)
  );

  if (days.size === 0) return { currentStreak: 0, longestStreak: 0, totalCommits };

  const sorted = [...days].sort();
  let longestStreak = 1;
  let currentRun    = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const gap  = (curr - prev) / (1000 * 60 * 60 * 24);
    if (gap === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Current streak: is the last day today or yesterday?
  const last      = new Date(sorted[sorted.length - 1]);
  const today     = new Date();
  const gapToday  = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const currentStreak = gapToday <= 1 ? currentRun : 0;

  return { currentStreak, longestStreak, totalCommits };
}
