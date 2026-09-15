import type { AnimeRating, CanonicalAnime, RatingProvider } from "../types";

export type RatingSource = {
  provider: RatingProvider;

  getRating(anime: CanonicalAnime): Promise<AnimeRating | null>;
};
