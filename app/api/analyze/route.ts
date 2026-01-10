import { getPageById, updatePage } from "@/lib/notion";
// import { scrapeUrl } from "@/lib/scraper";
import { analyzeContent } from "@/lib/gemini";
import { NextResponse } from "next/server";

// Force dynamic to ensure real-time processing
export const dynamic = 'force-dynamic';

/**
 * POST /api/analyze
 * Core API implementing the State Machine: Check → Lock → Process → Update
 *
 * This API prevents duplicate processing through double-checking and locking
 */
export async function POST(request: Request) {
  let pageId: string = "";

  try {
    const body = await request.json();
    pageId = body.pageId;

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    // ========================================
    // STEP 1: CHECK (Double Check)
    // ========================================
    console.log(`[Analyze] Step 1: Checking status for page ${pageId}`);

    const page = await getPageById(pageId);
    const aiStatus = page.properties["AI Processing"]?.select?.name;
    const url = page.properties.URL?.url;

    // Skip if already processing or done
    if (aiStatus === "Processing" || aiStatus === "Done") {
      console.log(`[Analyze] Skipped: Status is ${aiStatus}`);
      return NextResponse.json({
        status: "skipped",
        message: `Task already ${aiStatus.toLowerCase()}`,
        aiStatus,
      });
    }

    // Validate URL exists
    if (!url) {
      console.log(`[Analyze] Error: No URL found`);
      await updatePage(pageId, { aiProcessing: "Error" });
      return NextResponse.json(
        {
          status: "error",
          message: "No URL found in page",
        },
        { status: 400 }
      );
    }

    // ========================================
    // STEP 2: LOCK (Atomic Operation)
    // ========================================
    console.log(`[Analyze] Step 2: Locking page ${pageId}`);

    await updatePage(pageId, { aiProcessing: "Processing" });

    // ========================================
    // STEP 3: EXECUTE (Direct AI Analysis)
    // ========================================
    console.log(`[Analyze] Step 3: Analyzing ${url} with Gemini directly`);

    // 3.1 AI Analysis (Directly with URL and Memo)
    // We pass the URL and any available context (though currently we only have the URL from the page property)
    // If we wanted to pass the 'memo' or context, we'd need to fetch it from the page or pass it in the body.
    // For now, we rely on the URL.
    const analyzedData = await analyzeContent(url);

    // ========================================
    // STEP 4: UPDATE (Write back + Unlock)
    // ========================================
    console.log(`[Analyze] Step 4: Updating page with results`);

    // Ensure we don't overwrite if Gemini returns empty
    const updates: any = {
      aiProcessing: "Done",
    };

    if (analyzedData.title) updates.title = analyzedData.title;
    if (analyzedData.area) updates.area = analyzedData.area;
    if (analyzedData.category && analyzedData.category.length > 0) updates.categories = analyzedData.category;
    if (analyzedData.summary) updates.summary = analyzedData.summary;
    if (analyzedData.mapsUrl) updates.mapsUrl = analyzedData.mapsUrl;

    await updatePage(pageId, updates);

    console.log(`[Analyze] ✅ Success for page ${pageId}`);

    return NextResponse.json({
      status: "success",
      message: "Analysis completed",
      data: analyzedData,
    });
  } catch (error: any) {
    // ========================================
    // ERROR HANDLING (Set to Error state)
    // ========================================
    console.error(`[Analyze] ❌ Error for page ${pageId}:`, error);

    // Only update if pageId was provided
    if (pageId) {
      try {
        await updatePage(pageId, { aiProcessing: "Error" });
      } catch (updateError) {
        console.error("[Analyze] Failed to update error status:", updateError);
      }
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Analysis failed",
        error: error.toString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze?pageId=xxx
 * Check analysis status (useful for polling)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    const page = await getPageById(pageId);
    const aiStatus = page.properties["AI Processing"]?.select?.name;

    return NextResponse.json({
      pageId,
      aiStatus: aiStatus || "Unknown",
      title: page.properties["地點名稱"].title[0]?.plain_text || "",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to check status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
