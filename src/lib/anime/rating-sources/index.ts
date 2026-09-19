import type {
  AnimeRating,
  AnimeRatingSource,
  CanonicalAnime,
  RatingProvider,
} from "../types";

import { annRatingSource } from "./ann";

import type { RatingSource } from "./types";

import { aniListRatingSource } from "./anilist";

import { malRatingSource } from "./mal";

import { kitsuRatingSource } from "./kitsu";

import { shikimoriRatingSource } from "./shikimori";

import { simklRatingSource } from "./simkl";

export const ratingSources: RatingSource[] = [
  malRatingSource,
  aniListRatingSource,
  kitsuRatingSource,
  annRatingSource,
  shikimoriRatingSource,
  simklRatingSource,
];

export async function getRatings(anime: CanonicalAnime): Promise<{
  ratings: AnimeRating[];
  sources: AnimeRatingSource[];
}> {
  const results = await Promise.allSettled(
    ratingSources.map((source) => source.getRating(anime)),
  );

  const sources: AnimeRatingSource[] = [];

  const ratings: AnimeRating[] = [];

  const unique = new Map<RatingProvider, AnimeRating>();

  results.forEach((result, index) => {
    const source = ratingSources[index];

    if (result.status === "fulfilled") {
      const rating = result.value;

      if (rating) {
        sources.push({
          provider: source.provider,

          status: "available",

          rating,
        });

        unique.set(rating.provider, rating);

        return;
      }

      sources.push({
        provider: source.provider,

        status: "unavailable",

        rating: null,
      });

      return;
    }

    sources.push({
      provider: source.provider,

      status: "error",

      rating: null,
    });

    console.warn(`[Rating Source] ${source.provider} failed.`, result.reason);
  });

  for (const rating of unique.values()) {
    ratings.push(rating);
  }

  return {
    ratings,
    sources,
  };
}
