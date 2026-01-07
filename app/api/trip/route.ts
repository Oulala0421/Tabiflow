import { getItinerary } from "@/lib/notion";
import { NextResponse } from "next/server";

// Force dynamic to ensure we always get the latest state from Notion
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getItinerary();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trip data" },
      { status: 500 }
    );
  }
}
