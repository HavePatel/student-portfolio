import { GraduationCap, CalendarDays, MapPin } from "lucide-react";
import Container from "../ui/Container";
import "../../styles/education.css";

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */

const educationItems = [
  {
    id: "charusat",
    degree: "B.Tech — Artificial Intelligence & Machine Learning",
    institution: "CHARUSAT University",
    location: "Anand, Gujarat",
    period: "2024 — Present",
    description:
      "Specialising in machine learning, deep learning, computer vision, and full-stack AI application development. Active participant in research projects, hackathons, and industry collaboration programmes.",
    highlights: [
      "Machine Learning & Deep Learning",
      "Computer Vision",
      "Natural Language Processing",
      "Full-Stack Development",
      "Data Structures & Algorithms",
    ],
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

function Education() {
  return (
    <section className="education" id="education">
      <Container>

        {/* TITLE */}
        <div className="section-heading">
          <span>EDUCATION</span>
          <h2>Academic Background</h2>
        </div>

        {/* TIMELINE */}
        <div className="timeline">
          {educationItems.map((item) => (
            <div className="timeline-item" key={item.id}>

              {/* Spine */}
              <div className="timeline-spine">
                <div className="timeline-dot">
                  <GraduationCap size={18} strokeWidth={1.8} />
                </div>
                <div className="timeline-line" />
              </div>

              {/* Card */}
              <div className="timeline-card">

                <div className="timeline-meta">
                  <span className="timeline-period">
                    <CalendarDays size={14} strokeWidth={1.8} />
                    {item.period}
                  </span>
                  <span className="timeline-location">
                    <MapPin size={14} strokeWidth={1.8} />
                    {item.location}
                  </span>
                </div>

                <h3 className="timeline-title">{item.degree}</h3>
                <p className="timeline-institution">{item.institution}</p>
                <p className="timeline-desc">{item.description}</p>

                <div className="timeline-highlights">
                  {item.highlights.map((h) => (
                    <span className="timeline-tag" key={h}>{h}</span>
                  ))}
                </div>

              </div>

            </div>
          ))}
        </div>

      </Container>
    </section>
  );
}

export default Education;
