function Skills({ skillList }) {
  return (
    <section className="skills">
      <h2>Skills</h2>

      <div className="skill-grid">
        {skillList.map((skill) => (
          <div className="card" key={skill}>
            {skill}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;