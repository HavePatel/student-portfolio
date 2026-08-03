/**
 * sortRepositories.js
 * Pure sort functions — no side effects.
 */

export const SORT_OPTIONS = [
  { value: "updated",   label: "Recently Updated" },
  { value: "created",   label: "Recently Created"  },
  { value: "stars",     label: "Most Stars"        },
  { value: "forks",     label: "Most Forks"        },
  { value: "alpha",     label: "Alphabetical"      },
];

/**
 * @param {Array}  repos
 * @param {string} by  — one of SORT_OPTIONS values
 */
export function sortRepositories(repos = [], by = "updated") {
  const copy = [...repos];
  switch (by) {
    case "stars":   return copy.sort((a, b) => b.stargazers_count - a.stargazers_count);
    case "forks":   return copy.sort((a, b) => b.forks_count - a.forks_count);
    case "alpha":   return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "created": return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case "updated":
    default:        return copy.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }
}
