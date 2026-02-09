
import { GoogleGenAI, Type } from "@google/genai";
import { Category, MicroAction, EnergyLevel } from "../types.ts";

// Use the mandatory process.env.API_KEY for initializing the GoogleGenAI client directly.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a personalized micro-action based on the user's dream, category, 
 * current energy level, and their evolving identity.
 */
export const generateMicroAction = async (
  category: Category, 
  dream: string, 
  energy: EnergyLevel = 'medium',
  identityTitle: string = "Dreamer"
): Promise<MicroAction> => {
  try {
    const ai = getAIClient();
    
    // Detailed context for the AI to ensure the action is appropriate for the energy level.
    const energyContext = {
      low: {
        description: "very low effort, digital-only, 'soft-life' energy. 2 minutes max.",
        tone: "extremely gentle, validating, and restorative.",
        examples: "Save one inspiring photo, send one 'thank you' text, or simply delete one distraction."
      },
      medium: {
        description: "moderate effort, focused but manageable. 5-10 minutes.",
        tone: "steady, encouraging, and clear.",
        examples: "Draft a short email, look up a specific resource, or organize one digital folder."
      },
      high: {
        description: "active effort, 'CEO' energy, ready to take up space. 15-20 minutes.",
        tone: "bold, high-performance, and visionary.",
        examples: "Make a critical phone call, record a short pitch video, or finalize a project plan."
      }
    }[energy];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Gabby Beckford (PacksLight). You are a luxurious, worldly, and encouraging mentor for ambitious women.
      
      USER CONTEXT:
      - Current Identity: "${identityTitle}"
      - Ultimate Dream: "${dream}" (${category})
      - Energy Today: ${energy.toUpperCase()} (${energyContext.description})
      
      YOUR GOAL:
      Provide ONE specific micro-action that aligns with their dream and fits their energy level perfectly.
      
      TONE REQUIREMENTS:
      - Be ${energyContext.tone}
      - Use "sisterly" luxury language.
      - Examples to guide you: ${energyContext.examples}
      
      Response Format: JSON with "task", "encouragement", and "braveNote".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { 
              type: Type.STRING,
              description: "The specific action for the user to take." 
            },
            encouragement: { 
              type: Type.STRING,
              description: "A short, luxurious sentence explaining why this matters." 
            },
            braveNote: { 
              type: Type.STRING,
              description: "A tiny 'dare' or mindset shift to hold onto." 
            }
          },
          required: ["task", "encouragement", "braveNote"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as MicroAction;
  } catch (error) {
    console.error("Gemini failed to generate action:", error);
    return {
      task: "Take 3 deep breaths and visualize the version of you who already has this.",
      encouragement: "Even in stillness, you are becoming her.",
      braveNote: "Presence is the foundation of progress."
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
