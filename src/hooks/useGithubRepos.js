import { useState, useEffect, useCallback, useRef } from "react";
import { fetchRepos } from "../services/githubService";

const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

/**
 * useGithubRepos(username)
 * Fetches and caches all public repos for a GitHub user.
 */
export function useGithubRepos(username) {
  const [repos,   setRepos]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async (name, force = false) => {
    if (!name) return;

    const cached = cache.get(name);
    if (!force && cached && Date.now() - cached.ts < TTL) {
      setRepos(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRepos(name);
      cache.set(name, { data, ts: Date.now() });
      setRepos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(username);
    return () => abortRef.current?.abort();
  }, [username, load]);

  return { repos, loading, error, refetch: () => load(username, true) };
}
