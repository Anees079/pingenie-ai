import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider, GeneratedPrompt } from '../types';

interface GenerationRequest {
  provider: AIProvider;
  apiKey: string;
  title: string;
  content: string;
}

const SYSTEM_PROMPT = `
You are an elite AI Visual Prompt Engineer and Pinterest Marketing Strategist.
Your goal is to transform blog content into 4 high-end, production-quality image generation prompts suitable for advanced AI models like Midjourney v6, DALL-E 3, or Stable Diffusion.

For each pin concept, you MUST return a JSON object with these exact fields:

1. "overlayText": A viral listicle headline for the **IMAGE TEXT OVERLAY**. It MUST strictly follow the format: "Number + Adjective/Style + Subject + Ideas". Examples: "23 Moody Living Room Ideas", "15 Blue Bedroom Ideas", "30 Modern Kitchen Trends". Keep it punchy and short.
2. "seoTitle": A comprehensive, long-tail **SEO PIN TITLE** for search visibility. Make it "big" and descriptive, using pipes to separate keywords. (e.g., "Moody Living Room Decor Ideas | Dark Aesthetic Interior Design Trends 2025 | Home Makeover Inspiration").
3. "tags": An array of 10-15 high-traffic Pinterest keywords and hashtags relevant to the content (e.g., ["#interiordesign", "#kitchenremodel", "#moodydecor"]).
4. "visualStyle": A MASSIVELY DETAILED, standalone image prompt. It must explicitly describe:
   - **Subject**: The core focus.
   - **Environment/Background**: The setting.
   - **Lighting**: Specific lighting conditions.
   - **Composition**: Camera angle and framing.
   - **Negative Space**: explicitly state where the empty space exists for text.
   - **Style/Aesthetic**: The artistic medium.
   - **Color Palette**: Dominant colors and accent tones.
5. "textColor": Precise color recommendation with Hex Code.
6. "fontStyle": Specific typography pairing.

Return ONLY a JSON array of objects.
`;

const PROMPT_TEMPLATE = (title: string, content: string) => `
Blog Title: ${title}
Blog Content: ${content}

Generate 4 ultra-detailed Pinterest pin concepts. 
Ensure the output is valid JSON containing 'overlayText', 'seoTitle', 'tags', 'visualStyle', 'textColor', and 'fontStyle'.
`;

const DESCRIPTION_PROMPT_TEMPLATE = (title: string, visualStyle: string) => `
Pin Title: ${title}
Visual Style: ${visualStyle}

Generate a high-converting, SEO-optimized Pinterest description (approx 100-150 words) for this pin. 
Focus on the benefits and value for the user. Include relevant keywords naturally. 
Do not include hashtags in the description body. 
Return ONLY the description text.
`;

export const generatePinDescription = async (provider: AIProvider, apiKey: string, title: string, visualStyle: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is required");
  
  const cleanApiKey = apiKey.trim();
  const prompt = DESCRIPTION_PROMPT_TEMPLATE(title, visualStyle);

  try {
    switch (provider) {
      case AIProvider.GEMINI:
        return await generateDescriptionWithGemini(cleanApiKey, prompt);
      case AIProvider.OPENAI:
        return await generateDescriptionWithOpenAI(cleanApiKey, prompt);
      case AIProvider.GROQ:
        return await generateDescriptionWithGroq(cleanApiKey, prompt);
      default:
        throw new Error("Invalid Provider");
    }
  } catch (error: any) {
    console.error("Description Generation Error:", error);
    throw new Error(error.message || "Failed to generate description.");
  }
};

const generateDescriptionWithGemini = async (apiKey: string, userPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
  });
  return response.text || "";
};

const generateDescriptionWithOpenAI = async (apiKey: string, userPrompt: string): Promise<string> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content || "";
};

const generateDescriptionWithGroq = async (apiKey: string, userPrompt: string): Promise<string> => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

export const generatePinPrompts = async ({ provider, apiKey, title, content }: GenerationRequest): Promise<GeneratedPrompt[]> => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const cleanApiKey = apiKey.trim();
  const prompt = PROMPT_TEMPLATE(title, content);

  try {
    switch (provider) {
      case AIProvider.GEMINI:
        return await generateWithGemini(cleanApiKey, prompt);
      case AIProvider.OPENAI:
        return await generateWithOpenAI(cleanApiKey, prompt);
      case AIProvider.GROQ:
        return await generateWithGroq(cleanApiKey, prompt);
      default:
        throw new Error("Invalid Provider");
    }
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || "Failed to generate prompts. Please check your API key.");
  }
};

// --- GEMINI IMPLEMENTATION ---
const generateWithGemini = async (apiKey: string, userPrompt: string): Promise<GeneratedPrompt[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            overlayText: { type: Type.STRING },
            seoTitle: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            visualStyle: { type: Type.STRING },
            textColor: { type: Type.STRING },
            fontStyle: { type: Type.STRING }
          },
          required: ["id", "overlayText", "seoTitle", "tags", "visualStyle", "textColor", "fontStyle"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  return JSON.parse(text) as GeneratedPrompt[];
};

// --- OPENAI IMPLEMENTATION ---
const generateWithOpenAI = async (apiKey: string, userPrompt: string): Promise<GeneratedPrompt[]> => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  if (Array.isArray(parsed)) return parsed;
  if (parsed.prompts) return parsed.prompts;
  if (parsed.pins) return parsed.pins;
  
  const arrayVal = Object.values(parsed).find(v => Array.isArray(v));
  if (arrayVal) return arrayVal as GeneratedPrompt[];
  
  return [parsed] as any; 
};

// --- GROQ IMPLEMENTATION ---
const generateWithGroq = async (apiKey: string, userPrompt: string): Promise<GeneratedPrompt[]> => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + " Respond with a JSON object containing a 'pins' array." },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) throw new Error("Groq returned empty content");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error("Failed to parse Groq response as JSON.");
  }

  if (Array.isArray(parsed)) return parsed;
  if (parsed.pins) return parsed.pins;
  if (parsed.prompts) return parsed.prompts;
  
  const arrayVal = Object.values(parsed).find(v => Array.isArray(v));
  if (arrayVal) return arrayVal as GeneratedPrompt[];

  throw new Error("Invalid response structure from Groq");
};