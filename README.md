# Cyber-Moksha: Ethics Over Fate

A high-fidelity, narrative-driven moral dilemma RPG that reimagines the ancient game of *Snakes & Ladders* through the lens of cyber-mythology and AI-powered ethical storytelling.

## 🌟 Production-Ready Optimizations

### 1. Zero-Latency Pre-fetching
The engine uses a background pre-fetching strategy. While you are observing the result of your current turn, the AI is already weaving the next dilemma. This results in **instantaneous** UI transitions when clicking "CHOOSE PATH."

### 2. High-Throughput Service Layer
The `GeminiMoralEngine` is implemented as a singleton service with a standardized backend format. It enforces strict JSON schemas and uses `thinkingBudget: 0` for real-time responsiveness.

### 3. Industry-Standard Security
- **Sanitized AI Interactions**: User inputs are sanitized to prevent prompt injection and malformed requests.
- **Environment Integrity**: API keys are strictly managed through environment variables.
- **State Protection**: Game state is persisted locally using standardized storage keys, protecting player progress without requiring invasive tracking.

### 4. Dynamic Energy Mechanics
Progression is gated by "Stamina," simulating the mental and spiritual effort required for moral decision-making. Virtuous paths demand more energy, creating a strategic tension between fast progression and ethical integrity.

---

## 🛠 Google Services & AI Models

- **`gemini-3-flash-preview`**: Core logic engine (dilemmas, evaluations, Gita correlation).
- **`gemini-2.5-flash-image`**: Visual synthesis engine for sacred geometry and Vedic-inspired scenes.

## 🚀 Deployment
This application is optimized for modern Vercel/Netlify deployments, leveraging client-side performance and secure API integration.