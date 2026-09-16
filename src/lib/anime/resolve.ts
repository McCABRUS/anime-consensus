import { getAniListAnime } from "./providers/anilist";

import { getKitsuAnime, getKitsuIdByMalId } from "./providers/kitsu";

import { getJikanAnime } from "./providers/jikan";

import { getRatings } from "./rating-sources";

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

    next: {
      revalidate: 300,
    },
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

async function enrichKitsuIdentity(anime: AnimeDetails): Promise<AnimeDetails> {
  if (anime.reference.provider === "kitsu") {
    return anime;
  }

  if (anime.reference.malId === null) {
    return anime;
  }

  if (anime.externalIds?.kitsu) {
    return anime;
  }

  const kitsuId = await getKitsuIdByMalId(anime.reference.malId);

  if (!kitsuId) {
    return anime;
  }

  return {
    ...anime,

    externalIds: {
      ...anime.externalIds,

      kitsu: kitsuId,
    },
  };
}

export async function resolveCanonicalAnime(
  provider: AnimeProvider,
  id: string,
): Promise<CanonicalAnime | null> {
  const primary = await getProviderDetails(provider, id);

  if (!primary) {
    return null;
  }

  let enrichedPrimary = primary;

  try {
    enrichedPrimary = await enrichKitsuIdentity(primary);
  } catch {
    enrichedPrimary = primary;
  }

  const related: AnimeDetails[] = [];

  if (provider !== "anilist" && enrichedPrimary.reference.malId !== null) {
    try {
      const aniListAnime = await findAniListByMalId(
        enrichedPrimary.reference.malId,
      );

      if (aniListAnime) {
        related.push(aniListAnime);
      }
    } catch {
      return createCanonicalAnime(enrichedPrimary, related);
    }
  }

  const canonical = createCanonicalAnime(enrichedPrimary, related);

  const { ratings, sources } = await getRatings(canonical);

  return {
    ...canonical,
    ratings,
    ratingSources: sources,
  };
}
