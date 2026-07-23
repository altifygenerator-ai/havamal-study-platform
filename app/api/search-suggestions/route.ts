import { NextResponse } from "next/server";
import { getCompleteCorpus } from "@/lib/complete-corpus";
import { editionRegistry, getAllPassages, themeRegistry } from "@/lib/data";
import { getSearchSuggestions } from "@/lib/corpus-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 120) ?? "";
  if (!query) return NextResponse.json({ suggestions: [] });

  let passages = getAllPassages();
  try {
    passages = (await getCompleteCorpus()).passages;
  } catch {
    // The reviewed bundled corpus remains searchable if a remote edition is unavailable.
  }

  return NextResponse.json(
    {
      suggestions: getSearchSuggestions(
        passages,
        query,
        themeRegistry,
        editionRegistry,
      ),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=43200",
      },
    },
  );
}
