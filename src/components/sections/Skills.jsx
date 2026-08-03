import Container from "../ui/Container";
import { Monitor, Server, BrainCircuit, Database, Wrench } from "lucide-react";
import "../../styles/skills.css";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */

const skillCategories = [
  {
    id: "frontend",
    label: "Frontend",
    icon: <Monitor size={24} strokeWidth={1.8} />,
    skills: ["HTML5", "CSS3", "JavaScript", "React", "Next.js", "Tailwind CSS"],
  },
  {
    id: "backend",
    label: "Backend",
    icon: <Server size={24} strokeWidth={1.8} />,
    skills: ["Python", "Flask", "FastAPI", "REST API"],
  },
  {
    id: "ai-ml",
    label: "AI & Machine Learning",
    icon: <BrainCircuit size={24} strokeWidth={1.8} />,
    skills: [
      "TensorFlow",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "OpenCV",
      "LangChain",
      "Gemini API",
      "OpenAI API",
    ],
  },
  {
    id: "database",
    label: "Database & Cloud",
    icon: <Database size={24} strokeWidth={1.8} />,
    skills: ["PostgreSQL", "Supabase", "Vercel", "Render"],
  },
  {
    id: "tools",
    label: "Tools",
    icon: <Wrench size={24} strokeWidth={1.8} />,
    skills: ["Git", "GitHub", "VS Code", "Figma", "Docker"],
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

function Skills() {
  return (
    <section className="skills" id="skills">
      <Container>

        {/* TITLE */}
        <div className="section-heading">
          <span>SKILLS</span>
          <h2>Technologies I Work With</h2>
        </div>

        {/* GRID */}
        <div className="skills-grid">
          {skillCategories.map((category) => (
            <div className="skill-card" key={category.id}>

              {/* Card Header */}
              <div className="skill-card__header">
                <span className="skill-card__icon">{category.icon}</span>
                <h3 className="skill-card__title">{category.label}</h3>
              </div>

              {/* Divider */}
              <div className="skill-card__divider" />

              {/* Badges */}
              <div className="skill-badges">
                {category.skills.map((skill) => (
                  <span className="skill-badge" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

            </div>
          ))}
        </div>

      </Container>
    </section>
  );
}

export default Skills;
