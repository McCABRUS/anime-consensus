export type AnimeSearchResult = {
  id: number | string;

  malId: number | null;
  provider: "jikan" | "anilist" | "kitsu";

  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
    synonyms: string[];
  };

  coverImage: string | null;
  color: string | null;

  seasonYear: number | null;
  format: string | null;
  episodes: number | null;

  score: number | null;
};
