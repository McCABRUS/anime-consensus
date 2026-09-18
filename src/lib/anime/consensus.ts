import type { AnimeRating } from "./types";

export type ConsensusResult = {
  score: number | null;
  ratingCount: number;
};

export function getRatingWeight(voteCount: number | null): number {
  if (voteCount === null || !Number.isFinite(voteCount) || voteCount <= 0) {
    return 1;
  }

  return Math.log1p(voteCount);
}

export function calculateConsensus(ratings: AnimeRating[]): ConsensusResult {
  const validRatings = ratings.filter((rating) =>
    Number.isFinite(rating.normalizedValue),
  );

  if (validRatings.length === 0) {
    return {
      score: null,
      ratingCount: 0,
    };
  }

  let weightedScore = 0;
  let totalWeight = 0;

  for (const rating of validRatings) {
    const weight = getRatingWeight(rating.voteCount);

    weightedScore += rating.normalizedValue * weight;

    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return {
      score: null,
      ratingCount: 0,
    };
  }

  return {
    score: weightedScore / totalWeight,

    ratingCount: validRatings.length,
  };
}
