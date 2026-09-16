import type { CanonicalAnime } from "../types";

import type { RatingSource } from "./types";

import { createRating } from "../ratings";

const ANN_ENDPOINT = "https://cdn.animenewsnetwork.com/encyclopedia/api.xml";

function parseAttribute(xml: string, attribute: string): string | null {
  const match = xml.match(new RegExp(`${attribute}="([^"]+)"`, "i"));

  return match?.[1] ?? null;
}

export const annRatingSource: RatingSource = {
  provider: "animenewsnetwork",

  async getRating(anime: CanonicalAnime) {
    const annId = anime.ids.ann;

    if (!annId) {
      return null;
    }

    const response = await fetch(
      `${ANN_ENDPOINT}?anime=${encodeURIComponent(annId)}`,
      {
        headers: {
          Accept: "application/xml,text/xml",

          "User-Agent":
            "AnimeConsensus/0.1 (+https://anime-consensus.vercel.app)",
        },

        next: {
          revalidate: 300,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const xml = await response.text();

    const ratingsMatch = xml.match(/<ratings\b[^>]*\/?>/i);

    if (!ratingsMatch) {
      return null;
    }

    const ratings = ratingsMatch[0];

    const weightedScore = parseAttribute(ratings, "weighted_score");

    const voteCount = parseAttribute(ratings, "nb_votes");

    const score = Number(weightedScore);

    if (!Number.isFinite(score)) {
      return null;
    }

    const parsedVotes = voteCount !== null ? Number(voteCount) : null;

    const rating = createRating(
      "animenewsnetwork",
      score,
      10,
      parsedVotes !== null && Number.isFinite(parsedVotes) ? parsedVotes : null,
    );

    if (!rating) {
      return null;
    }

    return {
      ...rating,
      sourceUrl: `https://www.animenewsnetwork.com/encyclopedia/anime.php?id=${annId}`,
    };
  },
};
