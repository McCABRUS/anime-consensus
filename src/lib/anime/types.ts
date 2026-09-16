export type AnimeProvider = "jikan" | "anilist" | "kitsu";

export type RatingProvider =
  | "myanimelist"
  | "anilist"
  | "kitsu"
  | "imdb"
  | "animenewsnetwork"
  | "crunchyroll";

export type RatingSourceStatus = "available" | "unavailable" | "error";

export type ProviderIdentity = {
  provider: AnimeProvider;
  id: string;
  malId: number | null;
};

export type AnimeExternalIds = {
  mal: number | null;
  anilist: number | null;
  kitsu: string | null;
  imdb: string | null;
  ann: string | null;
};

export type LocalizedTitle = {
  romaji: string | null;
  english: string | null;
  native: string | null;
  synonyms: string[];
};

export type AnimeSearchResult = {
  id: string | number;
  malId: number | null;
  provider: AnimeProvider;
  title: LocalizedTitle;
  coverImage: string | null;
  color: string | null;
  seasonYear: number | null;
  format: string | null;
  episodes: number | null;
  score: number | null;
};

export type AnimeRating = {
  provider: RatingProvider;
  value: number;
  scale: number;
  normalizedValue: number;
  voteCount: number | null;
  fetchedAt: string;
  sourceUrl?: string;
};

export type AnimeRatingSource = {
  provider: RatingProvider;
  status: RatingSourceStatus;
  rating: AnimeRating | null;
};

export type AnimeDetails = {
  reference: ProviderIdentity;

  externalIds?: Partial<AnimeExternalIds>;

  title: LocalizedTitle;

  description: string | null;

  coverImage: string | null;

  bannerImage: string | null;

  color: string | null;

  format: string | null;

  status: string | null;

  season: string | null;

  seasonYear: number | null;

  episodes: number | null;

  duration: number | null;

  genres: string[];

  studios: string[];

  mainStudio?: string | null;

  productionCompanies?: string[];

  source: string | null;

  popularity: number | null;
};

export type CanonicalAnime = {
  id: string;

  ids: AnimeExternalIds;

  identities: ProviderIdentity[];

  title: LocalizedTitle;

  description: string | null;

  coverImage: string | null;

  bannerImage: string | null;

  color: string | null;

  format: string | null;

  status: string | null;

  season: string | null;

  seasonYear: number | null;

  episodes: number | null;

  duration: number | null;

  genres: string[];

  mainStudio: string | null;

  productionCompanies: string[];

  source: string | null;

  ratings: AnimeRating[];

  ratingSources: AnimeRatingSource[];
};
