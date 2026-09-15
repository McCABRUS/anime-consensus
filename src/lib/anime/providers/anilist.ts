import type { AnimeSearchResult } from "../types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const SEARCH_QUERY = `
  query SearchAnime($search: String!) {
    Page(page: 1, perPage: 8) {
      media(
        search: $search
        type: ANIME
      ) {
        id
        idMal

        title {
          romaji
          english
          native
        }

        synonyms

        coverImage {
          medium
          color
        }

        seasonYear
        format
        episodes
        averageScore
      }
    }
  }
`;

type AniListAnime = {
  id: number;
  idMal: number | null;

  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };

  synonyms?: string[];

  coverImage?: {
    medium: string | null;
    color: string | null;
  } | null;

  seasonYear: number | null;
  format: string | null;
  episodes: number | null;
  averageScore: number | null;
};

type AniListResponse = {
  data?: {
    Page?: {
      media?: AniListAnime[];
    };
  };

  errors?: Array<{
    message: string;
  }>;
};

export async function searchAniList(
  query: string,
): Promise<AnimeSearchResult[]> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: {
        search: query,
      },
    }),

    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AniList request failed: ${response.status}`);
  }

  const payload = (await response.json()) as AniListResponse;

  if (payload.errors?.length) {
    throw new Error(
      payload.errors[0]?.message ?? "AniList GraphQL request failed",
    );
  }

  return (
    payload.data?.Page?.media?.map((anime) => ({
      id: anime.id,

      malId: anime.idMal,

      provider: "anilist",

      title: {
        romaji: anime.title.romaji,
        english: anime.title.english,
        native: anime.title.native,
        synonyms: anime.synonyms ?? [],
      },

      coverImage: anime.coverImage?.medium ?? null,

      color: anime.coverImage?.color ?? null,

      seasonYear: anime.seasonYear,
      format: anime.format,
      episodes: anime.episodes,
      score: anime.averageScore !== null ? anime.averageScore / 10 : null,
    })) ?? []
  );
}
