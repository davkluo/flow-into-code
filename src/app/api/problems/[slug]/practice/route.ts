import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { generatePracticeData, getPracticeData } from "@/services/practiceData";

export const GET = withAuth<{ slug: string }>(async (_req, _uid, ctx) => {
  const { slug } = await ctx!.params;

  try {
    const result = await getPracticeData(slug);

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
    console.error("getPracticeData failed", err);
    return NextResponse.json(
      { error: "Failed to fetch practice data" },
      { status: 500 },
    );
  }
});

export const POST = withAuth<{ slug: string }>(async (_req, _uid, ctx) => {
  const { slug } = await ctx!.params;

  try {
    const details = await generatePracticeData(slug);

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
    console.error("generatePracticeData failed", err);
    return NextResponse.json(
      { error: "Failed to generate practice data" },
      { status: 500 },
    );
  }
});
