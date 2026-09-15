import { searchAniList } from "./providers/anilist";

import { searchJikan } from "./providers/jikan";

import { searchKitsu } from "./providers/kitsu";

import type { AnimeSearchResult } from "./types";

export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const providers = [
    {
      name: "jikan",
      search: () => searchJikan(normalizedQuery),
    },

    {
      name: "anilist",
      search: () => searchAniList(normalizedQuery),
    },

    {
      name: "kitsu",
      search: () => searchKitsu(normalizedQuery),
    },
  ] as const;

  for (const provider of providers) {
    try {
      const results = await provider.search();

      if (results.length > 0) {
        console.log(
          `[Anime Search] Provider "${provider.name}" returned ${results.length} results.`,
        );

        return results;
      }

      console.warn(
        `[Anime Search] Provider "${provider.name}" returned no results.`,
      );
    } catch (error) {
      console.warn(`[Anime Search] Provider "${provider.name}" failed:`, error);
    }
  }

  return [];
}
