import { getAniListAnime } from "./providers/anilist";

import { getJikanAnime } from "./providers/jikan";

import { getKitsuAnime } from "./providers/kitsu";

import type { AnimeDetails, AnimeProvider } from "./types";

export async function getAnimeDetails(
  provider: AnimeProvider,
  id: string,
): Promise<AnimeDetails | null> {
  switch (provider) {
    case "anilist":
      return getAniListAnime(Number(id));

    case "jikan":
      return getJikanAnime(id);

    case "kitsu":
      return getKitsuAnime(id);

    default:
      throw new Error(
        `Anime detail provider "${provider}" is not implemented.`,
      );
  }
}
