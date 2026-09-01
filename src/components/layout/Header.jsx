import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import Container from "../ui/Container";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import "../../styles/header.css";
import "../../styles/auth.css";

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

  const { isAuthenticated, user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    close();
    navigate("/login");
  };

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

          {/* ── Right: Auth state + theme toggle + hamburger ── */}
          <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {isAuthenticated ? (
              <div className="auth-user-badge" title={user?.email}>
                <UserIcon size={14} className="text-tan" />
                <span className="auth-user-email">{user?.email}</span>
                <button
                  type="button"
                  className="auth-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="auth-nav-buttons" style={{ display: "flex", gap: "0.5rem" }}>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                  style={{ fontSize: "0.85rem" }}
                  onClick={close}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
                  style={{ fontSize: "0.85rem" }}
                  onClick={close}
                >
                  Register
                </NavLink>
              </div>
            )}

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
          {isAuthenticated ? (
            <li style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text)" }}>{user?.email}</span>
                <button
                  type="button"
                  className="auth-submit-btn"
                  style={{ padding: "0.4rem 0.8rem", width: "auto", fontSize: "0.85rem" }}
                  onClick={handleLogout}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </li>
          ) : (
            <li style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", gap: "1rem", padding: "0 1rem" }}>
              <NavLink to="/login" className="auth-submit-btn" style={{ textDecoration: "none", textAlign: "center" }} onClick={close}>
                Login
              </NavLink>
              <NavLink to="/register" className="auth-submit-btn" style={{ textDecoration: "none", textAlign: "center", background: "var(--surface)" }} onClick={close}>
                Register
              </NavLink>
            </li>
          )}
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
