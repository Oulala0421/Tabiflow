import { Client } from "@notionhq/client";
import { ItineraryItem, ItineraryType, NotionPage, AIProcessingStatus } from "@/types/notion";

// Validate environment variables at module load
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.error('[Notion] FATAL: NOTION_API_KEY is not defined in environment variables');
}

if (!DATABASE_ID) {
  console.error('[Notion] FATAL: NOTION_DATABASE_ID is not defined in environment variables');
}

// Helper to format details into summary
const formatDetailsToSummary = (
  baseSummary: string = "",
  transport?: any, // TransportInfo
  accommodation?: any // AccommodationInfo
): string => {
  let text = baseSummary;

  if (transport) {
    const parts = [];
    if (transport.mode) parts.push(`交通方式: ${transport.mode}`);
    if (transport.from) parts.push(`出發地: ${transport.from}`);
    if (parts.length > 0) text += (text ? "\n\n" : "") + "🚆 " + parts.join(" | ");
  }

  if (accommodation) {
    const parts = [];
    if (accommodation.checkIn) parts.push(`In: ${accommodation.checkIn}`);
    if (accommodation.checkOut) parts.push(`Out: ${accommodation.checkOut}`);
    if (accommodation.isBreakfastIncluded) parts.push("含早餐");
    if (accommodation.isDinnerIncluded) parts.push("含晚餐");
    if (accommodation.facilities && accommodation.facilities.length > 0) {
       parts.push(`設施: ${accommodation.facilities.join(", ")}`);
    }
    if (parts.length > 0) text += (text ? "\n\n" : "") + "🏨 " + parts.join(" | ");
  }

  return text;
};

// Helper: Parse Summary string back to Transport/Accommodation objects (Best Effort)
const parseSummaryToDetails = (summary: string) => {
    let transport: any = undefined;
    let accommodation: any = undefined;

    if (!summary) return { transport, accommodation };

    // Parse Transport
    if (summary.includes("🚆")) {
        const transportLine = summary.split('\n').find(l => l.includes("🚆"));
        if (transportLine) {
            const parts = transportLine.replace("🚆 ", "").split(" | ");
            transport = {};
            parts.forEach(p => {
                const [key, val] = p.split(": ");
                if (key === "交通方式") transport.mode = val;
                if (key === "出發地") transport.from = val;
            });
            // Defaults that might be lost, but 'from' and 'mode' are key
        }
    }

    // Parse Accommodation
    if (summary.includes("🏨")) {
        const stayLine = summary.split('\n').find(l => l.includes("🏨"));
        if (stayLine) {
            const parts = stayLine.replace("🏨 ", "").split(" | ");
            accommodation = { facilities: [] };
            parts.forEach(p => {
                if (p.startsWith("In: ")) accommodation.checkIn = p.replace("In: ", "");
                if (p.startsWith("Out: ")) accommodation.checkOut = p.replace("Out: ", "");
                if (p === "含早餐") accommodation.isBreakfastIncluded = true;
                if (p === "含晚餐") accommodation.isDinnerIncluded = true;
                if (p.startsWith("設施: ")) accommodation.facilities = p.replace("設施: ", "").split(", ");
            });
        }
    }

    return { transport, accommodation };
};

// Initialize Notion Client
const notion = new Client({
  auth: NOTION_API_KEY,
});


/**
 * Helper to determine the primary type icon/color based on Notion categories
 */
const mapCategoryToType = (categories: string[]): ItineraryType => {
  const lowerCats = categories.map((c) => c.toLowerCase());
  if (lowerCats.some((c) => c.includes("food") || c.includes("cafe") || c.includes("dinner"))) return "food";
  if (lowerCats.some((c) => c.includes("train") || c.includes("bus") || c.includes("transit"))) return "transport";
  if (lowerCats.some((c) => c.includes("shop") || c.includes("mall"))) return "shop";
  if (lowerCats.some((c) => c.includes("hotel") || c.includes("stay") || c.includes("accommodation"))) return "stay";
  return "activity"; // Default
};

/**
 * Fetch and transform itinerary data
 */
