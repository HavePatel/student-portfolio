import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import "../../styles/theme-toggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={20} strokeWidth={1.8} />
      ) : (
        <Moon size={20} strokeWidth={1.8} />
      )}
    </button>
  );
}

export default ThemeToggle;
