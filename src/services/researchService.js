import { researchData } from "../data/researchData";

/**
 * Service layer abstraction for Research Papers & Publications.
 * Easily replaceable with a backend API call.
 */
export async function getResearchPapers() {
  return Promise.resolve(researchData);
}

export async function getResearchPaperById(id) {
  const paper = researchData.find((p) => p.id.toLowerCase() === id.toLowerCase());
  return Promise.resolve(paper || null);
}
