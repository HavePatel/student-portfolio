/* ============================================================
   TECHNICAL BLOG DATA STORE
   Future-ready schema for engineering articles & AI insights.
============================================================ */

export const blogData = [
  {
    slug: "building-ambient-ai-scribes-with-whisper-and-llms",
    title: "Building Ambient AI Scribes: Combining Speech Recognition and LLMs for Clinical Documentation",
    excerpt: "A deep dive into low-latency WebSockets, Whisper ASR fine-tuning, and structured SOAP note extraction using modern LLM pipelines.",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-06-12",
    readTime: "7 min read",
    category: "AI & HealthTech",
    tags: ["Python", "FastAPI", "Whisper", "LLMs", "NLP", "WebSockets"],
    content: `
### Introduction

Clinical documentation is one of the most demanding administrative burdens in modern healthcare. Physicians spend hours dictating notes, updating Electronic Health Records (EHR), and transcribing patient visits. 

In this article, we explore how to build an **Ambient AI Scribe** that listens to real-time doctor-patient conversations, filters noise, transcribes audio using OpenAI's Whisper model, and extracts structured **SOAP Notes** (Subjective, Objective, Assessment, Plan).

---

### System Architecture Overview

Our architecture comprises three core decoupled layers:

1. **Audio Streaming Client**: Web Audio API capturing audio at 16kHz PCM and streaming chunks over secure WebSockets.
2. **ASR Ingestion Engine**: Python FastAPI microservice utilizing a GPU-accelerated Whisper pipeline for real-time transcription.
3. **Structured Extraction Pipeline**: LLM prompting framework with strict JSON schema enforcement for medical SOAP categorization.

\`\`\`python
# Example FastAPI WebSocket Ingestion Handler
from fastapi import FastAPI, WebSocket
import asyncio

app = FastAPI()

@app.websocket("/ws/audio-stream")
async def audio_stream_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_bytes()
            # Process PCM audio chunks asynchronously
            transcript_chunk = await process_audio_chunk(data)
            await websocket.send_json({"chunk": transcript_chunk})
    except Exception as e:
        await websocket.close()
\`\`\`

---

### Key Takeaways

- Streaming audio via WebSockets reduces latency by 40% compared to REST file uploads.
- Domain-specific prompt engineering ensures medical term accuracy without expensive full model retraining.
- PII/PHI de-identification must happen prior to sending data to third-party LLM APIs.
`
  },
  {
    slug: "demystifying-shap-values-in-financial-credit-scoring",
    title: "Demystifying SHAP Values: Achieving Explainable AI in Financial Risk Models",
    excerpt: "How to apply Game Theory and SHAP (SHapley Additive exPlanations) to turn black-box machine learning credit scores into interpretable audit trails.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    publishedAt: "2026-05-20",
    readTime: "5 min read",
    category: "Explainable AI",
    tags: ["Machine Learning", "Python", "SHAP", "FinTech", "XGBoost"],
    content: `
### The Explainability Imperative

When deploying Machine Learning models in credit scoring, high AUC-ROC scores are not enough. Financial regulations mandate that lenders provide applicants with clear, non-discriminatory reasons for loan rejections.

This is where **SHAP (SHapley Additive exPlanations)** comes in. Grounded in cooperative game theory, SHAP calculates the marginal contribution of each feature to the final prediction score.

---

### Calculating SHAP Values with TreeSHAP

\`\`\`python
import xgboost as xgb
import shap

# Train XGBoost risk model
model = xgb.XGBClassifier(n_estimators=100, max_depth=5)
model.fit(X_train, y_train)

# Compute TreeSHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Plot summary plot for top risk factors
shap.summary_plot(shap_values, X_test)
\`\`\`

---

### Conclusion

By embedding SHAP visualizations directly into loan officer dashboards, financial institutions can leverage high-capacity gradient boosted trees while maintaining complete regulatory transparency.
`
  }
];