export const getItinerary = async (): Promise<ItineraryItem[]> => {
  if (!DATABASE_ID) {
    console.error("[Notion] NOTION_DATABASE_ID is not defined");
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "處理狀態",
        status: {
          does_not_equal: "Done",
        },
      },
      /* sorts: [
        {
          property: "Date",
          direction: "ascending",
        },
      ], */
    });

    const items = response.results.map((page: any) => {
      // DEBUG: Log key names for the first item to verify schema
      if (response.results.indexOf(page) === 0) {
           console.log("[Notion Schema Debug] Properties:", Object.keys(page.properties));
           // console.log(JSON.stringify(page.properties, null, 2)); 
      }
      
      // Cast the raw page to our partial NotionPage structure for safer access
      const typedPage = page as NotionPage;
      const props = typedPage.properties;

      // Extract Title
      const title = props["地點名稱"]?.title[0]?.plain_text || "Untitled";

      // Extract Date & Time
      const rawDate = props["日期 (Date)"]?.date?.start || new Date().toISOString();
      const dateObj = new Date(rawDate);
      const dateStr = rawDate.split("T")[0]; // YYYY-MM-DD
      const hasTime = rawDate.includes("T");
      const timeStr = hasTime 
        ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) 
        : "TBD";

      // Extract Area
      const area = props["區域 (Area)"]?.select?.name || "Unknown Area";

      // Extract Categories
      const categories = props["類別 (Type)"]?.multi_select?.map((c) => c.name) || [];
      const type = mapCategoryToType(categories);

      // Extract Summary
      const summary = props["AI 摘要"]?.rich_text?.map((t) => t.plain_text).join("") || "";

      // Extract Maps URL
      const mapsUrl = props["Google Maps"]?.url || null;

      // Extract URL (for AI processing)
      const url = props.URL?.url || null;

      // Extract AI Processing Status
      const aiProcessing = props["AI Processing"]?.select?.name || undefined;

      // Extract Cost
      const cost = props["預算 (Cost)"]?.number || 0;

      // Extract Cover Image
      let coverImage = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80"; // Fallback
      if (typedPage.cover) {
        if (typedPage.cover.type === "external") {
          coverImage = typedPage.cover.external?.url || coverImage;
        } else if (typedPage.cover.type === "file") {
          coverImage = typedPage.cover.file?.url || coverImage;
        }
      }

      // Map Status - Cast to specific union type defined in types/notion
      const rawStatus = props["處理狀態"]?.status?.name || "Inbox";
      const status = ["Inbox", "To Review", "Scheduled", "Done"].includes(rawStatus) 
        ? rawStatus 
        : "Inbox";

      return {
        id: typedPage.id,
        title,
        date: dateStr,
        time: timeStr,
        status,
        area,
        categories,
        type,
        mapsUrl,
        summary,
        coverImage,
        lastEdited: typedPage.last_edited_time,
        url,

        aiProcessing,
        cost,
      };
    });

    return items as ItineraryItem[];
  } catch (error) {
    console.error("[Notion] Failed to fetch itinerary:", error);
    return [];
  }
};

/**
 * Create a new page in Notion database
 */
