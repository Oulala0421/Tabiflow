import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export interface AnalysisResult {
  title: string;
  summary: string;
  area: string;
  category: string[];
  mapsUrl: string | null;
}

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `
    You are a travel assistant. Analyze the following web content and extract key information for a travel itinerary.
    Return strictly JSON format.

    Required Fields:
    - title: specific place name (e.g. "Fuglen Tokyo", not the webpage title)
    - summary: 2-3 sentences in Traditional Chinese (Taiwan), practical tips for travelers.
    - area: The specific district (e.g. Shibuya, Shinjuku, Kyoto).
    - category: Array of strings (e.g. ["Food", "Cafe"], ["Transport"], ["Activity"]).
    - mapsUrl: Google Maps URL if found, otherwise null.

    Content:
    ${text.substring(0, 15000)} // Truncate to avoid context limit
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    const data = JSON.parse(jsonText);

    return {
      title: data.title || "Unknown Title",
      summary: data.summary || "No summary available.",
      area: data.area || "Unknown Area",
      category: data.category || ["General"],
      mapsUrl: data.mapsUrl || null,
    };
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("AI Analysis Failed");
  }
};
