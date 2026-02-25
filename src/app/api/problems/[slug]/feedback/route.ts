import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import {
  generateFeedbackDataForProblem,
  getFeedbackData,
} from "@/services/feedbackData";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const uid = await verifyFirebaseToken(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;

  try {
    const result = await getFeedbackData(slug);

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
    console.error("getFeedbackData failed", err);
    return NextResponse.json(
      { error: "Failed to fetch feedback data" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const uid = await verifyFirebaseToken(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;

  try {
    const details = await generateFeedbackDataForProblem(slug);

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
    console.error("generateFeedbackDataForProblem failed", err);
    return NextResponse.json(
      { error: "Failed to generate feedback data" },
      { status: 500 },
    );
  }
}
