import type { AnimeSearchResult } from "../types";

const KITSU_ENDPOINT = "https://kitsu.io/api/edge/anime";

type KitsuAnime = {
  id: string;

  attributes?: {
    slug: string;

    titles?: {
      en?: string | null;
      en_jp?: string | null;
      ja_jp?: string | null;
    };

    canonicalTitle?: string | null;

    averageRating?: string | null;

    startDate?: string | null;

    posterImage?: {
      small?: string | null;
    } | null;

    episodeCount?: number | null;
  };

  relationships?: {
    mappings?: {
      data?: Array<{
        id: string;
        type: string;
      }>;
    };
  };
};

type KitsuResponse = {
  data?: KitsuAnime[];
};

export async function searchKitsu(query: string): Promise<AnimeSearchResult[]> {
  const url = new URL(KITSU_ENDPOINT);

  url.searchParams.set("filter[text]", query);

  url.searchParams.set("page[limit]", "8");

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
    },

    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Kitsu request failed: ${response.status}`);
  }

  const payload = (await response.json()) as KitsuResponse;

  return (
    payload.data?.map((anime) => {
      const attributes = anime.attributes;

      const rawRating = attributes?.averageRating ?? null;

      const rating = rawRating !== null ? Number(rawRating) : null;

      const startDate = attributes?.startDate ?? null;

      const year = startDate ? Number(startDate.slice(0, 4)) : null;

      return {
        id: anime.id,

        malId: null,

        provider: "kitsu",

        title: {
          romaji:
            attributes?.titles?.en_jp ?? attributes?.canonicalTitle ?? null,

          english: attributes?.titles?.en ?? null,

          native: attributes?.titles?.ja_jp ?? null,

          synonyms: [],
        },

        coverImage: attributes?.posterImage?.small ?? null,

        color: null,

        seasonYear: Number.isFinite(year) ? year : null,

        format: null,

        episodes: attributes?.episodeCount ?? null,

        score: Number.isFinite(rating) ? rating! / 10 : null,
      };
    }) ?? []
  );
}
