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

export const analyzeContent = async (url: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined, returning fallback.");
    return fallbackResult(url);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
    You are a travel assistant. I will provide a URL.
    Please infer the travel details based on the structure of the URL or your knowledge base.
    
    URL: ${url}

    Task:
    1. Identify the specific place (Restaurant, Hotel, Attraction, etc).
    2. Provide a practical summary in Traditional Chinese (Taiwan) [繁體中文].
    3. Categorize it.
    4. If it's a Google Maps URL, extract coordinates or place ID if possible (symbolically), or just pass the URL back as mapsUrl.
    
    Return strictly JSON format:
    {
        "title": "Place Name (Traditional Chinese preferred)",
        "summary": "2-3 sentences practical tips",
        "area": "District Name (e.g. Shibuya, Kyoto)",
        "category": ["Food" | "Shop" | "Activity" | "Stay" | "Transport"],
        "mapsUrl": "${url}" 
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    const data = JSON.parse(jsonText);

    return {
      title: data.title || "Unknown Title",
      summary: data.summary || "",
      area: data.area || "Unknown Area",
      category: data.category || ["Activity"],
      mapsUrl: data.mapsUrl || url,
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return fallbackResult(url);
  }
};

const fallbackResult = (url: string): AnalysisResult => ({
  title: "New Item",
  summary: "Processed without AI details.",
  area: "Unknown",
  category: ["Activity"],
  mapsUrl: url,
});
