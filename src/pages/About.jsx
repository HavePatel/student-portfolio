function About() {
  return (
    <section className="about-page">
      <h1>About Me</h1>

      <div className="about-card">
        <h2>👋 Hello!</h2>

        <p>
          I'm <strong>Have Patel</strong>, a B.Tech student specializing in
          Artificial Intelligence and Machine Learning at CHARUSAT University.
        </p>

        <p>
          I enjoy building intelligent applications, modern websites, and
          solving real-world problems using AI and software development.
        </p>
      </div>

      <div className="about-grid">
        <div className="info-box">
          <h3>🎓 Education</h3>

          <p>
            B.Tech in Artificial Intelligence & Machine Learning
          </p>

          <p>CHARUSAT University</p>
        </div>

        <div className="info-box">
          <h3>💻 Technical Skills</h3>

          <ul>
            <li>Python</li>
            <li>React</li>
            <li>JavaScript</li>
            <li>Machine Learning</li>
            <li>SQL</li>
            <li>Git & GitHub</li>
          </ul>
        </div>

        <div className="info-box">
          <h3>🎯 Career Goal</h3>

          <p>
            To become an AI Engineer and Full Stack Developer while building
            innovative software that creates real-world impact.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;