
import { GoogleGenAI, Type } from "@google/genai";
import { Dilemma, KarmicEvaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Array of themes to cycle through or pick from
const THEMES = ['Respect for Elders', 'Honesty in Money', 'Helping Strangers', 'Fairness to Workers', 'Kindness to Animals', 'Service to Community'];

export async function generateDilemma(): Promise<Dilemma> {
  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a very simple story for a game set in India.
    Theme: ${randomTheme}
    1. Use basic English that anyone can understand. No difficult words.
    2. Strictly NO tech or business words.
    3. The story must be 2 short sentences about a choice in daily life.
    4. Examples: Finding a lost wallet in a rickshaw, seeing someone drop their groceries, an old neighbor needing help with a heavy bag.
    5. The story should help the player learn about "${randomTheme}".
    6. SECURITY: Content must be safe, non-violent, and respectful.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          scenario: { type: Type.STRING, description: "A simple 2-sentence story about a choice." },
          context: { type: Type.STRING, description: "A short label like 'At the local market' or 'In a housing society'." }
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
    contents: `You are a kind and fair judge. 
    Story: "${dilemma}"
    Player's Answer: "${userInput}"
    
    Instructions:
    1. Explain the moral lesson of their choice in one very simple, encouraging sentence.
    2. Scoring:
       - Kind/Honest: +10 Points, +5 Steps.
       - Selfish/Lying: -10 Points, -5 Steps.
       - Neutral: +2 Points, 0 Steps.
    3. SAFETY: If the answer is rude, give 0 and ask for respect.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING, description: "A simple, encouraging moral lesson." },
          karma_score: { type: Type.NUMBER },
          board_movement: { type: Type.NUMBER }
        },
        required: ["feedback", "karma_score", "board_movement"]
      }
    }
  });
  return JSON.parse(response.text);
}
