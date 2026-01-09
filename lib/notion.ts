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
        property: "Status",
        status: {
          does_not_equal: "Done",
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "ascending",
        },
      ],
    });

    const items = response.results.map((page: any) => {
      // Cast the raw page to our partial NotionPage structure for safer access
      const typedPage = page as NotionPage;
      const props = typedPage.properties;

      // Extract Title
      const title = props.Name.title[0]?.plain_text || "Untitled";

      // Extract Date & Time
      const rawDate = props.Date.date?.start || new Date().toISOString();
      const dateObj = new Date(rawDate);
      const dateStr = rawDate.split("T")[0]; // YYYY-MM-DD
      // Check if the ISO string implies a specific time (Notion usually omits time if "Include time" is off)
      const hasTime = rawDate.includes("T");
      const timeStr = hasTime 
        ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) 
        : "TBD";

      // Extract Area
      const area = props.Area.select?.name || "Unknown Area";

      // Extract Categories
      const categories = props.Category.multi_select.map((c) => c.name);
      const type = mapCategoryToType(categories);

      // Extract Summary
      const summary = props["AI Summary"].rich_text.map((t) => t.plain_text).join("") || "";

      // Extract Maps URL
      const mapsUrl = props["Maps URL"].url || null;

      // Extract URL (for AI processing)
      const url = props.URL?.url || null;

      // Extract AI Processing Status
      const aiProcessing = props["AI Processing"]?.select?.name as any || undefined;

      // Extract Cover Image
      let coverImage = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80"; // Fallback
      if (typedPage.cover) {
        if (typedPage.cover.type === "external") {
          coverImage = typedPage.cover.external?.url || coverImage;
        } else if (typedPage.cover.type === "file") {
          coverImage = typedPage.cover.file?.url || coverImage;
        }
      }

      // Map Status
      const status: any = props.Status.status?.name || "Inbox";

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
      };
    });

    return items;
  } catch (error) {
    console.error("Failed to fetch Notion itinerary:", error);
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
  area?: string;
  status?: string;
  aiProcessing?: AIProcessingStatus;
  categories?: string[];
  summary?: string;
  mapsUrl?: string;
}): Promise<string> => {
  if (!DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID is not defined");
  }

  try {
    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: data.title,
            },
          },
        ],
      },
      Status: {
        status: {
          name: data.status || "Inbox",
        },
      },
    };

    // Add optional fields
    if (data.date) {
      properties.Date = {
        date: {
          start: data.date,
        },
      };
    }

    if (data.area) {
      properties.Area = {
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
      properties.Category = {
        multi_select: data.categories.map((cat) => ({ name: cat })),
      };
    }

    if (data.summary) {
      properties["AI Summary"] = {
        rich_text: [
          {
            text: {
              content: data.summary,
            },
          },
        ],
      };
    }

    if (data.mapsUrl) {
      properties["Maps URL"] = {
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
      properties.Name = {
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
      properties.Area = {
        select: {
          name: updates.area,
        },
      };
    }

    if (updates.summary) {
      properties["AI Summary"] = {
        rich_text: [
          {
            text: {
              content: updates.summary,
            },
          },
        ],
      };
    }

    if (updates.mapsUrl) {
      properties["Maps URL"] = {
        url: updates.mapsUrl,
      };
    }

    if (updates.categories && updates.categories.length > 0) {
      properties.Category = {
        multi_select: updates.categories.map((cat) => ({ name: cat })),
      };
    }

    if (updates.status) {
      properties.Status = {
        status: {
          name: updates.status,
        },
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