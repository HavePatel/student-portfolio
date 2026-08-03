/* ============================================================
   GITHUB API SERVICE
   All communication with the GitHub REST API lives here.
============================================================ */

export const GITHUB_USERNAME = "HavePatel";

const BASE_URL = "https://api.github.com";

/* Optional: set a personal access token for higher rate limits.
   Leave as empty string for unauthenticated (60 req/hr). */
const TOKEN = "";

const headers = {
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

/* ─────────────────────────────────────────
   INTERNAL FETCH WRAPPER
───────────────────────────────────────── */

async function githubFetch(path, customHeaders = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { ...headers, ...customHeaders },
  });

  if (res.status === 403) {
    const reset = res.headers.get("X-RateLimit-Reset");
    const resetDate = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : "soon";
    throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}.`);
  }

  if (res.status === 404) {
    throw new Error(`Requested resource not found on GitHub.`);
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/* ─────────────────────────────────────────
   PUBLIC API FUNCTIONS
───────────────────────────────────────── */

/**
 * Fetch a GitHub user's public profile.
 * @param {string} username
 * @returns {Promise<GitHubUser>}
 */
export async function getUser(username = GITHUB_USERNAME) {
  return githubFetch(`/users/${username}`);
}

/**
 * Fetch all public repositories for a user.
 * @param {string} username
 * @returns {Promise<GitHubRepo[]>}
 */
export async function getRepos(username = GITHUB_USERNAME) {
  return githubFetch(
    `/users/${username}/repos?sort=updated&per_page=100&type=public`
  );
}

/**
 * Fetch a single repository detail.
 * @param {string} username
 * @param {string} repoName
 * @returns {Promise<GitHubRepo>}
 */
export async function getRepo(username = GITHUB_USERNAME, repoName = "") {
  return githubFetch(`/repos/${username}/${repoName}`);
}

/**
 * Fetch raw README contents for a single repository.
 * Returns string content or null if no README exists.
 * @param {string} username
 * @param {string} repoName
 * @returns {Promise<string|null>}
 */
export async function getRepoReadme(username = GITHUB_USERNAME, repoName = "") {
  try {
    const res = await fetch(`${BASE_URL}/repos/${username}/${repoName}/readme`, {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Aggregate languages across repositories based on primary language per repo.
 * Optimized to use existing repo object data rather than making N+1 API calls.
 * @param {GitHubRepo[]} repos
 * @returns {Record<string, number>}
 */
export function getLanguages(repos = []) {
  if (!repos || repos.length === 0) return {};

  const totals = {};
  repos.forEach((r) => {
    if (r.language) {
      // Weight primary language by repo size or baseline score
      const weight = (r.size || 100) * 10;
      totals[r.language] = (totals[r.language] || 0) + weight;
    }
  });

  return totals;
}

/**
 * Fetch recent public activity events for a user.
 * @param {string} username
 * @returns {Promise<GitHubEvent[]>}
 */
export async function getRecentActivity(username = GITHUB_USERNAME) {
  return githubFetch(`/users/${username}/events/public?per_page=30`);
}
