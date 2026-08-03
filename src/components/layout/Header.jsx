import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Container from "../ui/Container";
import ThemeToggle from "../ui/ThemeToggle";
import "../../styles/header.css";

const NAV_ITEMS = [
  { label: "Home",      to: "/"          },
  { label: "About",     to: "/about"     },
  { label: "Skills",    to: "/skills"    },
  { label: "GitHub",    to: "/github"    },
  { label: "Tasks",     to: "/tasks"     },
  { label: "Education", to: "/education" },
  { label: "Contact",   to: "/contact"   },
];

function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className={`header${scrolled ? " header--scrolled" : ""}`} role="banner">
      <Container>
        <div className="navbar">

          {/* ── Logo ──────────────────────────── */}
          <Link to="/" className="nav-logo" aria-label="Have Patel — home" onClick={close}>
            Have Patel
          </Link>

          {/* ── Desktop centre nav ────────────── */}
          <nav className="nav-centre" aria-label="Primary navigation">
            <ul className="nav-links" role="list">
              {NAV_ITEMS.map(({ label, to }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                    end={to === "/"}
                    onClick={close}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Right: theme toggle + hamburger ── */}
          <div className="nav-right">
            <ThemeToggle />
            <button
              className="nav-hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen
                ? <X    size={20} strokeWidth={2} aria-hidden="true" />
                : <Menu size={20} strokeWidth={2} aria-hidden="true" />
              }
            </button>
          </div>

        </div>
      </Container>

      {/* ── Mobile drawer ──────────────────── */}
      <nav
        id="mobile-menu"
        className={`nav-mobile${menuOpen ? " nav-mobile--open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ul role="list">
          {NAV_ITEMS.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `nav-mobile__link${isActive ? " nav-mobile__link--active" : ""}`}
                end={to === "/"}
                onClick={close}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="nav-backdrop"
          aria-hidden="true"
          onClick={close}
        />
      )}
    </header>
  );
}

export default Header;
