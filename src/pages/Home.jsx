import { Link } from "react-router-dom";
import { User, Code2, GraduationCap, Mail, ArrowRight } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Hero from "../components/sections/Hero";
import Container from "../components/ui/Container";

const quickLinks = [
  {
    title: "About Me",
    desc: "Background, degree at CHARUSAT, and core interests in AI/ML.",
    to: "/about",
    icon: <User size={24} />,
  },
  {
    title: "Skills",
    desc: "Frontend, backend, ML frameworks, and developer tools.",
    to: "/skills",
    icon: <Code2 size={24} />,
  },
  {
    title: "GitHub Explorer",
    desc: "Browse repositories, tech stack, and live activity for any GitHub user.",
    to: "/github",
    icon: <FaGithub size={24} />,
  },
  {
    title: "Education",
    desc: "B.Tech in Artificial Intelligence & Machine Learning at CHARUSAT.",
    to: "/education",
    icon: <GraduationCap size={24} />,
  },
  {
    title: "Get In Touch",
    desc: "Open for internships, research collaborations, and projects.",
    to: "/contact",
    icon: <Mail size={24} />,
  },
];

function Home() {
  return (
    <>
      <Hero />

      <section style={{ padding: "80px 0 120px", background: "var(--bg-alt)" }}>
        <Container>
          <div className="section-heading">
            <span>EXPLORE MY PORTFOLIO</span>
            <h2>What You Will Find Here</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  textDecoration: "none",
                  color: "inherit",
                  boxShadow: "0 6px 24px var(--card-shadow)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                }}
                className="home-card-hover"
              >
                <div style={{ color: "var(--tan)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {item.icon}
                  <ArrowRight size={18} />
                </div>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", margin: 0, color: "var(--heading)" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

export default Home;
