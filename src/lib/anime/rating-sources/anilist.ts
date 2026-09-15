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

    const score = await getAniListRating(id);

    if (score === null) {
      return null;
    }

    return createRating("anilist", score, 100, null);
  },
};
