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
  terminal?: string;    // 航廈
  gate?: string;        // 登機門
  flightNumber?: string; // 班機號碼
  arrival?: string;     // 抵達時間 (HH:mm)
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
  endDate?: string; // ISO Date String (YYYY-MM-DD) for multi-day items
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
    isArrival?: boolean; // Virtual flag for transport arrival cards
}

// Partial interface representing the raw Notion structure
export interface NotionPage {
  id: string;
  properties: {
    "地點名稱": { title: { plain_text: string }[] };
    "日期": { date: { start: string; end?: string | null } | null };
    "處理狀態": { status: { name: string } | null };
    "區域": { rich_text: { plain_text: string }[] };
    "類別": { multi_select: { name: string }[] };
    "Google Maps": { url: string | null };
    "AI摘要": { rich_text: { plain_text: string }[] };
    "URL": { url: string | null }; // Original URL for AI processing
    "AI Processing": { select: { name: string } | null }; // Processing state: Pending/Processing/Done/Error
    "預算": { rich_text: { plain_text: string }[] | null };
    "TransportJSON": { rich_text: { plain_text: string }[] | null };
    "AccommodationJSON": { rich_text: { plain_text: string }[] | null };
  };
  cover: { type: "external" | "file"; external?: { url: string }; file?: { url: string } } | null;
  last_edited_time: string;
}