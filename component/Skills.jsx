function Skills() {
  const skills = [
    "Python",
    "SQL",
    "Power BI",
    "Excel",
    "Machine Learning",
    "Data Analysis",
    "Flask",
    "React",
    "Next.js",
    "JavaScript",
    "HTML",
    "CSS",
    "Git & GitHub",
    "Supabase",
    "PostgreSQL",
    "LangChain"
  ];

  return (
    <section id="skills" className="skills">
      <h2>Skills</h2>

      <div className="skills-container">
        {skills.map((skill, index) => (
          <div key={index} className="skill-card">
            {skill}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;

