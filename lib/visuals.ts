import { ItineraryType } from "@/types/notion";

// 1. Gradients Palette (Tailwind Classes)
export const GRADIENTS = [
  "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500",      // Sunset
  "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500",   // Ocean
  "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500",    // Nature
  "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600",   // Dusk
  "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-600",   // Cyberpunk
  "bg-gradient-to-br from-yellow-200 via-green-200 to-green-500",   // Fresh
  "bg-gradient-to-br from-rose-300 via-rose-400 to-rose-600",       // Rose
  "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600",      // Sky
  "bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500",  // Honey
  "bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600" // Berry
];

// 2. Emoji Mapping
const TYPE_EMOJIS: Record<ItineraryType, string[]> = {
  food: ["🍜", "🍣", "🍔", "☕", "🍺", "🍱", "🍰"],
  transport: ["🚆", "🚌", "🚕", "✈️", "🚶", "🚲"],
  stay: ["🏨", "🛏️", "🛁", "🏠"],
  activity: ["🎡", "⛩️", "🏞️", "🎭", "🖼️", "🎢"],
  shop: ["🛍️", "🎁", "🛒", "👗", "🏪"],
  manual: ["📝", "✨", "📌"],
  ai: ["🤖", "✨", "🧠"]
};

// 3. Fallback Emoji based on title keywords (Simple logic)
const KEYWORD_EMOJIS: Record<string, string> = {
  "咖啡": "☕",
  "拉麵": "🍜",
  "壽司": "🍣",
  "燒肉": "🥩",
  "飯店": "🏨",
  "機場": "✈️",
  "車站": "🚉",
  "公園": "🌳",
  "神社": "⛩️",
  "百貨": "🛍️",
  "迪士尼": "🏰",
  "飛機": "✈️",
  "航廈": "✈️",
  "成田": "✈️",
  "羽田": "✈️",
  "桃園": "✈️",
  "松山": "✈️"
};

const TRANSPORT_MODE_EMOJIS: Record<string, string> = {
  "飛機": "✈️",
  "電車": "🚆",
  "地鐵": "🚇",
  "新幹線": "🚄",
  "公車": "🚌",
  "巴士": "🚌",
  "計程車": "🚕",
  "步行": "🚶",
  "腳踏車": "🚲",
  "自駕": "🚗"
};

// Helper: DJB2 Hash function for deterministic randomness
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return Math.abs(hash);
}

export function getVisualForItem(id: string, type: ItineraryType, title: string, transportMode?: string) {
  // 1. Deterministic Hash
  const hash = hashString(id || title || "default");
  
  // 2. Select Gradient
  const gradientClass = GRADIENTS[hash % GRADIENTS.length];

  // 3. Select Emoji
  // Priority: Transport Mode > Keyword Match > Type Random > Default
  let emoji = "📍";
  
  // Try Transport Mode
  if (type === 'transport' && transportMode) {
      for (const [key, val] of Object.entries(TRANSPORT_MODE_EMOJIS)) {
          if (transportMode.includes(key)) {
              emoji = val;
              break;
          }
      }
  }

  // Try keywords (if not yet found by transport mode)
  if (emoji === "📍") {
      for (const [key, val] of Object.entries(KEYWORD_EMOJIS)) {
        if (title.includes(key)) {
          emoji = val;
          break;
        }
      }
  }

  // If still no match, use Type Random (deterministic)
  if (emoji === "📍") {
    const pool = TYPE_EMOJIS[type] || ["📍"];
    emoji = pool[hash % pool.length];
  }

  return {
    gradient: gradientClass,
    emoji: emoji
  };
}
