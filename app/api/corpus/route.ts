import { NextResponse } from "next/server";
import { getCompleteCorpus } from "@/lib/complete-corpus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("refresh") === "1";
  try {
    const corpus = await getCompleteCorpus({ force });
    return NextResponse.json(corpus, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=43200" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "The complete corpus could not be loaded.",
      },
      { status: 502 },
    );
  }
}
