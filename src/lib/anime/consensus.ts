import type { AnimeRating } from "./types";

export type ConsensusResult = {
  score: number | null;
  ratingCount: number;
  providers: string[];
};

export function calculateConsensus(ratings: AnimeRating[]): ConsensusResult {
  const validRatings = ratings.filter((rating) =>
    Number.isFinite(rating.normalizedValue),
  );

  if (validRatings.length === 0) {
    return {
      score: null,
      ratingCount: 0,
      providers: [],
    };
  }

  const total = validRatings.reduce(
    (sum, rating) => sum + rating.normalizedValue,
    0,
  );

  const score = total / validRatings.length;

  return {
    score: Number(score.toFixed(2)),

    ratingCount: validRatings.length,

    providers: validRatings.map((rating) => rating.provider),
  };
}
