import type { AnimeRating, RatingProvider } from "./types";

export type ConsensusContribution = {
  provider: RatingProvider;
  score: number;
  weight: number;
};

export type ConsensusResult = {
  score: number | null;
  sourceCount: number;
  ratingCount: number;
  providers: RatingProvider[];
  totalWeight: number;
  contributions: ConsensusContribution[];
};

export const DEFAULT_SOURCE_WEIGHTS: Record<RatingProvider, number> = {
  myanimelist: 1,
  anilist: 1,
  kitsu: 1,
  imdb: 1,
  animenewsnetwork: 1,
  crunchyroll: 1,
};

function isValidWeight(weight: number): boolean {
  return Number.isFinite(weight) && weight >= 0;
}

export function calculateConsensus(
  ratings: AnimeRating[],
  weights: Partial<Record<RatingProvider, number>> = {},
): ConsensusResult {
  const validRatings = ratings.filter((rating) =>
    Number.isFinite(rating.normalizedValue),
  );

  if (validRatings.length === 0) {
    return {
      score: null,
      sourceCount: 0,
      ratingCount: 0,
      providers: [],
      totalWeight: 0,
      contributions: [],
    };
  }

  const contributions = validRatings
    .map((rating) => {
      const weight =
        weights[rating.provider] ?? DEFAULT_SOURCE_WEIGHTS[rating.provider];

      if (!isValidWeight(weight) || weight === 0) {
        return null;
      }

      return {
        provider: rating.provider,

        score: rating.normalizedValue,

        weight,
      };
    })
    .filter(
      (contribution): contribution is ConsensusContribution =>
        contribution !== null,
    );

  if (contributions.length === 0) {
    return {
      score: null,
      sourceCount: 0,
      ratingCount: 0,
      providers: [],
      totalWeight: 0,
      contributions: [],
    };
  }

  const weightedTotal = contributions.reduce(
    (sum, contribution) => sum + contribution.score * contribution.weight,
    0,
  );

  const totalWeight = contributions.reduce(
    (sum, contribution) => sum + contribution.weight,
    0,
  );

  const score = weightedTotal / totalWeight;

  const count = contributions.length;

  return {
    score: Number(score.toFixed(2)),

    sourceCount: count,

    ratingCount: count,

    providers: contributions.map((contribution) => contribution.provider),

    totalWeight: Number(totalWeight.toFixed(2)),

    contributions,
  };
}
