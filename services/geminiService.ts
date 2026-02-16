import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Dilemma, KarmicEvaluation } from "../types";

/**
 * Standardized Gemini Service Architecture
 * Optimized for low-latency moral dilemma generation and Gita correlation.
 */
class GeminiMoralEngine {
  private ai: GoogleGenAI;
  private readonly MODEL_TEXT = 'gemini-3-flash-preview';
  private readonly MODEL_IMAGE = 'gemini-2.5-flash-image';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Generates a simple, human-centric moral dilemma.
   * Optimized for speed with 0 thinking budget and strict schema.
   */
  async generateDilemma(): Promise<Dilemma> {
    const themes = ['Respect', 'Honesty', 'Service'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    const response = await this.ai.models.generateContent({
      model: this.MODEL_TEXT,
      contents: `Generate a 2-sentence moral dilemma about ${randomTheme}. 
      Human-centric, no business jargon. Include a 1-word context label.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            scenario: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ["id", "scenario", "context"]
        }
      }
    });

    try {
      return JSON.parse(response.text);
    } catch (e) {
      console.error("Dilemma generation failed, using fallback.", e);
      return {
        id: "fallback",
        scenario: "You see someone drop their wallet. They are a stranger who was rude to you earlier. Do you return it?",
        context: "The Street"
      };
    }
  }

  /**
   * Evaluates a user's choice and correlates it with a Bhagavad Gita verse.
   */
  async evaluateChoice(dilemma: string, choice: string): Promise<KarmicEvaluation> {
    const response = await this.ai.models.generateContent({
      model: this.MODEL_TEXT,
      contents: `Evaluate this choice in context of the dilemma:
      Dilemma: "${dilemma}"
      Choice: "${choice}"
      
      Required:
      1. Feedback: Concise moral insight (1 sentence).
      2. Scoring: Based on Respect, Honesty, Service.
      3. Gita: Correlate with one specific English verse from Bhagavad Gita.
      4. Image: A prompt for a cinematic, hyper-realistic scene depicting the verse.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            karma_score: { type: Type.NUMBER },
            board_movement: { type: Type.NUMBER },
            pragmatism: { type: Type.NUMBER },
            empathy: { type: Type.NUMBER },
            chaos: { type: Type.NUMBER },
            gitaVerse: { type: Type.STRING },
            gitaCitation: { type: Type.STRING },
            gitaImagePrompt: { type: Type.STRING }
          },
          required: ["feedback", "karma_score", "board_movement", "pragmatism", "empathy", "chaos", "gitaVerse", "gitaCitation", "gitaImagePrompt"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  /**
   * Generates a hyper-realistic image for the Gita verse scene.
   */
  async generateVerseImage(scenePrompt: string): Promise<string> {
    const finalPrompt = `Hyper-realistic, cinematic, ethereal lighting, masterpiece digital art, epic Bhagavad Gita scene: ${scenePrompt}`;
    const response = await this.ai.models.generateContent({
      model: this.MODEL_IMAGE,
      contents: [{ parts: [{ text: finalPrompt }] }],
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Failed to manifest image.");
  }
}

export const moralEngine = new GeminiMoralEngine();

// Compatibility wrappers for existing code
export const generateDilemma = () => moralEngine.generateDilemma();
export const evaluateKarma = (d, c) => moralEngine.evaluateChoice(d, c);
export const generateGitaImage = (p) => moralEngine.generateVerseImage(p);
