import type { AnimeDetails, AnimeSearchResult } from "../types";

const KITSU_ENDPOINT = "https://kitsu.io/api/edge/anime";

type KitsuAnime = {
  id: string;

  attributes?: {
    canonicalTitle?: string | null;

    titles?: {
      en?: string | null;
      en_jp?: string | null;
      ja_jp?: string | null;
    };

    synopsis?: string | null;

    description?: string | null;

    averageRating?: string | null;

    startDate?: string | null;

    episodeCount?: number | null;

    episodeLength?: number | null;

    subtype?: string | null;

    status?: string | null;

    season?: string | null;

    seasonYear?: number | null;

    posterImage?: {
      extraLarge?: string | null;
      large?: string | null;
      medium?: string | null;
      small?: string | null;
    } | null;

    coverImage?: {
      extraLarge?: string | null;
      large?: string | null;
      small?: string | null;
    } | null;
  };
};

type KitsuSearchResponse = {
  data?: KitsuAnime[];
};

type KitsuAnimeResponse = {
  data?: KitsuAnime;
};

type KitsuMapping = {
  id: string;

  type: string;

  attributes?: {
    externalSite?: string | null;
    externalId?: string | null;
  };
};

type KitsuMappingsResponse = {
  data?: KitsuMapping[];
};

function normalizeKitsuRating(value: string | null | undefined): number | null {
  if (value == null) {
    return null;
  }

  const rating = Number(value);

  return Number.isFinite(rating) ? rating : null;
}

function mapKitsuAnimeToSearchResult(anime: KitsuAnime): AnimeSearchResult {
  const attributes = anime.attributes;

  const rawRating = normalizeKitsuRating(attributes?.averageRating);

  return {
    id: anime.id,

    malId: null,

    provider: "kitsu",

    title: {
      romaji: attributes?.titles?.en_jp ?? attributes?.canonicalTitle ?? null,

      english: attributes?.titles?.en ?? null,

      native: attributes?.titles?.ja_jp ?? null,

      synonyms: [],
    },

    coverImage: attributes?.posterImage?.small ?? null,

    color: null,

    seasonYear:
      attributes?.seasonYear ??
      (attributes?.startDate ? Number(attributes.startDate.slice(0, 4)) : null),

    format: attributes?.subtype ?? null,

    episodes: attributes?.episodeCount ?? null,

    score: rawRating !== null ? rawRating / 10 : null,
  };
}

async function getKitsuMappings(id: string): Promise<{
  malId: number | null;
  aniListId: number | null;
}> {
  const response = await fetch(
    `${KITSU_ENDPOINT}/${encodeURIComponent(id)}/mappings`,
    {
      headers: {
        Accept: "application/vnd.api+json",
      },

      next: {
        revalidate: 300,
      },
    },
  );

  if (!response.ok) {
    return {
      malId: null,
      aniListId: null,
    };
  }

  const payload = (await response.json()) as KitsuMappingsResponse;

  const mappings = payload.data ?? [];

  let malId: number | null = null;

  let aniListId: number | null = null;

  for (const mapping of mappings) {
    const externalSite = mapping.attributes?.externalSite;

    const externalId = mapping.attributes?.externalId;

    if (!externalId) {
      continue;
    }

    if (externalSite === "myanimelist/anime" && malId === null) {
      const parsed = Number(externalId);

      if (Number.isFinite(parsed)) {
        malId = parsed;
      }
    }

    if (externalSite === "anilist/anime" && aniListId === null) {
      const parsed = Number(externalId);

      if (Number.isFinite(parsed)) {
        aniListId = parsed;
      }
    }
  }

  return {
    malId,
    aniListId,
  };
}

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

  const payload = (await response.json()) as KitsuSearchResponse;

  return payload.data?.map(mapKitsuAnimeToSearchResult) ?? [];
}

export async function getKitsuAnime(id: string): Promise<AnimeDetails | null> {
  const response = await fetch(`${KITSU_ENDPOINT}/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/vnd.api+json",
    },

    next: {
      revalidate: 300,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Kitsu detail request failed: ${response.status}`);
  }

  const payload = (await response.json()) as KitsuAnimeResponse;

  const anime = payload.data;

  if (!anime?.attributes) {
    return null;
  }

  const attributes = anime.attributes;

  const { malId } = await getKitsuMappings(id);

  return {
    reference: {
      provider: "kitsu",

      id: anime.id,

      malId,
    },

    title: {
      romaji: attributes.titles?.en_jp ?? attributes.canonicalTitle ?? null,

      english: attributes.titles?.en ?? null,

      native: attributes.titles?.ja_jp ?? null,

      synonyms: [],
    },

    description: attributes.synopsis ?? attributes.description ?? null,

    coverImage:
      attributes.posterImage?.extraLarge ??
      attributes.posterImage?.large ??
      attributes.posterImage?.medium ??
      null,

    bannerImage:
      attributes.coverImage?.extraLarge ??
      attributes.coverImage?.large ??
      attributes.coverImage?.small ??
      null,

    color: null,

    format: attributes.subtype ?? null,

    status: attributes.status ?? null,

    season: attributes.season ?? null,

    seasonYear:
      attributes.seasonYear ??
      (attributes.startDate ? Number(attributes.startDate.slice(0, 4)) : null),

    episodes: attributes.episodeCount ?? null,

    duration: attributes.episodeLength ?? null,

    genres: [],

    studios: [],

    source: null,

    popularity: null,
  };
}

export async function getKitsuRating(id: string): Promise<number | null> {
  const response = await fetch(`${KITSU_ENDPOINT}/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/vnd.api+json",
    },

    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as KitsuAnimeResponse;

  const rawScore = payload.data?.attributes?.averageRating;

  const score = normalizeKitsuRating(rawScore);

  return score;
}
