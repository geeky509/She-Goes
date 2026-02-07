
import { GoogleGenAI, Type } from "@google/genai";
import { Category, MicroAction } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMicroAction = async (category: Category, dream: string): Promise<MicroAction> => {
  try {
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

    // The text property is used to get the content directly.
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
