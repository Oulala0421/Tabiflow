import { ExtendedItineraryItem } from "@/types/notion";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface GooglePlaceData {
  title: string;
  address: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  types?: string[];
  summary?: string;
  googleMapsUri?: string;
  priceLevel?: string;
  regularOpeningHours?: any;
}

/**
 * Main entry point: Fetch details for a Google Maps URL
 */
export const fetchGoogleMapsDetails = async (url: string): Promise<GooglePlaceData | null> => {
  if (!API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY is missing. Skipping Places API.");
    return null;
  }

  try {
    // 1. Resolve Short URL (e.g. maps.app.goo.gl)
    const longUrl = await resolveShortUrl(url);
    console.log(`[GoogleMaps] Resolved URL: ${longUrl}`);

    // 2. Extract Query / Place Name
    const query = extractQueryFromUrl(longUrl);
    if (!query) {
      console.warn("[GoogleMaps] Could not extract query from URL.");
      return null;
    }
    console.log(`[GoogleMaps] Extracted query: ${query}`);

    // 3. Search Place (Text Search New)
    const place = await searchPlace(query);
    if (!place) {
      console.warn("[GoogleMaps] No place found for query.");
      return null;
    }

    return place;

  } catch (error) {
    console.error("[GoogleMaps] Failed to fetch details:", error);
    return null;
  }
};

/**
 * Resolves redirects to get the final long URL
 */
const resolveShortUrl = async (shortUrl: string): Promise<string> => {
    try {
        const response = await fetch(shortUrl, { 
            method: 'HEAD', 
            redirect: 'manual' 
        });
        const location = response.headers.get('location');
        if (location) return location;
        
        // If no location header, maybe it didn't redirect or fetch followed it automatically (if redirect: follow)
        // Let's try GET with follow
        const finalResp = await fetch(shortUrl, { method: 'GET' });
        return finalResp.url;
    } catch (e) {
        return shortUrl;
    }
}

/**
 * Extracts a searchable text from a Google Maps URL
 */
const extractQueryFromUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        
        // Type A: /maps/place/NAME/@...
        if (urlObj.pathname.includes('/maps/place/')) {
            const parts = urlObj.pathname.split('/maps/place/');
            if (parts[1]) {
                // Return decoded name, removing + signs
                let rawName = parts[1].split('/')[0];
                return decodeURIComponent(rawName).replace(/\+/g, ' ');
            }
        }
        
        // Type B: /maps/search/NAME
        if (urlObj.pathname.includes('/maps/search/')) {
            const parts = urlObj.pathname.split('/maps/search/');
            if (parts[1]) {
                return decodeURIComponent(parts[1]).replace(/\+/g, ' ');
            }
        }

        // Type C: Query parameter ?q=...
        const q = urlObj.searchParams.get('q');
        if (q) return q;

        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Call Google Places API (Text Search New)
 */
const searchPlace = async (query: string): Promise<GooglePlaceData | null> => {
    const endpoint = 'https://places.googleapis.com/v1/places:searchText';
    
    const payload = {
        textQuery: query,
        languageCode: "zh-TW" // Force Traditional Chinese
    };

    // Fields we want
    // https://developers.google.com/maps/documentation/places/web-service/text-search
    const fieldMask = [
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.googleMapsUri",
        "places.websiteUri",
        "places.types",
        "places.priceLevel",
        "places.editorialSummary",
        "places.regularOpeningHours"
    ].join(",");

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY!,
            'X-Goog-FieldMask': fieldMask
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        console.error(`[GoogleMaps] API Error: ${response.status} - ${err}`);
        return null;
    }

    const data = await response.json();
    if (!data.places || data.places.length === 0) return null;

    const p = data.places[0]; // Take the first result

    return {
        title: p.displayName?.text || query,
        address: p.formattedAddress || "",
        rating: p.rating,
        userRatingCount: p.userRatingCount,
        websiteUri: p.websiteUri,
        googleMapsUri: p.googleMapsUri,
        types: p.types,
        priceLevel: p.priceLevel,
        summary: p.editorialSummary?.text,
        regularOpeningHours: p.regularOpeningHours
    };
}
