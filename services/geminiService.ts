
import { GoogleGenAI, Type } from "@google/genai";
import { Category, MicroAction } from "../types.ts";

/**
 * Safely initializes the GoogleGenAI client.
 * Relying on process.env.API_KEY being injected into the window context.
 */
const getAIClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  return new GoogleGenAI({ apiKey });
};

export const generateMicroAction = async (category: Category, dream: string): Promise<MicroAction> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Gabby Beckford (PacksLight), a warm, encouraging travel and lifestyle creator. 
      The user's dream category is "${category}" and their specific dream is "${dream}".
      Provide ONE emotionally safe, very low-effort micro-action they can do TODAY to move 1% closer to this dream.
      Avoid hustle culture. Keep it joyful and gentle.
      Provide the response in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: {
              type: Type.STRING,
              description: "A short, actionable task (e.g., 'Look up one flight', 'Write down one reason you deserve this')."
            },
            encouragement: {
              type: Type.STRING,
              description: "A short, Gabby-style sentence of encouragement."
            }
          },
          required: ["task", "encouragement"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as MicroAction;
  } catch (error) {
    console.error("Gemini failed:", error);
    // Fallback actions if API fails
    return {
      task: "Take 3 deep breaths and visualize yourself already there.",
      encouragement: "You're exactly where you need to be today."
    };
  }
};
