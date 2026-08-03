import { useState, useEffect } from "react";
import { getProjects, getProjectById } from "../services/projectsService";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    getProjects()
      .then((data) => {
        if (!isCancelled) {
          setProjects(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load projects.");
          setLoading(false);
        }
      });
    return () => { isCancelled = true; };
  }, []);

  return { projects, loading, error };
}

export function useProjectDetail(projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    if (!projectId) return;

    getProjectById(projectId)
      .then((data) => {
        if (!isCancelled) {
          setProject(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load project details.");
          setLoading(false);
        }
      });
    return () => { isCancelled = true; };
  }, [projectId]);

  return { project, loading, error };
}
