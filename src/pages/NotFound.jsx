import { Link } from "react-router-dom";
import Container from "../components/ui/Container";

function NotFound() {
  return (
    <section className="not-found" style={{ padding: "160px 0", textAlign: "center", minHeight: "70vh" }}>
      <Container>
        <h1 style={{ fontSize: "4rem", marginBottom: "16px" }}>404</h1>
        <h2 style={{ fontSize: "2rem", marginBottom: "24px" }}>Page Not Found</h2>
        <p style={{ marginBottom: "32px", maxWdith: "500px", margin: "0 auto 32px" }}>
          The page or resource you are looking for does not exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </Container>
    </section>
  );
}

export default NotFound;