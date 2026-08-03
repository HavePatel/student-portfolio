import { useState, useEffect } from "react";
import { getBlogPosts, getBlogPostBySlug } from "../services/blogService";

export function useBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    getBlogPosts()
      .then((data) => {
        if (!isCancelled) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load blog posts.");
          setLoading(false);
        }
      });
    return () => { isCancelled = true; };
  }, []);

  return { posts, loading, error };
}

export function useBlogPostDetail(slug) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    if (!slug) return;

    getBlogPostBySlug(slug)
      .then((data) => {
        if (!isCancelled) {
          setPost(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load blog post.");
          setLoading(false);
        }
      });
    return () => { isCancelled = true; };
  }, [slug]);

  return { post, loading, error };
}
