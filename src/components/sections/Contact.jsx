import { useState } from "react";
import {
  Mail,
  FileDown,
  Send,
  MapPin,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Container from "../ui/Container";
import "../../styles/contact.css";

/* ─────────────────────────────────────────
   SOCIAL / INFO DATA
───────────────────────────────────────── */

const contactLinks = [
  {
    id: "github",
    label: "GitHub",
    value: "github.com/HavePatel",
    href: "https://github.com/HavePatel",
    icon: <FaGithub size={20} />,
    external: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/have-patel-b01896258/",
    href: "https://www.linkedin.com/in/have-patel-b01896258/",
    icon: <FaLinkedin size={20} />,
    external: true,
  },
  {
    id: "email",
    label: "Email",
    value: "have8134@gmail.com",
    href: "mailto:have8134@gmail.com",
    icon: <Mail size={20} strokeWidth={1.8} />,
    external: false,
  },
  {
    id: "location",
    label: "Location",
    value: "Ahmedabad, Gujarat",
    href: null,
    icon: <MapPin size={20} strokeWidth={1.8} />,
    external: false,
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    /* Wire up your preferred email service (EmailJS, Formspree, etc.) here */
    setSubmitted(true);
  };

  return (
    <section className="contact" id="contact">
      <Container>

        {/* TITLE */}
        <div className="section-heading">
          <span>CONTACT</span>
          <h2>Get In Touch</h2>
        </div>

        <div className="contact-layout">

          {/* ── LEFT: info + links ── */}
          <div className="contact-info">

            <p className="contact-intro">
              I am open to internship opportunities, research collaborations,
              and interesting projects. Feel free to reach out — I typically
              respond within 24 hours.
            </p>

            {/* Link list */}
            <ul className="contact-links" role="list">
              {contactLinks.map(({ id, label, value, href, icon, external }) => (
                <li key={id} className="contact-link-item">
                  <span className="contact-link-icon">{icon}</span>
                  <div className="contact-link-text">
                    <span className="contact-link-label">{label}</span>
                    {href ? (
                      <a
                        href={href}
                        className="contact-link-value"
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="contact-link-value">{value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Resume download */}
            <a
              href="/resume/Have_Patel_Resume.pdf"
              download
              className="contact-resume-btn"
              aria-label="Download Resume"
            >
              <FileDown size={18} strokeWidth={1.8} />
              Download Resume
            </a>

          </div>

          {/* ── RIGHT: form ── */}
          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success" role="status" aria-live="polite">
                <div className="contact-success-icon">
                  <Send size={28} strokeWidth={1.5} />
                </div>
                <h3>Message Sent</h3>
                <p>Thanks for reaching out. I will get back to you soon.</p>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-name">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Have Patel"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hello@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Internship Opportunity"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me about the opportunity or project..."
                    rows={6}
                    required
                  />
                </div>

                <button type="submit" className="contact-submit">
                  <Send size={16} strokeWidth={1.8} />
                  Send Message
                </button>
              </form>
            )}
          </div>

        </div>

      </Container>
    </section>
  );
}

export default Contact;
