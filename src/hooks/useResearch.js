import { useState, useEffect } from "react";
import { getResearchPapers, getResearchPaperById } from "../services/researchService";

export function useResearch() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    getResearchPapers()
      .then((data) => {
        if (!isCancelled) {
          setPapers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load research papers.");
          setLoading(false);
        }
      });
    return () => { isCancelled = true; };
  }, []);

  return { papers, loading, error };
}

export function useResearchDetail(paperId) {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    if (!paperId) return;

    getResearchPaperById(paperId)
      .then((data) => {
        if (!isCancelled) {
          setPaper(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load research paper details.");
          setLoading(false);
        }
      });
    return () => { isCancelled = true; };
  }, [paperId]);

  return { paper, loading, error };
}
