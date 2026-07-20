import { Link } from "react-router-dom";
import Skills from "../components/Skills";

function Home() {
  const skills = [
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "HTML",
    "CSS",
    "SQL",
    "Power BI",
    "Machine Learning",
    "Git & GitHub",
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <p className="portfolio-title">My Portfolio</p>

        <h1>Have Patel</h1>

        <h2>AI & ML Student</h2>

        <p className="hero-text">
          AI | Machine Learning | Full Stack Developer
        </p>

        <Link to="/projects" className="btn">
          View Projects
        </Link>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>About Me</h2>

        <p>
          Hello! I'm <strong>Have Patel</strong>, a B.Tech student
          specializing in Artificial Intelligence and Machine Learning at
          CHARUSAT University.
        </p>

        <p>
          I am passionate about Artificial Intelligence, Data Analytics,
          Full Stack Development, and creating innovative digital solutions.
        </p>

        <p>
          I enjoy building AI applications, analyzing data, and developing
          modern web applications that solve real-world problems.
        </p>
      </section>

      {/* Skills Section */}
      <Skills skillList={skills} />
    </>
  );
}

export default Home;