import { projectsData } from "../data/projectsData";

/**
 * Service layer abstraction for Projects & Case Studies.
 * Easily replaceable with a backend API (FastAPI / Express / Supabase) call.
 */
export async function getProjects() {
  // Simulating async network payload
  return Promise.resolve(projectsData);
}

export async function getProjectById(id) {
  const project = projectsData.find((p) => p.id.toLowerCase() === id.toLowerCase());
  return Promise.resolve(project || null);
}
