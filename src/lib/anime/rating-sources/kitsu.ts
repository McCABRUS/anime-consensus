import type { CanonicalAnime } from "../types";

import type { RatingSource } from "./types";

import { getKitsuRating } from "../providers/kitsu";

import { createRating } from "../ratings";

export const kitsuRatingSource: RatingSource = {
  provider: "kitsu",

  async getRating(anime: CanonicalAnime) {
    const id = anime.ids.kitsu;

    if (!id) {
      return null;
    }

    const score = await getKitsuRating(id);

    if (score === null) {
      return null;
    }

    return createRating("kitsu", score, 100, null);
  },
};
