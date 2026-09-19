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

  const primaryResults = await Promise.all(
    primaryProviders.map(async (provider) => {
      try {
        const results = await provider.search();

        return {
          provider: provider.name,
          results,
          failed: false,
        };
      } catch {
        console.warn(`[Anime Search] ${provider.name} request failed.`);

        return {
          provider: provider.name,
          results: [],
          failed: true,
        };
      }
    }),
  );

  const successfulResult = primaryResults.find(
    ({ results }) => results.length > 0,
  );

  if (successfulResult) {
    return successfulResult.results;
  }

  try {
    const results = await searchJikan(normalizedQuery);

    if (results.length > 0) {
      return results;
    }
  } catch {
    console.warn("[Anime Search] jikan request failed.");
  }

  return [];
}
