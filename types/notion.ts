export type ItineraryStatus = "Inbox" | "To Review" | "Scheduled" | "Done";
export type ItineraryType = "food" | "transport" | "activity" | "shop" | "stay" | "manual" | "ai";
export type AIProcessingStatus = "Pending" | "Processing" | "Done" | "Error";

export interface TransportInfo {
  mode?: string;
  from?: string;
  to?: string;
  platform?: string;
  car?: string;
  seat?: string;
  duration?: string;
}

export interface AccommodationInfo {
  checkIn?: string;
  checkOut?: string;
  isBreakfastIncluded?: boolean;
  isDinnerIncluded?: boolean;
  facilities?: string[];
}

// The clean, flattened interface for our UI
export interface ItineraryItem {
  id: string;
  title: string;
  date: string; // ISO Date String (YYYY-MM-DD)
  time: string; // Extracted time (HH:mm) or "TBD"
  status: ItineraryStatus;
  area: string;
  categories: string[];
  type: ItineraryType; // Derived from the first category or mapped
  mapsUrl: string | null;
  summary: string; // Markdown supported
  coverImage: string;
  lastEdited: string;
  url?: string | null; // Original URL for AI processing
  aiProcessing?: AIProcessingStatus; // AI processing state
  transport?: TransportInfo;
  accommodation?: AccommodationInfo;
}

export interface ExtendedItineraryItem extends ItineraryItem {
    cost?: number;
    currency?: 'JPY' | 'TWD';
}

// Partial interface representing the raw Notion structure
export interface NotionPage {
  id: string;
  properties: {
    Name: { title: { plain_text: string }[] };
    Date: { date: { start: string } | null };
    Status: { status: { name: string } | null };
    Area: { select: { name: string } | null };
    Category: { multi_select: { name: string }[] };
    "Maps URL": { url: string | null };
    "AI Summary": { rich_text: { plain_text: string }[] };
    URL: { url: string | null }; // Original URL for AI processing
    "AI Processing": { select: { name: string } | null }; // Processing state: Pending/Processing/Done/Error
  };
  cover: { type: "external" | "file"; external?: { url: string }; file?: { url: string } } | null;
  last_edited_time: string;
}