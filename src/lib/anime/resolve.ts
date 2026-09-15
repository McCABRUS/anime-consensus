import { getAniListAnime } from "./providers/anilist";

import { getJikanAnime } from "./providers/jikan";

import { getKitsuAnime } from "./providers/kitsu";

import type { AnimeDetails, AnimeProvider, CanonicalAnime } from "./types";

import { createCanonicalAnime } from "./canonical";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

async function getProviderDetails(
  provider: AnimeProvider,
  id: string,
): Promise<AnimeDetails | null> {
  switch (provider) {
    case "anilist":
      return getAniListAnime(Number(id));

    case "jikan":
      return getJikanAnime(id);

    case "kitsu":
      return getKitsuAnime(id);
  }
}

async function findAniListByMalId(malId: number): Promise<AnimeDetails | null> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Accept: "application/json",
    },

    body: JSON.stringify({
      query: `
            query ($idMal: Int) {
              Media(
                idMal: $idMal
                type: ANIME
              ) {
                id
              }
            }
          `,

      variables: {
        idMal: malId,
      },
    }),

    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    data?: {
      Media?: {
        id: number;
      };
    };

    errors?: Array<{
      message: string;
    }>;
  };

  if (payload.errors?.length) {
    return null;
  }

  const aniListId = payload.data?.Media?.id;

  if (typeof aniListId !== "number") {
    return null;
  }

  return getAniListAnime(aniListId);
}

export async function resolveCanonicalAnime(
  provider: AnimeProvider,
  id: string,
): Promise<CanonicalAnime | null> {
  const primary = await getProviderDetails(provider, id);

  if (!primary) {
    return null;
  }

  const related: AnimeDetails[] = [];

  if (provider !== "jikan" && primary.reference.malId !== null) {
    try {
      const malAnime = await getJikanAnime(String(primary.reference.malId));

      if (malAnime) {
        related.push(malAnime);
      }
    } catch (error) {
      console.warn("[Canonical Resolver] MAL enrichment failed:", error);
    }
  }

  if (provider !== "anilist" && primary.reference.malId !== null) {
    try {
      const aniListAnime = await findAniListByMalId(primary.reference.malId);

      if (aniListAnime) {
        related.push(aniListAnime);
      }
    } catch (error) {
      console.warn("[Canonical Resolver] AniList enrichment failed:", error);
    }
  }

  return createCanonicalAnime(primary, related);
}
