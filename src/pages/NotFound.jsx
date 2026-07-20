import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="notfound-page">
      <h1>404</h1>

      <h2>Oops! Page Not Found</h2>

      <p>
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link to="/" className="btn">
        Back to Home
      </Link>
    </section>
  );
}

export default NotFound;