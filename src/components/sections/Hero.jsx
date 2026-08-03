import Container from "../ui/Container";
import Button from "../ui/Button";

import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaArrowDown,
} from "react-icons/fa";

import "../../styles/hero.css";

function Hero() {
  return (
    <section className="hero" id="home">
      <Container>
        <div className="hero-content">

          {/* ================= LEFT ================= */}

          <div className="hero-left">

            <span className="hero-tag">
              MY PORTFOLIO
            </span>

            <h1>Have Patel</h1>

            <h2>AI & ML Student</h2>

            <p className="hero-tech">
              AI • Machine Learning • Full Stack Developer
            </p>

            <p className="hero-description">
              Building AI-powered applications and solving
              real-world problems through modern technology.
              Passionate about creating intelligent software
              that combines AI, data, and scalable web
              development.
            </p>

            {/* Buttons */}

            <div className="hero-buttons">

              <Button to="/projects">
                View Projects
              </Button>

              <Button
                variant="outline"
                href="/resume/Have_Patel_Resume.pdf"
                download
              >
                Download Resume
              </Button>

            </div>

            {/* Social Icons */}

            <div className="hero-social">

              <a
                href="https://github.com/HavePatel"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>

              <a
                href="https://www.linkedin.com/in/have-patel-b01896258/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>

              <a
                href="mailto:have8134@gmail.com"
                aria-label="Email"
              >
                <FaEnvelope />
              </a>

            </div>

          </div>

          {/* ================= RIGHT ================= */}

          <div className="hero-right">

            <div className="hero-orbit">

              {/* Orbit Rings */}

              <div className="orbit-ring"></div>
              <div className="orbit-ring ring-2"></div>

              {/* Orbit Dots */}

              <span className="dot dot-1"></span>
              <span className="dot dot-2"></span>
              <span className="dot dot-3"></span>
              <span className="dot dot-4"></span>

              {/* Center Logo */}

{/* Center Logo */}

<div className="hero-circle">

  <div className="logo-mark">

    <span className="logo-h">H</span>

    <span className="logo-divider"></span>

    <span className="logo-p">P</span>

  </div>

</div>

            </div>

          </div>

        </div>
      </Container>

      {/* Scroll Indicator */}

      <div className="scroll-indicator">

        <span>Scroll</span>

        <FaArrowDown className="scroll-arrow" />

      </div>

    </section>
  );
}

export default Hero;