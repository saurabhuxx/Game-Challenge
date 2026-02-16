
import { GoogleGenAI, Type } from "@google/genai";
import { Dilemma, KarmicEvaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDilemma(): Promise<Dilemma> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Generate a Cyber-Mythology moral dilemma for an Indian tech professional in 2026. Blend high-tech startup conflicts (AI ethics, startup funding, ghosting candidates) with relatable Indian contexts (Bangalore traffic, society WhatsApp groups, family expectations). Keep it 2 sentences. Scenario must feel modern and high-stakes.",
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
    contents: `Evaluate this player's response in Cyber-Moksha. 
    Dilemma: "${dilemma}"
    Player Choice: "${userInput}"
    
    Judge based on 'Dharma' (ethical duty) vs 'Artha' (pragmatic success). 
    - Selfless/Ethical: Karma +10, Movement +5.
    - Pragmatic/Neutral: Karma +2, Movement 0.
    - Selfish/Deceitful: Karma -10, Movement -5.
    
    Return one short judgment sentence.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          karma_score: { type: Type.NUMBER },
          board_movement: { type: Type.NUMBER }
        },
        required: ["feedback", "karma_score", "board_movement"]
      }
    }
  });
  return JSON.parse(response.text);
}
