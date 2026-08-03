/**
 * githubService.js
 *
 * Single source of truth for all GitHub API communication.
 * UI components NEVER import fetch URLs directly — everything goes through here.
 * Swap the BASE_URL or auth strategy here to move to a backend proxy.
 */

const BASE_URL = "https://api.github.com";

/**
 * Optional personal access token for higher rate limits (60 → 5000 req/hr).
 * Set VITE_GITHUB_TOKEN in your .env file.
 * Never commit a real token.
 */
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN ?? "";

const buildHeaders = () => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
});

/* ─── Internal fetch wrapper ─────────────────────────────── */

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: buildHeaders(),
    ...options,
  });

  if (res.status === 404) {
    const err = new Error("NOT_FOUND");
    err.status = 404;
    throw err;
  }

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("X-RateLimit-Reset");
    const resetTime = reset
      ? new Date(Number(reset) * 1000).toLocaleTimeString()
      : "soon";
    const err = new Error(`RATE_LIMITED:${resetTime}`);
    err.status = 429;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`API_ERROR:${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

/* ─── Public API ─────────────────────────────────────────── */

/**
 * Fetch a user's public profile.
 * @param {string} username
 */
export const fetchUser = (username) =>
  apiFetch(`/users/${encodeURIComponent(username)}`);

/**
 * Fetch all public repositories for a user (up to 100).
 * @param {string} username
 */
export const fetchRepos = (username) =>
  apiFetch(
    `/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100&type=public`
  );

/**
 * Fetch a single repository.
 * @param {string} username
 * @param {string} repoName
 */
export const fetchRepo = (username, repoName) =>
  apiFetch(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`
  );

/**
 * Fetch README content (base64-encoded).
 * Returns null if no README exists.
 * @param {string} username
 * @param {string} repoName
 */
export const fetchReadme = async (username, repoName) => {
  try {
    return await apiFetch(
      `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/readme`
    );
  } catch {
    return null;
  }
};

/**
 * Fetch language byte-counts for a single repository.
 * @param {string} username
 * @param {string} repoName
 */
export const fetchRepoLanguages = (username, repoName) =>
  apiFetch(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/languages`
  );

/**
 * Aggregate language bytes across multiple repos.
 * Returns a { lang: bytes } map.
 * @param {string} username
 * @param {Array}  repos
 */
export const fetchAggregatedLanguages = async (username, repos = []) => {
  const results = await Promise.allSettled(
    repos.map((r) => fetchRepoLanguages(username, r.name))
  );
  const totals = {};
  results.forEach((r) => {
    if (r.status === "fulfilled") {
      Object.entries(r.value).forEach(([lang, bytes]) => {
        totals[lang] = (totals[lang] ?? 0) + bytes;
      });
    }
  });
  return totals;
};
