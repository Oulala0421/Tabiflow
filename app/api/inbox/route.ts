import { NextRequest, NextResponse } from "next/server";
import { getItinerary, createPage } from "@/lib/notion";

// Force dynamic behavior
export const dynamic = "force-dynamic";

export async function GET() {
  console.log('[API /inbox GET] Request received');
  try {
    const items = await getItinerary();
    console.log(`[API /inbox GET] Retrieved ${items.length} items`);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("[API /inbox GET] Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch items", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  console.log('[API /inbox POST] Request received');
  try {
    const body = await req.json();
    console.log('[API /inbox POST] Body:', JSON.stringify(body, null, 2));
    const { url, title, status } = body;

    if (!url && !title) {
        return NextResponse.json(
            { error: "URL or Title is required" },
            { status: 400 }
        );
    }

    const { url, title, status, date, time, area, categories, summary, mapsUrl, cost } = body;

    const id = await createPage({
        title: title || url,
        url: url,
        status: status || "Inbox",
        aiProcessing: "Pending",
        date,
        time,
        area,
        categories,
        summary,
        mapsUrl,
        cost
    });

    console.log(`[API /inbox POST] Created page with ID: ${id}`);
    return NextResponse.json({ id, status: "success" });
  } catch (error: any) {
    console.error("[API /inbox POST] Error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to create item", details: error?.message },
      { status: 500 }
    );
  }
}

