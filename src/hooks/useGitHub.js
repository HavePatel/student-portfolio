import { useState, useEffect, useCallback } from "react";
import {
  getUser,
  getRepos,
  getLanguages,
  getRecentActivity,
  GITHUB_USERNAME,
} from "../services/githubApi";
import { calcStreaks } from "../utils/githubHelpers";

/* ============================================================
   IN-MEMORY CACHE MAP (keyed by username)
============================================================ */

const userCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isCacheValid(username) {
  const cached = userCache.get(username.toLowerCase());
  return Boolean(cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS);
}

function getCachedData(username) {
  return userCache.get(username.toLowerCase()) || null;
}

/* ============================================================
   HOOK
============================================================ */

/**
 * useGitHub(targetUsername)
 *
 * Returns GitHub profile & repository data along with loading, error, and refetch.
 *
 * @param {string} targetUsername
 */
export function useGitHub(targetUsername = GITHUB_USERNAME) {
  const username = targetUsername || GITHUB_USERNAME;
  const cached = getCachedData(username);

  const [user, setUser] = useState(() => cached?.user || null);
  const [repos, setRepos] = useState(() => cached?.repos || null);
  const [languages, setLanguages] = useState(() => cached?.languages || null);
  const [activity, setActivity] = useState(() => cached?.activity || null);
  const [streaks, setStreaks] = useState(() => cached?.streaks || null);
  const [loading, setLoading] = useState(() => !isCacheValid(username));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      if (isCacheValid(username) && reloadKey === 0) {
        const data = getCachedData(username);
        if (data && !isCancelled) {
          setUser(data.user);
          setRepos(data.repos);
          setLanguages(data.languages);
          setActivity(data.activity);
          setStreaks(data.streaks);
          setLoading(false);
          setError(null);
        }
        return;
      }

      if (!isCancelled) {
        setLoading(true);
        setError(null);
      }

      try {
        const [userData, reposData, activityData] = await Promise.all([
          getUser(username),
          getRepos(username),
          getRecentActivity(username).catch(() => []),
        ]);

        const langData = getLanguages(reposData);
        const streakData = calcStreaks(activityData);

        const cachePayload = {
          user: userData,
          repos: reposData,
          languages: langData,
          activity: activityData,
          streaks: streakData,
          fetchedAt: Date.now(),
        };
        userCache.set(username.toLowerCase(), cachePayload);

        if (!isCancelled) {
          setUser(userData);
          setRepos(reposData);
          setLanguages(langData);
          setActivity(activityData);
          setStreaks(streakData);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message ?? `Failed to load GitHub data for "${username}".`);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [username, reloadKey]);

  const refetch = useCallback(() => {
    userCache.delete(username.toLowerCase());
    setReloadKey((prev) => prev + 1);
  }, [username]);

  return {
    user,
    repos,
    languages,
    activity,
    streaks,
    loading,
    error,
    refetch,
  };
}
