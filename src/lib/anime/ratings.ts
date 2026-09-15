import type { AnimeRating, RatingProvider } from "./types";

export function normalizeRating(value: number, scale: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(scale) || scale <= 0) {
    throw new Error("Invalid rating value or scale.");
  }

  return Number(((value / scale) * 10).toFixed(4));
}

export function createRating(
  provider: RatingProvider,
  value: number | null | undefined,
  scale: number,
  voteCount: number | null = null,
): AnimeRating | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return {
    provider,

    value,

    scale,

    normalizedValue: normalizeRating(value, scale),

    voteCount,

    fetchedAt: new Date().toISOString(),
  };
}
