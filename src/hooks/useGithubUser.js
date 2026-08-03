import { useState, useEffect, useCallback, useRef } from "react";
import { fetchUser } from "../services/githubService";

const cache = new Map();

/**
 * useGithubUser(username)
 * Fetches and caches a GitHub user profile.
 */
export function useGithubUser(username) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async (name, force = false) => {
    if (!name) return;

    if (!force && cache.has(name)) {
      setUser(cache.get(name));
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setUser(null);

    try {
      const data = await fetchUser(name);
      cache.set(name, data);
      setUser(data);
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

  return { user, loading, error, refetch: () => load(username, true) };
}
