import { NextRequest, NextResponse } from "next/server";

import { searchAnime } from "@/lib/anime/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({
      results: [],
    });
  }

  try {
    const results = await searchAnime(query);

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("[Anime Search] Unexpected error:", error);

    return NextResponse.json(
      {
        error: "Unable to search anime right now.",
      },
      {
        status: 500,
      },
    );
  }
}
