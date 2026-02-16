import { GoogleGenAI, Type } from "@google/genai";
import { Dilemma, KarmicEvaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const THEMES = ['Respect', 'Honesty', 'Service'];

export async function generateDilemma(): Promise<Dilemma> {
  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fast-generate a moral choice for a game.
    Theme: ${randomTheme}
    - 2 simple sentences max.
    - No corporate jargon.
    - Human-centric choice about truth, kindness, or helping.
    - Context: 1-2 words.`,
    config: {
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
  return JSON.parse(response.text);
}

export async function evaluateKarma(dilemma: string, userInput: string): Promise<KarmicEvaluation> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Evaluate this moral choice:
    Scenario: "${dilemma}"
    Choice: "${userInput}"
    
    Return:
    1. Feedback: Short kind sentence.
    2. Score: +10/-10 Karma, +5/-5 Steps.
    3. Gita: One relevant English verse, its Chapter.Verse citation, and a cinematic image prompt for the scene.
    4. Metrics: 1-10 for Pragmatism, Empathy, Chaos.`,
    config: {
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

export async function generateGitaImage(prompt: string): Promise<string> {
  const finalPrompt = `Hyper-realistic cinematic art, 8k, divine lighting, epic Gita scene: ${prompt}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: finalPrompt }] }],
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image error");
}