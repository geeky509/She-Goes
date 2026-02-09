
import { GoogleGenAI, Type } from "@google/genai";
import { Category, MicroAction, EnergyLevel } from "../types.ts";

// Use the mandatory process.env.API_KEY for initializing the GoogleGenAI client directly.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMicroAction = async (category: Category, dream: string, energy: EnergyLevel = 'medium'): Promise<MicroAction> => {
  try {
    const ai = getAIClient();
    const energyContext = {
      low: "very low effort, digital-only, 2 minutes max (e.g., Save one post, send one text).",
      medium: "moderate effort, 5-10 minutes (e.g., Draft an email, look up a specific price).",
      high: "active effort, 15 minutes (e.g., Make a phone call, organize one drawer, book a meeting)."
    }[energy];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Gabby Beckford (PacksLight). You are a luxurious, worldly, and encouraging mentor for ambitious women.
      The user is dreaming of: "${dream}" (${category}).
      Today, their energy level is ${energy.toUpperCase()}. 
      Provide ONE micro-action that is ${energyContext}.
      
      Requirements:
      - Framing: Brave, invitational, and specific.
      - Tone: Warm, sisterly, luxurious.
      - Response Format: JSON with "task", "encouragement", and "braveNote".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            encouragement: { type: Type.STRING },
            braveNote: { type: Type.STRING }
          },
          required: ["task", "encouragement", "braveNote"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as MicroAction;
  } catch (error) {
    console.error("Gemini failed:", error);
    return {
      task: "Sit in silence for 2 minutes and claim your dream as already yours.",
      encouragement: "The universe is already moving on your behalf.",
      braveNote: "Silence is a productive act."
    };
  }
};

export const generateLegacyReflection = async (dream: string, win: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `User dream: "${dream}". 
      User just completed a small action: "${win}".
      In one short, powerful, luxurious sentence (max 20 words), explain why this specific win is a structural shift in their identity, not just a task. 
      Framing: "This isn't just about [X]; it's the declaration that you are [Y]."`,
    });
    return response.text.trim();
  } catch (error) {
    return "This small step is the actual architecture of your future self.";
  }
};

export const generateIdentityEvolution = async (dream: string, wins: string[]): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user's ultimate dream is "${dream}". They have completed these wins: ${wins.join(", ")}.
      Suggest a 2-word "Identity Title" that reflects their growth (e.g., "Momentum Architect", "Worldly Visionary", "Brave Realist").
      Respond only with the title.`,
    });
    return response.text.trim();
  } catch (error) {
    return "Momentum Builder";
  }
};

export const generateDailyAffirmation = async (dream: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user is pursuing: "${dream}". 
      Write a luxury, sophisticated, one-sentence affirmation for today starting with "Today, she..." or "You are...".`,
    });
    return response.text.trim();
  } catch (error) {
    return "You are the authority of your own joy.";
  }
};
