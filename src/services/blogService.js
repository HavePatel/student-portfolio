import { blogData } from "../data/blogData";

/**
 * Service layer abstraction for Technical Blog articles.
 * Easily replaceable with a CMS or backend API call.
 */
export async function getBlogPosts() {
  return Promise.resolve(blogData);
}

export async function getBlogPostBySlug(slug) {
  const post = blogData.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  return Promise.resolve(post || null);
}
