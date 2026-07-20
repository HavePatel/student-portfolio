function Header() {
  return (
    <header className="header">
      <nav className="navbar">
        <h2 className="logo">Have Patel</h2>

        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#skills">Skills</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <div className="hero">
        <h1>Hi, I'm Have Patel 👋</h1>
        <h2>AI/ML Student | Data Analyst | Full Stack Developer</h2>
        <p>
          Passionate about building AI-powered applications,
          analyzing data, and creating impactful digital experiences.
        </p>

        <button className="btn">
          Download Resume
        </button>
      </div>
    </header>
  );
}

export default Header;
