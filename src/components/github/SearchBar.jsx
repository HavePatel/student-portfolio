import { useState } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar
 * Controlled search input that calls onSearch(value) via debounce,
 * and onSubmit(value) when the form is submitted / Enter is pressed.
 */
function SearchBar({
  defaultValue = "",
  placeholder  = "Search any GitHub username…",
  onSubmit,
  onSearch,
  autoFocus = false,
}) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e) => {
    setValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit?.(trimmed);
  };

  const clear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <form
      className="gh-searchbar"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search GitHub username"
    >
      <div className="gh-searchbar__inner">
        <Search className="gh-searchbar__icon" size={20} strokeWidth={1.8} aria-hidden="true" />

        <input
          type="search"
          className="gh-searchbar__input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          aria-label={placeholder}
        />

        {value && (
          <button
            type="button"
            className="gh-searchbar__clear"
            onClick={clear}
            aria-label="Clear search"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      <button type="submit" className="gh-searchbar__btn" aria-label="Search">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
