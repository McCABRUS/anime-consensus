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

    const result = await getKitsuRating(id);

    if (result === null) {
      return null;
    }

    const rating = createRating(
      "kitsu",
      result.score,
      100,
      result.voteCount > 0 ? result.voteCount : null,
    );

    if (!rating) {
      return null;
    }

    return rating;
  },
};
