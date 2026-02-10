import { NextResponse } from "next/server";
import { generatePreviewData, getPreviewData } from "@/services/previewData";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const details = await getPreviewData(slug);

    if (!details) {
      return NextResponse.json(null, {
        status: 404,
        headers: { "Cache-Control": "no-store" }, // will be generated soon
      });
    }

    return NextResponse.json(details, {
      headers: {
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    console.error("getPreviewData failed", err);
    return NextResponse.json(
      { error: "Failed to fetch preview data" },
      { status: 500 },
    );
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const details = await generatePreviewData(slug);

    return NextResponse.json(details);
  } catch (err) {
    console.error("generatePreviewData failed", err);
    return NextResponse.json(
      { error: "Failed to generate preview data" },
      { status: 500 },
    );
  }
}
