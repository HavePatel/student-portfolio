import { Link } from "react-router-dom";

function Button({
  children,
  variant = "primary",
  to,
  href,
  download,
  onClick,
}) {
  if (to) {
    return (
      <Link
        to={to}
        className={`btn btn-${variant}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={`btn btn-${variant}`}
        download={download || undefined}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
