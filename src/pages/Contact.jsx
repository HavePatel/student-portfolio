import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="contact-page">

      <h1>Contact Me</h1>

      <form className="contact-form">

        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <textarea
          name="message"
          placeholder="Write your message..."
          rows="6"
          value={formData.message}
          onChange={handleChange}
        />

        <p className="char-count">
          Characters: {formData.message.length}
        </p>

        <button type="button">
          Send Message
        </button>

      </form>

      <div className="preview">

        <h2>Live Preview</h2>

        <p><strong>Name:</strong> {formData.name}</p>

        <p><strong>Email:</strong> {formData.email}</p>

        <p><strong>Message:</strong></p>

        <p>{formData.message}</p>

      </div>

    </section>
  );
}

export default Contact;