import Container from "../ui/Container";
import "../../styles/about.css";

import {
  GraduationCap,
  University,
  MapPin,
  BriefcaseBusiness,
} from "lucide-react";

function About() {
  return (
    <section className="about" id="about">

      <Container>

        <div className="section-heading">

          <span>ABOUT ME</span>

          <h2>Who Am I</h2>

        </div>

        <div className="about-content">

          {/* Left Side */}

          <div className="about-left">

            <h3>
              Building intelligent software with AI and modern web technologies.
            </h3>

            <p>
              I'm Have Patel, a B.Tech student in Artificial Intelligence &
              Machine Learning at CHARUSAT University.
            </p>

            <p>
              I enjoy creating AI-powered applications that solve real-world
              problems through machine learning, full-stack development, and
              thoughtful user experiences.
            </p>

            <p>
              My current interests include Generative AI, Digital Twins,
              Computer Vision, Intelligent Decision Systems, and modern web
              technologies.
            </p>

          </div>

          {/* Right Side */}

          <div className="about-right">

            <div className="about-card">

              <div className="about-item">
                <div className="about-title">
                  <GraduationCap size={22} strokeWidth={1.8} />
                  <h4>Degree</h4>
                </div>
                <p>B.Tech in AI & ML</p>
              </div>

              <div className="about-item">
                <div className="about-title">
                  <University size={22} strokeWidth={1.8} />
                  <h4>University</h4>
                </div>
                <p>CHARUSAT University</p>
              </div>

              <div className="about-item">
                <div className="about-title">
                  <MapPin size={22} strokeWidth={1.8} />
                  <h4>Location</h4>
                </div>
                <p>Ahmedabad, Gujarat</p>
              </div>

              <div className="about-item">
                <div className="about-title">
                  <BriefcaseBusiness size={22} strokeWidth={1.8} />
                  <h4>Status</h4>
                </div>
                <p>Open to Internship Opportunities</p>
              </div>

            </div>

          </div>

        </div>

      </Container>

    </section>
  );
}

export default About;