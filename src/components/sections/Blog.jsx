import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import { useBlog } from "../../hooks/useBlog";
import "../../styles/blog.css";

function Blog() {
  const { posts, loading } = useBlog();

  return (
    <section className="blog" id="blog">
      <Container>
        <div className="section-heading">
          <span>TECHNICAL BLOG</span>
          <h2>Articles & Engineering Insights</h2>
        </div>

        {loading ? (
          <div className="gh-loading">
            <span className="gh-spinner" />
            <p>Loading articles…</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="blog-card__cover"
                    loading="lazy"
                  />
                )}
                <div className="blog-card__body">
                  <div className="blog-card__meta">
                    <span>{post.category}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="blog-card__title">{post.title}</h3>

                  <p className="blog-card__excerpt">{post.excerpt}</p>

                  <div className="blog-card__tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>

                  <div style={{ color: "var(--tan)", fontSize: "0.85rem", fontWeight: 600, marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    Read Article <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export default Blog;
