import { Link } from "react-router-dom";
import { ArrowUp, MapPin, Briefcase } from "lucide-react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import Container from "../ui/Container";
import "../../styles/footer.css";

/* ─────────────────────────────────────────
   DATA — only live routes
───────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Home",      to: "/"          },
  { label: "About",     to: "/about"     },
  { label: "Skills",    to: "/skills"    },
  { label: "GitHub",    to: "/github"    },
  { label: "Tasks",     to: "/tasks"     },
  { label: "Education", to: "/education" },
  { label: "Contact",   to: "/contact"   },
];

const SOCIALS = [
  {
    id:    "github",
    label: "GitHub",
    href:  "https://github.com/HavePatel",
    icon:  <FaGithub size={17} />,
  },
  {
    id:    "linkedin",
    label: "LinkedIn",
    href:  "https://www.linkedin.com/in/have-patel-b01896258/",
    icon:  <FaLinkedin size={17} />,
  },
  {
    id:    "email",
    label: "Email",
    href:  "mailto:have8134@gmail.com",
    icon:  <FaEnvelope size={17} />,
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <Container>

        {/* ── Three-column body ─────────────────── */}
        <div className="footer-body">

          {/* Col 1 — Branding */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="Have Patel — home">
              Have Patel
            </Link>
            <p className="footer-role">
              AI &amp; ML Student<br />Full Stack Developer
            </p>
            <p className="footer-bio">
              Building intelligent software with AI,&nbsp;
              Machine Learning and Full Stack Development.
            </p>
          </div>

          {/* Col 2 — Navigation */}
          <nav className="footer-nav" aria-label="Footer navigation">
            <h3 className="footer-col-title">Navigation</h3>
            <ul role="list">
              {NAV_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="footer-nav-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3 — Connect */}
          <div className="footer-connect">
            <h3 className="footer-col-title">Connect</h3>

            <ul className="footer-social-list" role="list">
              {SOCIALS.map(({ id, label, href, icon }) => (
                <li key={id}>
                  <a
                    href={href}
                    className="footer-social-row"
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noreferrer"
                    aria-label={label}
                  >
                    <span className="footer-social-icon" aria-hidden="true">
                      {icon}
                    </span>
                    <span className="footer-social-label">{label}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="footer-location">
              <span className="footer-location-row">
                <MapPin size={14} strokeWidth={1.8} aria-hidden="true" />
                Ahmedabad, Gujarat
              </span>
              <span className="footer-location-row footer-location-row--highlight">
                <Briefcase size={14} strokeWidth={1.8} aria-hidden="true" />
                Open to Internship Opportunities
              </span>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ────────────────────────── */}
        <div className="footer-bottom">
          <p className="footer-bottom-left">
            © {year} Have Patel &nbsp;·&nbsp; Built with React&nbsp;+&nbsp;Vite
          </p>

          <p className="footer-bottom-center">
            Designed &amp; Developed by Have Patel
          </p>

          <button
            type="button"
            className="footer-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
          >
            <ArrowUp size={14} strokeWidth={2.5} aria-hidden="true" />
            Back to Top
          </button>
        </div>

      </Container>
    </footer>
  );
}

export default Footer;
