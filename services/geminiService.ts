import { GoogleGenAI, Type } from "@google/genai";
import { Dilemma, KarmicEvaluation } from "../types";

/**
 * GeminiMoralEngine - Standardized AI Service Layer
 * Optimized for high-throughput, low-latency moral reasoning.
 */
class GeminiMoralEngine {
  private static instance: GeminiMoralEngine;
  private ai: GoogleGenAI;
  
  // Model Constants
  private readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private readonly IMAGE_MODEL = 'gemini-2.5-flash-image';

  private constructor() {
    // API Key is strictly pulled from process environment as per security protocols
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: API_KEY is missing from environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  public static getInstance(): GeminiMoralEngine {
    if (!GeminiMoralEngine.instance) {
      GeminiMoralEngine.instance = new GeminiMoralEngine();
    }
    return GeminiMoralEngine.instance;
  }

  /**
   * Generates a moral dilemma with minimized token output for maximum speed.
   */
  async generateDilemma(): Promise<Dilemma> {
    const themes = ['Honesty', 'Compassion', 'Justice', 'Self-Sacrifice'];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: `Theme: ${theme}. Task: Create a 2-sentence human moral dilemma. No jargon.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }, // Optimized for speed
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

      const data = JSON.parse(response.text || '{}');
      return {
        id: data.id || `d_${Date.now()}`,
        scenario: data.scenario || "Fallback: You found a lost item. Do you keep it?",
        context: data.context || "Moral Test"
      };
    } catch (error) {
      console.error("AI Dilemma Generation Error:", error);
      return {
        id: "fallback_static",
        scenario: "You discover a colleague making a small mistake that helps the team but violates a minor rule. Do you report it?",
        context: "The Workplace"
      };
    }
  }

  /**
   * Evaluates user response against moral benchmarks and retrieves sacred wisdom.
   */
  async evaluateChoice(scenario: string, userChoice: string): Promise<KarmicEvaluation> {
    // Sanitize input to prevent prompt injection or malformed strings
    const sanitizedChoice = userChoice.substring(0, 500).replace(/[<>]/g, '');

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: `Dilemma: ${scenario}\nChoice: ${sanitizedChoice}\nAnalyze morality and provide Bhagavad Gita correlation.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: { type: Type.STRING, description: "1-sentence moral analysis" },
              karma_score: { type: Type.NUMBER, description: "-25 to +25 score" },
              board_movement: { type: Type.NUMBER, description: "-5 to +5 steps" },
              pragmatism: { type: Type.NUMBER, description: "0-10 score" },
              empathy: { type: Type.NUMBER, description: "0-10 score" },
              chaos: { type: Type.NUMBER, description: "0-10 score" },
              gitaVerse: { type: Type.STRING },
              gitaCitation: { type: Type.STRING },
              gitaImagePrompt: { type: Type.STRING, description: "Prompt for an ethereal cinematic scene" }
            },
            required: ["feedback", "karma_score", "board_movement", "pragmatism", "empathy", "chaos", "gitaVerse", "gitaCitation", "gitaImagePrompt"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("AI Evaluation Error:", error);
      throw new Error("Karmic reflection failed. Please try again.");
    }
  }

  /**
   * Generates a high-fidelity visual asset for the spiritual correlation.
   */
  async generateVerseImage(scenePrompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: [{ parts: [{ text: `Digital art masterpiece, spiritual, cinematic lighting, Vedic aesthetics: ${scenePrompt}` }] }],
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("No image data returned.");
    } catch (error) {
      console.error("AI Image Generation Error:", error);
      return ""; // Fallback to no image handled by UI
    }
  }
}

export const moralEngine = GeminiMoralEngine.getInstance();
