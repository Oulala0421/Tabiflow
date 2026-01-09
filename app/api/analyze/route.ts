import { getPageById, updatePage } from "@/lib/notion";
import { scrapeUrl } from "@/lib/scraper";
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
    // STEP 3: EXECUTE (Scraping + AI)
    // ========================================
    console.log(`[Analyze] Step 3: Executing analysis for ${url}`);

    // 3.1 Scraping
    console.log(`[Analyze] 3.1: Scraping URL...`);
    const scrapedData = await scrapeUrl(url);

    // 3.2 AI Analysis
    console.log(`[Analyze] 3.2: Analyzing with Gemini...`);
    const analyzedData = await analyzeContent(scrapedData);

    // ========================================
    // STEP 4: UPDATE (Write back + Unlock)
    // ========================================
    console.log(`[Analyze] Step 4: Updating page with results`);

    await updatePage(pageId, {
      title: analyzedData.title,
      area: analyzedData.area,
      categories: analyzedData.category,
      summary: analyzedData.summary,
      mapsUrl: analyzedData.mapsUrl,
      aiProcessing: "Done",
    });

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
      title: page.properties.Name.title[0]?.plain_text || "",
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
