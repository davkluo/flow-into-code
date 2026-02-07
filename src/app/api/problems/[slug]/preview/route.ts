import { NextResponse } from "next/server";
import { ensurePreviewData } from "@/services/ensurePreviewData";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const details = await ensurePreviewData(slug);

    return NextResponse.json(details);
  } catch (err) {
    console.error("ensurePreviewData failed", err);
    return NextResponse.json(
      { error: "Failed to generate preview data" },
      { status: 500 },
    );
  }
}
