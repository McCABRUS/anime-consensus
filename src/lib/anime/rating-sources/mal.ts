import type { CanonicalAnime } from "../types";

import type { RatingSource } from "./types";

import { createRating } from "../ratings";

const MAL_ENDPOINT = "https://api.myanimelist.net/v2/anime";

export const malRatingSource: RatingSource = {
  provider: "myanimelist",

  async getRating(anime: CanonicalAnime) {
    const id = anime.ids.mal;

    const clientId = process.env.MAL_CLIENT_ID;

    if (id === null || !clientId) {
      return null;
    }

    const response = await fetch(
      `${MAL_ENDPOINT}/${id}?fields=mean,num_scoring_users`,
      {
        headers: {
          "X-MAL-CLIENT-ID": clientId,

          Accept: "application/json",
        },

        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      mean?: number | null;
      num_scoring_users?: number | null;
    };

    if (typeof payload.mean !== "number") {
      return null;
    }

    return createRating(
      "myanimelist",
      payload.mean,
      10,
      payload.num_scoring_users ?? null,
    );
  },
};