export const createPage = async (data: {
  title: string;
  url?: string;
  date?: string;
  time?: string; // Added time
  area?: string;
  status?: string;
  aiProcessing?: AIProcessingStatus;
  categories?: string[];
  summary?: string;
  mapsUrl?: string;
  cost?: number;
  transport?: any;
  accommodation?: any;
}): Promise<string> => {
  if (!DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID is not defined");
  }

  try {
    const properties: any = {
      "地點名稱": {
        title: [
          {
            text: {
              content: data.title,
            },
          },
        ],
      },
      "處理狀態": {
        status: {
          name: data.status || "Inbox",
        },
      },
    };

    // Add optional fields
    if (data.date) {
      let startInfo: string = data.date;
      if (data.time && data.time !== "TBD" && data.time !== "待定") {
        startInfo = `${data.date}T${data.time}:00`;
      }
      
      properties["日期 (Date)"] = {
        date: {
          start: startInfo,
        },
      };
    }

    if (data.cost) {
      properties["預算 (Cost)"] = {
        number: data.cost,
      };
    }

    if (data.area) {
      properties["區域 (Area)"] = {
        select: {
          name: data.area,
        },
      };
    }

    if (data.url) {
      properties.URL = {
        url: data.url,
      };
    }

    if (data.aiProcessing) {
      properties["AI Processing"] = {
        select: {
          name: data.aiProcessing,
        },
      };
    }

    if (data.categories && data.categories.length > 0) {
      properties["類別 (Type)"] = {
        multi_select: data.categories.map((cat) => ({ name: cat })),
      };
    }

    if (data.summary || data.transport || data.accommodation) {
      const fullSummary = formatDetailsToSummary(data.summary, data.transport, data.accommodation);
      
      properties["AI 摘要"] = {
        rich_text: [
          {
            text: {
              content: fullSummary,
            },
          },
        ],
      };
    }

    if (data.mapsUrl) {
      properties["Google Maps"] = {
        url: data.mapsUrl,
      };
    }

    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties,
    });

    return response.id;
  } catch (error) {
    console.error("Failed to create Notion page:", error);
    throw error;
  }
};

/**
 * Update an existing page in Notion database
 */
export const updatePage = async (
  pageId: string,
  updates: {
    aiProcessing?: AIProcessingStatus;
    title?: string;
    area?: string;
    summary?: string;
    mapsUrl?: string;
    categories?: string[];
    status?: string;

    date?: string; // ISO string YYYY-MM-DD
    time?: string; // HH:mm
    cost?: number;
    transport?: any;
    accommodation?: any;
  }
): Promise<void> => {
  try {
    const properties: any = {};

    if (updates.aiProcessing) {
      properties["AI Processing"] = {
        select: {
          name: updates.aiProcessing,
        },
      };
    }

    if (updates.title) {
      properties["地點名稱"] = {
        title: [
          {
            text: {
              content: updates.title,
            },
          },
        ],
      };
    }

    if (updates.area) {
      properties["區域 (Area)"] = {
        select: {
          name: updates.area,
        },
      };
    }

    if (updates.summary !== undefined || updates.transport || updates.accommodation) {
      // NOTE: This overwrites existing summary. ideally we read then append, but for now we assume UI sends full state or we overwrite.
      // Since 'updates' might not have the old summary if we just moved a card, this is tricky.
      // BUT QuickCapture Edit sends the 'memo' (summary).
      // Let's assume valid data.
      
      const fullSummary = formatDetailsToSummary(updates.summary, updates.transport, updates.accommodation);

      properties["AI 摘要"] = {
        rich_text: [
          {
            text: {
              content: fullSummary,
            },
          },
        ],
      };
    }

    if (updates.mapsUrl) {
      properties["Google Maps"] = {
        url: updates.mapsUrl,
      };
    }

    if (updates.categories && updates.categories.length > 0) {
      properties["類別 (Type)"] = {
        multi_select: updates.categories.map((cat) => ({ name: cat })),
      };
    }

    if (updates.status) {
      properties["處理狀態"] = {
        status: {
          name: updates.status,
        },
      };
    }



    if (updates.date) {
      // Combine Date and Time if provided
      let startInfo: string = updates.date;
      if (updates.time && updates.time !== "TBD" && updates.time !== "待定") {
        startInfo = `${updates.date}T${updates.time}:00`;
      }

      properties["日期 (Date)"] = {
        date: {
          start: startInfo,
          // We can also infer time_zone if needed, usually Defaults to local
        },
      };
    }

    if (updates.cost !== undefined) {
      properties["預算 (Cost)"] = {
        number: updates.cost,
      };
    }

    await notion.pages.update({
      page_id: pageId,
      properties,
    });
  } catch (error) {
    console.error("Failed to update Notion page:", error);
    throw error;
  }
};

/**
 * Retrieve a single page by ID (for status checking)
 */
export const getPageById = async (pageId: string): Promise<NotionPage> => {
  try {
    const response = await notion.pages.retrieve({
      page_id: pageId,
    });
    return response as any as NotionPage;
  } catch (error) {
    console.error("Failed to retrieve Notion page:", error);
    throw error;
  }
};