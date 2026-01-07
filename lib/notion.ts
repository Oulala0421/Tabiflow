import { Client } from "@notionhq/client";
import { ItineraryItem, ItineraryType, NotionPage } from "@/types/notion";

// Initialize Notion Client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

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
    console.error("NOTION_DATABASE_ID is not defined");
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
      const mapsUrl = props["Google Maps"].url || null;

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
      };
    });

    return items;
  } catch (error) {
    console.error("Failed to fetch Notion itinerary:", error);
    return [];
  }
};