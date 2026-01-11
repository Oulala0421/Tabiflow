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

export const analyzeContent = async (url: string, context?: string): Promise<AnalysisResult> => {
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
    You are a travel assistant. I will provide a URL${context ? " and its scraped content" : ""}.
    
    CRITICAL: If the Scraped Content contains messages like "JavaScript is disabled", "Enable JavaScript", or "Browser not supported", IGNORE the content completely and infer details solely from the URL and your knowledge base.

    URL: ${url}
    ${context ? `\n\nPage Content:\n${context.substring(0, 10000)}...` : ""}

    Task:
    1. Identify the specific place (Restaurant, Hotel, Attraction, etc).
    2. Provide a practical summary in Traditional Chinese (Taiwan) [繁體中文].
    3. Categorize it.
    4. If it's a Google Maps URL, extract coordinates or place ID if possible (symbolically), or just pass the URL back as mapsUrl.
    
    Return strictly JSON format:
    {
        "title": "Place Name (Traditional Chinese preferred)",
        "summary": "2-3 sentences practical tips. If URL is invalid or 'Test', return a generic message.",
        "area": "District Name (e.g. Shibuya, Kyoto)",
        "category": ["Food" | "Shop" | "Activity" | "Stay" | "Transport"],
        "mapsUrl": "${url}" 
    }
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    // Fix: Remove Markdown code blocks if present
    const cleanJson = jsonText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    // [Safety] Ensure category is always an array
    let safeCategories = ["Activity"];
    if (Array.isArray(data.category)) {
        safeCategories = data.category;
    } else if (typeof data.category === 'string') {
        safeCategories = [data.category];
    }

    return {
      title: data.title || "Unknown Title",
      summary: data.summary || "",
      area: data.area || "Unknown Area",
      category: safeCategories,
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
