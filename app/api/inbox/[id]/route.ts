import { NextRequest, NextResponse } from "next/server";
import { updatePage } from "@/lib/notion";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await req.json();
    await updatePage(id, body);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("PATCH /api/inbox/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    await notion.pages.update({
        page_id: id,
        archived: true
    });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("DELETE /api/inbox/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
