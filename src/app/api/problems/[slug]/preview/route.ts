import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { generatePreviewData, getPreviewData } from "@/services/previewData";

export const GET = withAuth<{ slug: string }>(async (_req, _uid, ctx) => {
  const { slug } = await ctx!.params;

  try {
    const result = await getPreviewData(slug);

    if (result.status === "complete") {
      return NextResponse.json(result.data, {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }

    if (result.status === "processing") {
      return NextResponse.json(
        { status: "processing" },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("getPreviewData failed", err);
    return NextResponse.json(
      { error: "Failed to fetch preview data" },
      { status: 500 },
    );
  }
});

export const POST = withAuth<{ slug: string }>(async (_req, _uid, ctx) => {
  const { slug } = await ctx!.params;

  try {
    const details = await generatePreviewData(slug);

    if (!details) {
      return NextResponse.json(
        { status: "processing" },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(details, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("generatePreviewData failed", err);
    return NextResponse.json(
      { error: "Failed to generate preview data" },
      { status: 500 },
    );
  }
});
