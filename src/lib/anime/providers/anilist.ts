import type { AnimeDetails, AnimeSearchResult } from "../types";

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

const DETAILS_QUERY = `
  query GetAnime($id: Int) {
    Media(
      id: $id
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
      description(asHtml: false)
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      format
      status
      season
      seasonYear
      episodes
      duration
      genres
      source
      averageScore
      popularity
      externalLinks {
        site
        url
      }
      studios {
        edges {
          isMain
          node {
            id
            name
            isAnimationStudio
          }
        }
      }
    }
  }
`;

const RATING_QUERY = `
  query GetAnimeRating($id: Int!) {
    Media(
      id: $id
      type: ANIME
    ) {
      averageScore
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

type AniListStudioEdge = {
  isMain: boolean;

  node: {
    id: number;
    name: string;
    isAnimationStudio: boolean;
  };
};

type AniListDetailsAnime = {
  id: number;
  idMal: number | null;

  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };

  externalLinks?: Array<{
    site: string;
    url: string | null;
  }>;

  synonyms?: string[];

  description: string | null;

  coverImage?: {
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
    color: string | null;
  } | null;

  bannerImage: string | null;
  format: string | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  genres?: string[];
  source: string | null;
  averageScore: number | null;
  popularity: number | null;

  studios?: {
    edges?: AniListStudioEdge[];
  };
};

type AniListSearchResponse = {
  data?: {
    Page?: {
      media?: AniListAnime[];
    };
  };

  errors?: Array<{
    message: string;
  }>;
};

type AniListDetailsResponse = {
  data?: {
    Media?: AniListDetailsAnime;
  };

  errors?: Array<{
    message: string;
  }>;
};

type AniListRatingResponse = {
  data?: {
    Media?: {
      averageScore: number | null;
    };
  };

  errors?: Array<{
    message: string;
  }>;
};

function mapAniListSearchResult(anime: AniListAnime): AnimeSearchResult {
  return {
    id: anime.id,
    malId: anime.idMal,
    provider: "anilist",

    title: {
      romaji: anime.title.romaji ?? null,

      english: anime.title.english ?? null,

      native: anime.title.native ?? null,

      synonyms: anime.synonyms ?? [],
    },

    coverImage: anime.coverImage?.medium ?? null,

    color: anime.coverImage?.color ?? null,

    seasonYear: anime.seasonYear ?? null,

    format: anime.format ?? null,

    episodes: anime.episodes ?? null,

    score: anime.averageScore !== null ? anime.averageScore / 10 : null,
  };
}

function mapAniListDetails(
  anime: AniListDetailsAnime,
  fallbackMalId?: number | null,
): AnimeDetails {
  const studioEdges = anime.studios?.edges ?? [];

  const animationStudios = studioEdges.filter(
    (edge) => edge.node.isAnimationStudio,
  );

  const mainStudio =
    animationStudios.find((edge) => edge.isMain)?.node.name ??
    animationStudios[0]?.node.name ??
    null;

  const productionCompanies = studioEdges
    .filter((edge) => !edge.node.isAnimationStudio)
    .map((edge) => edge.node.name);

  const annLink = anime.externalLinks?.find((link) =>
    link.url?.includes("animenewsnetwork.com/encyclopedia/anime.php?id="),
  );

  const annId = annLink?.url
    ? new URL(annLink.url).searchParams.get("id")
    : null;

  return {
    reference: {
      provider: "anilist",
      id: String(anime.id),
      malId: anime.idMal ?? fallbackMalId ?? null,
    },

    externalIds: {
      ann: annId,
    },

    title: {
      romaji: anime.title.romaji ?? null,

      english: anime.title.english ?? null,

      native: anime.title.native ?? null,

      synonyms: anime.synonyms ?? [],
    },

    description: anime.description ?? null,

    coverImage:
      anime.coverImage?.extraLarge ??
      anime.coverImage?.large ??
      anime.coverImage?.medium ??
      null,

    bannerImage: anime.bannerImage ?? null,

    color: anime.coverImage?.color ?? null,

    format: anime.format ?? null,

    status: anime.status ?? null,

    season: anime.season ?? null,

    seasonYear: anime.seasonYear ?? null,

    episodes: anime.episodes ?? null,

    duration: anime.duration ?? null,

    genres: anime.genres ?? [],

    studios: animationStudios.map((edge) => edge.node.name),

    mainStudio,

    productionCompanies,

    source: anime.source ?? null,

    popularity: anime.popularity ?? null,
  };
}

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

  const payload = (await response.json()) as AniListSearchResponse;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "AniList search failed");
  }

  return payload.data?.Page?.media?.map(mapAniListSearchResult) ?? [];
}

export async function getAniListAnime(
  id: number,
): Promise<AnimeDetails | null> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Accept: "application/json",
    },

    body: JSON.stringify({
      query: DETAILS_QUERY,

      variables: {
        id,
      },
    }),

    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`AniList detail request failed: ${response.status}`);
  }

  const payload = (await response.json()) as AniListDetailsResponse;

  if (payload.errors?.length) {
    throw new Error(
      payload.errors[0]?.message ?? "AniList detail request failed",
    );
  }

  const anime = payload.data?.Media;

  if (!anime) {
    return null;
  }

  return mapAniListDetails(anime);
}

export async function getAniListRating(id: number): Promise<number | null> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Accept: "application/json",
    },

    body: JSON.stringify({
      query: RATING_QUERY,

      variables: {
        id,
      },
    }),

    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AniListRatingResponse;

  if (payload.errors?.length) {
    return null;
  }

  const score = payload.data?.Media?.averageScore;

  if (typeof score !== "number") {
    return null;
  }

  return score;
}
