/* ============================================================
   RESEARCH & PUBLICATIONS DATA STORE
   Future-ready schema for academic papers, preprints & patents.
============================================================ */

export const researchData = [
  {
    id: "credit-scoring-alternative-data-2025",
    title: "Explainable Credit Risk Assessment via Multi-Modal Alternative Data Alignment",
    authors: ["Have Patel", "Dr. A. Sharma", "R. Mehta"],
    date: "2025-04-15",
    venue: "IEEE International Conference on Artificial Intelligence and Financial Technology (AIFT 2025)",
    status: "Peer-Reviewed Conference Paper",
    abstract:
      "Traditional credit scoring algorithms rely heavily on structured financial histories, excluding millions of unbanked individuals in developing economies. In this paper, we propose a novel multi-modal neural framework that aligns non-traditional telemetry data—including mobile usage metrics, agricultural output indicators, and digital transaction velocities—into an explainable latent credit risk space. Our approach achieves an 88.4% AUC-ROC score while maintaining strict SHAP feature transparency, outperforming benchmark logistic regression models by 14.2%.",
    keywords: ["Credit Risk", "Alternative Data", "Explainable AI", "SHAP", "Financial Inclusion"],
    doi: "https://doi.org/10.1109/AIFT.2025.1098234",
    pdfUrl: "/research/papers/credit_risk_assessment_2025.pdf",
    githubUrl: "https://github.com/HavePatel/bharatscore",
    slidesUrl: "/research/slides/credit_risk_aift2025.pdf",
    posterUrl: "/research/posters/credit_risk_poster.pdf",
    citation: {
      ieee: 'H. Patel, A. Sharma, and R. Mehta, "Explainable Credit Risk Assessment via Multi-Modal Alternative Data Alignment," in Proc. IEEE AIFT, 2025, pp. 112–119.',
      bibtex: `@inproceedings{patel2025explainable,
  author    = {Patel, Have and Sharma, A. and Mehta, R.},
  title     = {Explainable Credit Risk Assessment via Multi-Modal Alternative Data Alignment},
  booktitle = {IEEE International Conference on Artificial Intelligence and Financial Technology (AIFT)},
  year      = {2025},
  pages     = {112--119},
  doi       = {10.1109/AIFT.2025.1098234}
}`
    }
  },
  {
    id: "ambient-clinical-nlp-whisper-2025",
    title: "Domain-Specific Automatic Speech Recognition and SOAP Note Generation for Ambient Healthcare",
    authors: ["Have Patel", "K. Joshi"],
    date: "2025-02-10",
    venue: "ArXiv Preprint (arXiv:2502.04891 [cs.CL])",
    status: "Preprint",
    abstract:
      "Ambient clinical documentation relies on accurate automatic speech recognition (ASR) capable of parsing dense medical terminology amidst ambient noise. We fine-tune Whisper-Large-v3 on 120 hours of annotated doctor-patient dialogues and construct a constrained LLM decoder that transforms raw transcriptions into structured SOAP notes compliant with HL7 FHIR protocols. Experimental results demonstrate a 32% reduction in Word Error Rate (WER) on clinical terms and a 4.6/5 clinician satisfaction score.",
    keywords: ["Speech Recognition", "Clinical NLP", "SOAP Notes", "Whisper LLM", "HealthTech"],
    doi: "https://doi.org/10.48550/arXiv.2502.04891",
    pdfUrl: "/research/papers/ambient_clinical_nlp_2025.pdf",
    githubUrl: "https://github.com/HavePatel/clinicalscribe-ai",
    slidesUrl: null,
    posterUrl: null,
    citation: {
      ieee: 'H. Patel and K. Joshi, "Domain-Specific Automatic Speech Recognition and SOAP Note Generation for Ambient Healthcare," arXiv preprint arXiv:2502.04891, 2025.',
      bibtex: `@article{patel2025ambient,
  author    = {Patel, Have and Joshi, K.},
  title     = {Domain-Specific Automatic Speech Recognition and SOAP Note Generation for Ambient Healthcare},
  journal   = {arXiv preprint arXiv:2502.04891},
  year      = {2025}
}`
    }
  }
];
