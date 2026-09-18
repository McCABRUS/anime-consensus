import { searchAniList } from "./providers/anilist";

import { searchJikan } from "./providers/jikan";

import { searchKitsu } from "./providers/kitsu";

import type { AnimeSearchResult } from "./types";

export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const primaryProviders = [
    {
      name: "anilist",
      search: () => searchAniList(normalizedQuery),
    },
    {
      name: "kitsu",
      search: () => searchKitsu(normalizedQuery),
    },
  ] as const;

  try {
    const result = await Promise.any(
      primaryProviders.map(async (provider) => {
        try {
          const results = await provider.search();

          if (results.length === 0) {
            throw new Error("No results");
          }

          console.log(
            `[Anime Search] Provider "${provider.name}" returned ${results.length} results.`,
          );

          return results;
        } catch (error) {
          console.warn(
            `[Anime Search] Provider "${provider.name}" failed:`,
            error,
          );

          throw error;
        }
      }),
    );

    return result;
  } catch {
    try {
      const results = await searchJikan(normalizedQuery);

      if (results.length > 0) {
        console.log(
          `[Anime Search] Provider "jikan" returned ${results.length} results.`,
        );

        return results;
      }

      console.warn('[Anime Search] Provider "jikan" returned no results.');
    } catch (error) {
      console.warn('[Anime Search] Provider "jikan" failed:', error);
    }
  }

  return [];
}
