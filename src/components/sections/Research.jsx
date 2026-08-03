import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Download, Copy, Check, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Container from "../ui/Container";
import { useResearch } from "../../hooks/useResearch";
import "../../styles/research.css";

function ResearchCard({ paper }) {
  const [copied, setCopied] = useState(false);

  const copyCitation = async () => {
    const text = paper.citation?.bibtex || paper.citation?.ieee || paper.title;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <article className="research-card">
      <div className="research-card__header">
        <span className="research-card__venue">{paper.status}</span>
        <span style={{ fontSize: "0.85rem", color: "var(--tan)", fontWeight: 600 }}>
          {paper.date}
        </span>
      </div>

      <h3 className="research-card__title">
        <Link to={`/research/${paper.id}`}>{paper.title}</Link>
      </h3>

      <p className="research-card__authors">
        {paper.authors.join(", ")} — <em>{paper.venue}</em>
      </p>

      <p className="research-card__abstract">{paper.abstract}</p>

      {paper.keywords && paper.keywords.length > 0 && (
        <div className="research-card__keywords">
          {paper.keywords.map((kw) => (
            <span key={kw} className="research-keyword">{kw}</span>
          ))}
        </div>
      )}

      <div className="research-card__actions">
        <Link to={`/research/${paper.id}`} className="research-btn">
          <BookOpen size={14} /> Paper Details
        </Link>

        {paper.pdfUrl && (
          <a href={paper.pdfUrl} download className="research-btn">
            <Download size={14} /> PDF
          </a>
        )}

        {paper.doi && (
          <a href={paper.doi} target="_blank" rel="noreferrer" className="research-btn">
            <ExternalLink size={14} /> DOI Link
          </a>
        )}

        {paper.githubUrl && (
          <a href={paper.githubUrl} target="_blank" rel="noreferrer" className="research-btn">
            <FaGithub size={14} /> Code
          </a>
        )}

        <button type="button" className="research-btn" onClick={copyCitation}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied Citation" : "Cite"}
        </button>
      </div>
    </article>
  );
}

function Research() {
  const { papers, loading } = useResearch();

  return (
    <section className="research" id="research">
      <Container>
        <div className="section-heading">
          <span>ACADEMIC & RESEARCH</span>
          <h2>Research & Publications</h2>
        </div>

        {loading ? (
          <div className="gh-loading">
            <span className="gh-spinner" />
            <p>Loading research publications…</p>
          </div>
        ) : (
          <div className="research-grid">
            {papers.map((paper) => (
              <ResearchCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export default Research;
