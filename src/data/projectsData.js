/* ============================================================
   PROJECTS DATA STORE
   Includes basic project cards and rich Case Study schemas.
============================================================ */

export const projectsData = [
  {
    id: "bharatscore",
    title: "BharatScore",
    category: "AI · FinTech",
    description:
      "An AI-powered credit scoring platform designed for rural and semi-urban India. Uses alternative data signals — mobile usage, agri patterns, and behavioural data — to generate reliable credit scores for the unbanked population.",
    tech: ["Python", "FastAPI", "React", "PostgreSQL", "Scikit-learn", "Supabase"],
    github: "https://github.com/HavePatel/bharatscore",
    demo: "https://bharatscore.demo.app",
    featured: true,
    accentColor: "#D2B48C",
    caseStudy: {
      tagline: "Alternative Data Credit Scoring for Unbanked Populations in Emerging Markets",
      problemStatement:
        "Over 190 million adults in India lack formal credit histories, making traditional bureau-based credit scoring (such as CIBIL) ineffective. Small business owners and farmers are systematically excluded from institutional credit or subjected to predatory lending interest rates.",
      motivation:
        "To bridge the financial inclusion gap by leveraging non-traditional digital footprints, agricultural output metrics, and transaction metadata to construct fair, explainable machine learning risk scores.",
      architecture: [
        "Ingestion Pipeline: Mobile telemetry, UPI transaction frequency, satellite crop health data (NDVI index).",
        "Feature Store: Encrypted feature engineering engine computing temporal stability and debt-to-income proxies.",
        "ML Inference Engine: Ensemble XGBoost & LightGBM model trained on synthetic & historical micro-loan performance.",
        "API Gateway: FastAPI REST endpoint delivering SHAP explainability attributes alongside credit risk tiers."
      ],
      systemDesign:
        "Microservices architecture with an asynchronous Celery task queue for satellite imagery feature processing, PostgreSQL cold storage, and Supabase real-time applicant status sync.",
      challenges: [
        "Extreme class imbalance in default training labels.",
        "Ensuring Model Fairness and preventing proxy discrimination across regional demographics.",
        "Model Explainability for non-technical loan officers."
      ],
      solutions: [
        "Applied Synthetic Minority Over-sampling Technique (SMOTE-NC) tailored for mixed continuous/categorical financial data.",
        "Integrated SHAP (SHapley Additive exPlanations) values directly into loan approval dashboards to provide human-interpretable decision factors."
      ],
      futureImprovements: [
        "On-device federated learning to preserve borrower privacy.",
        "Integration with Account Aggregator framework for automated bank statement consent retrieval."
      ],
      lessonsLearned:
        "Model accuracy is secondary to model explainability when deploying AI systems in highly regulated domains like consumer credit assessment."
    }
  },
  {
    id: "clinicalscribe",
    title: "ClinicalScribe AI",
    category: "AI · HealthTech",
    description:
      "Ambient clinical documentation tool that converts real-time doctor–patient conversations into structured SOAP notes using speech recognition and LLMs — reducing physician burnout and documentation overhead.",
    tech: ["Python", "OpenAI API", "React", "FastAPI", "Whisper"],
    github: "https://github.com/HavePatel/clinicalscribe-ai",
    demo: null,
    featured: true,
    accentColor: "#B8A99A",
    caseStudy: {
      tagline: "Ambient Voice Artificial Intelligence for Real-Time Medical SOAP Notes",
      problemStatement:
        "Physicians spend up to 2 hours on EHR documentation for every 1 hour of patient interaction, leading to record high levels of clinician burnout and compromised patient engagement during consultations.",
      motivation:
        "Automate clinical dictation and medical transcript extraction using state-of-the-art automatic speech recognition (ASR) and Domain-Tuned Large Language Models.",
      architecture: [
        "Audio Capture: Web Audio API streaming chunked 16kHz PCM audio over WebSockets.",
        "ASR Pipeline: Fine-tuned OpenAI Whisper model with custom medical vocabulary prompting.",
        "NLP Structuring: Prompt-engineered GPT-4o pipeline outputting structured SOAP (Subjective, Objective, Assessment, Plan) JSON.",
        "EHR Export: FHIR (Fast Healthcare Interoperability Resources) compliant payload generator."
      ],
      systemDesign:
        "Client-side audio buffering with low-latency WebSocket streaming server hosted on GPU-accelerated cloud instances.",
      challenges: [
        "Handling noisy clinical environments, overlapping dialogue, and diverse regional medical accents.",
        "Strict HIPAA/DISHA data privacy constraints requiring zero-retention data transmission."
      ],
      solutions: [
        "Implemented real-time noise suppression and speaker diarization to separate clinician voice from patient voice.",
        "Client-side encryption with automated PII/PHI de-identification before token transmission."
      ],
      futureImprovements: [
        "Edge model deployment using ONNX Runtime for offline clinic operation.",
        "Multi-modal input support incorporating handwritten lab result OCR."
      ],
      lessonsLearned:
        "Designing AI tools for medical professionals requires extreme emphasis on speed and low-friction workflow integration."
    }
  },
  {
    id: "smartbuy",
    title: "Smart Buy Compare",
    category: "AI · E-Commerce",
    description:
      "Intelligent product comparison engine that aggregates listings from multiple e-commerce sources, applies NLP-based feature extraction, and ranks products based on personalised user preference scores.",
    tech: ["Python", "Flask", "React", "NLP", "REST API", "TailwindCSS"],
    github: "https://github.com/HavePatel/smart-buy-compare",
    demo: null,
    featured: false,
    accentColor: "#C8B89A",
    caseStudy: null
  },
  {
    id: "smartparking",
    title: "Smart Parking AI",
    category: "Computer Vision · IoT",
    description:
      "Computer vision–based parking occupancy detection system using live CCTV feeds and YOLOv8 object detection. Real-time slot availability is served through a REST API to a web dashboard.",
    tech: ["Python", "OpenCV", "YOLOv8", "Flask", "React", "PostgreSQL"],
    github: "https://github.com/HavePatel/smart-parking-ai",
    demo: null,
    featured: false,
    accentColor: "#D4C4B0",
    caseStudy: null
  }
];
