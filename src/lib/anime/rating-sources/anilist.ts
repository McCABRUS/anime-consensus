import type { CanonicalAnime } from "../types";

import type { RatingSource } from "./types";

import { getAniListRating } from "../providers/anilist";

import { createRating } from "../ratings";

export const aniListRatingSource: RatingSource = {
  provider: "anilist",

  async getRating(anime: CanonicalAnime) {
    const id = anime.ids.anilist;

    if (id === null) {
      return null;
    }

    const result = await getAniListRating(id);

    if (result === null) {
      return null;
    }

    const rating = createRating(
      "anilist",
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
