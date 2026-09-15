import type { AnimeDetails, AnimeSearchResult } from "../types";

import { createRating } from "../ratings";

const JIKAN_ENDPOINT = "https://api.jikan.moe/v4/anime";

type JikanAnime = {
  mal_id: number;
  title?: string | null;
  title_english?: string | null;
  title_japanese?: string | null;
  title_synonyms?: string[];

  images?: {
    jpg?: {
      image_url?: string | null;
      large_image_url?: string | null;
    };
  };

  year?: number | null;
  type?: string | null;
  episodes?: number | null;
  score?: number | null;
  status?: string | null;
  season?: string | null;
  synopsis?: string | null;
  duration?: string | null;

  genres?: Array<{
    name: string;
  }>;

  studios?: Array<{
    name: string;
  }>;

  source?: string | null;
  members?: number | null;
};

type JikanResponse = {
  data?: JikanAnime[];
};

type JikanDetailResponse = {
  data?: JikanAnime;
};

function parseDuration(duration: string | null | undefined): number | null {
  if (!duration) {
    return null;
  }

  const match = duration.match(/(\d+)\s*min/i);

  if (!match?.[1]) {
    return null;
  }

  const minutes = Number(match[1]);

  return Number.isFinite(minutes) ? minutes : null;
}

function mapJikanToSearchResult(anime: JikanAnime): AnimeSearchResult {
  return {
    id: anime.mal_id,

    malId: anime.mal_id,

    provider: "jikan",

    title: {
      romaji: anime.title ?? null,

      english: anime.title_english ?? null,

      native: anime.title_japanese ?? null,

      synonyms: anime.title_synonyms ?? [],
    },

    coverImage:
      anime.images?.jpg?.image_url ??
      anime.images?.jpg?.large_image_url ??
      null,

    color: null,

    seasonYear: anime.year ?? null,

    format: anime.type ?? null,

    episodes: anime.episodes ?? null,

    score: anime.score ?? null,
  };
}

function mapJikanToDetails(anime: JikanAnime): AnimeDetails {
  return {
    reference: {
      provider: "jikan",

      id: String(anime.mal_id),

      malId: anime.mal_id,
    },

    title: {
      romaji: anime.title ?? null,

      english: anime.title_english ?? null,

      native: anime.title_japanese ?? null,

      synonyms: anime.title_synonyms ?? [],
    },

    description: anime.synopsis ?? null,

    coverImage:
      anime.images?.jpg?.large_image_url ??
      anime.images?.jpg?.image_url ??
      null,

    bannerImage: null,

    color: null,

    format: anime.type ?? null,

    status: anime.status ?? null,

    season: anime.season ?? null,

    seasonYear: anime.year ?? null,

    episodes: anime.episodes ?? null,

    duration: parseDuration(anime.duration),

    genres: anime.genres?.map((genre) => genre.name) ?? [],

    studios: anime.studios?.map((studio) => studio.name) ?? [],

    source: anime.source ?? null,

    rating: createRating("myanimelist", anime.score, 10, null),

    popularity: anime.members ?? null,
  };
}

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

  return payload.data?.map(mapJikanToSearchResult) ?? [];
}

export async function getJikanAnime(id: string): Promise<AnimeDetails | null> {
  const response = await fetch(`${JIKAN_ENDPOINT}/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/json",
    },

    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Jikan detail request failed: ${response.status}`);
  }

  const payload = (await response.json()) as JikanDetailResponse;

  if (!payload.data) {
    return null;
  }

  return mapJikanToDetails(payload.data);
}
