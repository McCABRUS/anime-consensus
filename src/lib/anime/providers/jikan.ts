import type { AnimeSearchResult } from "../types";

const JIKAN_ENDPOINT = "https://api.jikan.moe/v4/anime";

type JikanAnime = {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms?: string[];

  images?: {
    jpg?: {
      image_url?: string | null;
    };
  };

  year?: number | null;
  type?: string | null;
  episodes?: number | null;
  score?: number | null;
};

type JikanResponse = {
  data?: JikanAnime[];
};

export async function searchJikan(query: string): Promise<AnimeSearchResult[]> {
  const url = new URL(JIKAN_ENDPOINT);

  url.searchParams.set("q", query);
  url.searchParams.set("limit", "8");
  url.searchParams.set("sfw", "true");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Jikan request failed: ${response.status}`);
  }

  const payload = (await response.json()) as JikanResponse;

  return (
    payload.data?.map((anime) => ({
      id: anime.mal_id,
      malId: anime.mal_id,
      provider: "jikan",

      title: {
        romaji: anime.title ?? null,
        english: anime.title_english ?? null,
        native: anime.title_japanese ?? null,
        synonyms: anime.title_synonyms ?? [],
      },

      coverImage: anime.images?.jpg?.image_url ?? null,

      color: null,

      seasonYear: anime.year ?? null,
      format: anime.type ?? null,
      episodes: anime.episodes ?? null,
      score: anime.score ?? null,
    })) ?? []
  );
}
