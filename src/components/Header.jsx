function Header({ name, role }) {

  return (
    <header className="hero">
      <h4 className="portfolio-title">My Portfolio</h4>

      <h1>{name}</h1>

      <h3>{role}</h3>

      <p>
        AI | Machine Learning | Full Stack Developer
      </p>

    </header>
  );
}

export default Header;