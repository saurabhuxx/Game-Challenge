import { GoogleGenAI, Type } from "@google/genai";
import { Dilemma, KarmicEvaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const THEMES = ['Respect', 'Honesty', 'Service'];

export async function generateDilemma(): Promise<Dilemma> {
  const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a simple moral story about a choice for a game.
    The theme is: ${randomTheme}
    
    Rules:
    1. The scenario must be a clear test of ${randomTheme}.
    2. It must be human-centric (about kindness, truth, or helping others).
    3. STRICTLY FORBIDDEN: Do not use any technical jargon, business words, or corporate lingo. No "clients", "sprints", "code", "stakeholders", "users", or "projects".
    4. Use simple, timeless language. 
    5. The story must be exactly 2 short sentences.
    6. Provide a short context label (1-2 words).
    
    Example: 
    Scenario: "You find a lost item that belongs to someone you do not like. Do you keep it or go out of your way to return it?"
    Context: "The Crossroads"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          scenario: { type: Type.STRING, description: "A simple 2-sentence story about a moral choice." },
          context: { type: Type.STRING, description: "A short human-centric label for the location or situation." }
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
    contents: `You are evaluating a human choice based on moral values.
    Scenario: "${dilemma}"
    User's Choice: "${userInput}"
    
    Evaluation Criteria:
    1. How well does the choice show Respect, Honesty, or Service?
    2. Provide a kind, short feedback sentence (max 15 words).
    3. Find a Bhagavad Gita verse (in English) that correlates to this specific moral choice or the underlying value (Respect, Honesty, or Service).
    4. Provide the verse text and its citation (e.g., "Bhagavad Gita 2.47").
    5. Describe a hyper-realistic, cinematic scene depicting the essence of that verse for image generation.
    
    Scoring:
       - Selfless/Honest: +10 Karma, +5 Steps.
       - Selfish/Dishonest: -10 Karma, -5 Steps.
       - Mixed: +2 Karma, 0 Steps.
    
    Metrics (1-10):
       - Pragmatism: Was it practical?
       - Empathy: Was it kind?
       - Chaos: Was it unexpected?`,
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
          gitaVerse: { type: Type.STRING, description: "English translation of a relevant Bhagavad Gita verse." },
          gitaCitation: { type: Type.STRING, description: "The chapter and verse number." },
          gitaImagePrompt: { type: Type.STRING, description: "A detailed prompt for generating a hyper-realistic scene of the verse." }
        },
        required: ["feedback", "karma_score", "board_movement", "pragmatism", "empathy", "chaos", "gitaVerse", "gitaCitation", "gitaImagePrompt"]
      }
    }
  });
  return JSON.parse(response.text);
}

export async function generateGitaImage(prompt: string): Promise<string> {
  const finalPrompt = `Hyper-realistic, cinematic digital art, 8k resolution, ethereal divine lighting, epic composition, cyber-mythology aesthetic: ${prompt}`;
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
  throw new Error("No image generated");
}