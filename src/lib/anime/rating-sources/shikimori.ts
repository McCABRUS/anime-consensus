import type { CanonicalAnime } from "../types";

import type { RatingSource } from "./types";

import { createRating } from "../ratings";

const SHIKIMORI_ENDPOINT = "https://shikimori.one/api/animes";

type ShikimoriScoreStat = {
  name: number;
  value: number;
};

type ShikimoriAnime = {
  id: number;

  rates_scores_stats?: ShikimoriScoreStat[];
};

export const shikimoriRatingSource: RatingSource = {
  provider: "shikimori",

  async getRating(anime: CanonicalAnime) {
    const malId = anime.ids.mal;

    if (malId === null) {
      return null;
    }

    const response = await fetch(`${SHIKIMORI_ENDPOINT}/${malId}`, {
      headers: {
        Accept: "application/json",

        "User-Agent":
          "AnimeConsensus/0.1 (+https://anime-consensus.vercel.app)",
      },

      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ShikimoriAnime;

    const stats = payload.rates_scores_stats ?? [];

    if (stats.length === 0) {
      return null;
    }

    let totalVotes = 0;
    let totalScore = 0;

    for (const stat of stats) {
      if (
        !Number.isFinite(stat.name) ||
        !Number.isFinite(stat.value) ||
        stat.value <= 0
      ) {
        continue;
      }

      totalVotes += stat.value;
      totalScore += stat.name * stat.value;
    }

    if (totalVotes === 0) {
      return null;
    }

    const communityAverage = totalScore / totalVotes;

    const rating = createRating("shikimori", communityAverage, 10, totalVotes);

    if (!rating) {
      return null;
    }

    return rating;
  },
};
