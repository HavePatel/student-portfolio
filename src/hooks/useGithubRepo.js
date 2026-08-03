import { useState, useEffect, useCallback } from "react";
import { fetchRepo, fetchReadme, fetchRepoLanguages } from "../services/githubService";

const cache = new Map();

/**
 * useGithubRepo(username, repoName)
 * Fetches a single repo, its README, and language breakdown.
 */
export function useGithubRepo(username, repoName) {
  const [repo,      setRepo]      = useState(null);
  const [readme,    setReadme]    = useState(null);
  const [languages, setLanguages] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const cacheKey = `${username}/${repoName}`;

  const load = useCallback(async (force = false) => {
    if (!username || !repoName) return;

    if (!force && cache.has(cacheKey)) {
      const c = cache.get(cacheKey);
      setRepo(c.repo); setReadme(c.readme); setLanguages(c.languages);
      setLoading(false); setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [repoData, readmeData, langData] = await Promise.all([
        fetchRepo(username, repoName),
        fetchReadme(username, repoName),
        fetchRepoLanguages(username, repoName).catch(() => ({})),
      ]);

      cache.set(cacheKey, { repo: repoData, readme: readmeData, languages: langData });
      setRepo(repoData);
      setReadme(readmeData);
      setLanguages(langData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username, repoName, cacheKey]);

  useEffect(() => { load(); }, [load]);

  return { repo, readme, languages, loading, error, refetch: () => load(true) };
}
