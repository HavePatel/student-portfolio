/**
 * filterRepositories.js
 * Pure filter functions — no side effects.
 */

export const LANGUAGE_FILTERS = [
  { value: "all",               label: "All"              },
  { value: "JavaScript",        label: "JavaScript"       },
  { value: "TypeScript",        label: "TypeScript"       },
  { value: "Python",            label: "Python"           },
  { value: "Java",              label: "Java"             },
  { value: "C++",               label: "C++"              },
  { value: "HTML",              label: "HTML"             },
  { value: "CSS",               label: "CSS"              },
  { value: "Jupyter Notebook",  label: "Jupyter Notebook" },
  { value: "other",             label: "Other"            },
];

export const TYPE_FILTERS = [
  { value: "all",      label: "All"      },
  { value: "public",   label: "Public"   },
  { value: "forks",    label: "Forks"    },
  { value: "archived", label: "Archived" },
];

const KNOWN_LANGUAGES = new Set(
  LANGUAGE_FILTERS.filter((f) => f.value !== "all" && f.value !== "other").map((f) => f.value)
);

/**
 * @param {Array}  repos
 * @param {string} language — LANGUAGE_FILTERS value
 * @param {string} type     — TYPE_FILTERS value
 * @param {string} query    — free-text search
 */
export function filterRepositories(repos = [], language = "all", type = "all", query = "") {
  let result = repos;

  // Language filter
  if (language !== "all") {
    if (language === "other") {
      result = result.filter((r) => !KNOWN_LANGUAGES.has(r.language));
    } else {
      result = result.filter((r) => r.language === language);
    }
  }

  // Type filter
  if (type === "forks")    result = result.filter((r) => r.fork);
  if (type === "archived") result = result.filter((r) => r.archived);
  if (type === "public")   result = result.filter((r) => !r.fork && !r.archived);

  // Text search
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.topics ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }

  return result;
}
