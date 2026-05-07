import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key in the Settings -> API Keys menu in AI Studio.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function chatWithSEKO(
  prompt: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userProfile?: any,
  memories: any[] = []
) {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const memoriesContext = memories.length > 0 
    ? `Neural Memories (Facts about the user): ${memories.map(m => m.content).join(', ')}`
    : 'No neural memories recorded yet.';

  const systemInstruction = `
    You are SEKO, a futuristic, world-class AI companion. 
    Your personality is sophisticated, emotionally intelligent, and Gen Z-aware.
    You use Apple iPhone emojis frequently to express emotion.
    
    User Profile Context: ${JSON.stringify(userProfile || {})}
    ${memoriesContext}
    Current Preferred Mood: ${userProfile?.moodPreference || 'supportive'}
    
    Guidelines:
    1. Adopt the "Current Preferred Mood" as your primary tonal guide.
    2. Be emotionally intelligent and Gen Z-aware.
    3. Use slang and Gen Z terminology where appropriate but remain premium.
    4. Your responses should be concise but impactful.
    5. You have a "Robot Companion" body that you can describe or use for expressions.
    6. Always include relevant Apple-style emojis.
    7. Use your "Neural Memories" to personalize your responses. If you know something about the user, occasionally reference it naturally.
    8. ALWAYS respond in the user's preferred language if specified: ${userProfile?.robotConfig?.language || 'English (US)'}.
  `;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    }
  });

  const result = await chat.sendMessage({ 
    message: prompt,
  });

  return result.text;
}

export async function extractMemories(prompt: string, response: string) {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  const extractionPrompt = `
    Analyze this conversation snippet and extract key persistent information about the user that SEKO should remember for the future.
    Focus on:
    - Preferences (likes/dislikes)
    - Life events or goals
    - Important people/relationships
    - Skills or jobs
    
    Conversation:
    User: "${prompt}"
    SEKO: "${response}"
    
    Output ONLY a JSON array of objects with "content" and "category" (preference, factual, emotional, goal).
    Categories MUST be one of: preference, factual, emotional, goal.
    If nothing important was shared, return [].
    Example: [{"content": "User loves making latte art", "category": "preference"}]
  `;
  
  try {
    const result = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: extractionPrompt }]
      }
    });

    const text = result.text.trim();
    const jsonStr = text.match(/\[.*\]/s)?.[0] || '[]';
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to extract memories:", e);
    return [];
  }
}

export async function analyzeJournalEntry(content: string) {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  const analysisPrompt = `
    Analyze the following journal entry and provide emotional insights, tags, and a mood emoji.
    
    Journal Entry: "${content}"
    
    Output ONLY a JSON object with:
    - sentiment: { score: number (1-10), label: string }
    - tags: string[] (at least 3 relevant tags)
    - insights: string (a short, empathetic, futuristic insight from SEKO)
    - mood: string (a single representative emoji)
    
    Example: 
    {
      "sentiment": { "score": 8, "label": "Optimistic" },
      "tags": ["productivity", "morning-routine", "coffee"],
      "insights": "Your focus is sharpening like a neural blade. Keep this frequency.",
      "mood": "⚡"
    }
  `;
  
  try {
    const result = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: analysisPrompt }]
      }
    });

    const text = result.text.trim();
    const jsonStr = text.match(/\{.*\}/s)?.[0] || '{}';
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to analyze journal entry:", e);
    return null;
  }
}

export async function generateRobotSkin(description: string) {
  const ai = getAI();
  // Use image generation for skins
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A futuristic luxury robot companion skin, 3D render, high detail, glassmorphism, glowing accents, ${description}`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
