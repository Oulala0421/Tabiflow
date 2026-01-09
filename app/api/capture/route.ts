import { createPage } from "@/lib/notion";
import { NextResponse } from "next/server";

// Force dynamic to ensure real-time processing
export const dynamic = 'force-dynamic';

/**
 * POST /api/capture
 * Quick Capture API - "Fire-and-forget" mode
 * Immediately saves to Notion without AI processing
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      url,
      title,
      date,
      area,
      status = "Inbox"
    } = body;

    // Validation
    if (!url && !title) {
      return NextResponse.json(
        { error: "Either URL or title is required" },
        { status: 400 }
      );
    }

    // Determine if this needs AI processing
    const needsAI = !!url;
    const finalTitle = title || url || "未命名項目";

    // Create page in Notion
    const pageId = await createPage({
      title: finalTitle,
      url: url || undefined,
      date: date || undefined,
      area: area || undefined,
      status: status,
      aiProcessing: needsAI ? "Pending" : undefined,
    });

    return NextResponse.json({
      success: true,
      pageId,
      message: needsAI
        ? "已加入待定清單，稍後將自動分析"
        : "已加入行程",
    });
  } catch (error: any) {
    console.error("Capture API error:", error);
    return NextResponse.json(
      {
        error: "Failed to capture item",
        details: error.message
      },
      { status: 500 }
    );
  }
}
