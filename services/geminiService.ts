import { GoogleGenAI, Type } from "@google/genai";
import { Dilemma, KarmicEvaluation } from "../types";

/**
 * GeminiMoralEngine - Optimized for maximum throughput and minimum latency.
 */
class GeminiMoralEngine {
  private static instance: GeminiMoralEngine;
  private ai: GoogleGenAI;
  
  private readonly TEXT_MODEL = 'gemini-3-flash-preview';
  private readonly IMAGE_MODEL = 'gemini-2.5-flash-image';

  private constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: API_KEY is missing.");
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
   * Generates a moral dilemma with zero-thinking overhead for speed.
   */
  async generateDilemma(): Promise<Dilemma> {
    const themes = ['Honesty', 'Compassion', 'Justice', 'Self-Sacrifice'];
    const theme = themes[Math.floor(Math.random() * themes.length)];

    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: `Create a 2-sentence moral dilemma about ${theme}. No fluff.`,
        config: {
          systemInstruction: "You are a fast-response game engine. Output valid JSON only.",
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

      return JSON.parse(response.text || '{}') as Dilemma;
    } catch (error) {
      console.error("Dilemma generation failed:", error);
      return {
        id: "fallback",
        scenario: "You see a mistake that benefits you but hurts the system. Report it?",
        context: "The Choice"
      };
    }
  }

  /**
   * Rapidly evaluates a choice and generates a cinematic image prompt.
   */
  async evaluateChoice(scenario: string, userChoice: string): Promise<KarmicEvaluation> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.TEXT_MODEL,
        contents: `Scenario: ${scenario}\nChoice: ${userChoice}`,
        config: {
          systemInstruction: "Analyze ethics and provide Gita correlation. Be concise. Output JSON.",
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

      return JSON.parse(response.text || '{}') as KarmicEvaluation;
    } catch (error) {
      console.error("Evaluation failed:", error);
      throw error;
    }
  }

  /**
   * Generates a high-quality visual for the sacred verse using the fastest available model.
   */
  async generateVerseImage(scenePrompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.IMAGE_MODEL,
        contents: [{ parts: [{ text: `Sacred Vedic art, cinematic glow, spiritual: ${scenePrompt}` }] }],
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";
    } catch (error) {
      console.error("Image generation failed:", error);
      return "";
    }
  }
}

export const moralEngine = GeminiMoralEngine.getInstance();
