import { NextRequest, NextResponse } from "next/server";

import { getAnimeDetails } from "@/lib/anime/details";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      provider: string;
      id: string;
    }>;
  },
) {
  const { provider, id } = await context.params;

  try {
    const anime = await getAnimeDetails(
      provider as "anilist" | "jikan" | "kitsu",
      id,
    );

    if (!anime) {
      return NextResponse.json(
        {
          error: "Anime not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      anime,
    });
  } catch (error) {
    console.error("[Anime Details]", error);

    return NextResponse.json(
      {
        error: "Unable to load anime details.",
      },
      {
        status: 502,
      },
    );
  }
}
