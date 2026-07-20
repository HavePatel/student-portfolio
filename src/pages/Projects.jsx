import { useState } from "react";

function Projects() {
  const projects = [
    {
      id: 1,
      title: "Smart Buy Compare",
      category: "Web",
      description:
        "A price comparison website that helps users compare products from different platforms.",
      technologies: ["React", "Flask", "PostgreSQL"],
    },
    {
      id: 2,
      title: "ClinicalScribe AI",
      category: "AI",
      description:
        "An AI-powered medical documentation platform that generates clinical notes.",
      technologies: ["Next.js", "FastAPI", "Supabase"],
    },
    {
      id: 3,
      title: "EcoGuardian AI",
      category: "AI",
      description:
        "An environmental monitoring system using Artificial Intelligence.",
      technologies: ["React", "Python", "Machine Learning"],
    },
  ];

  // useState Hook
  const [showAIOnly, setShowAIOnly] = useState(false);

  const filteredProjects = showAIOnly
    ? projects.filter((project) => project.category === "AI")
    : projects;

  return (
    <section className="projects-page">
      <h1>My Projects</h1>

      <button
        className="filter-btn"
        onClick={() => setShowAIOnly(!showAIOnly)}
      >
        {showAIOnly ? "Show All Projects" : "Show AI Projects Only"}
      </button>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div className="project-card" key={project.id}>
            <h2>{project.title}</h2>

            <p>{project.description}</p>

            <div className="tech-list">
              {project.technologies.map((tech) => (
                <span className="tech-badge" key={tech}>
                  {tech}
                </span>
              ))}
            </div>

            <button className="details-btn">
              View Details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;