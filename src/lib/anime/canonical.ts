import type {
  AnimeDetails,
  AnimeExternalIds,
  CanonicalAnime,
  ProviderIdentity,
} from "./types";

const STATUS_ALIASES: Record<string, string> = {
  FINISHED: "FINISHED",
  FINISH: "FINISHED",
  COMPLETE: "FINISHED",
  COMPLETED: "FINISHED",
  RELEASING: "RELEASING",
  AIRING: "RELEASING",
  CURRENTLY_AIRING: "RELEASING",
  NOT_YET_RELEASED: "NOT_YET_RELEASED",
  UPCOMING: "NOT_YET_RELEASED",
  NOT_RELEASED: "NOT_YET_RELEASED",
  CANCELLED: "CANCELLED",
  CANCELED: "CANCELLED",
  HIATUS: "HIATUS",
  ON_HIATUS: "HIATUS",
  PAUSED: "HIATUS",
};

function normalizeValue(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeStatus(value: string | null | undefined): string | null {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return null;
  }

  return STATUS_ALIASES[normalized] ?? normalized;
}

function normalizeCollection(values: string[]): string[] {
  const seen = new Map<string, string>();

  for (const value of values) {
    const normalized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (!normalized) {
      continue;
    }

    if (!seen.has(normalized)) {
      seen.set(normalized, value.trim());
    }
  }

  return Array.from(seen.values());
}

function normalizeDescription(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function createCanonicalId(anime: AnimeDetails): string {
  if (anime.reference.malId !== null) {
    return `mal-${anime.reference.malId}`;
  }

  return `${anime.reference.provider}-${anime.reference.id}`;
}

function mergeIdentities(
  identities: ProviderIdentity[],
  identity: ProviderIdentity,
): ProviderIdentity[] {
  const alreadyExists = identities.some(
    (existing) =>
      existing.provider === identity.provider && existing.id === identity.id,
  );

  if (alreadyExists) {
    return identities;
  }

  return [...identities, identity];
}

function createExternalIds(anime: AnimeDetails[]): AnimeExternalIds {
  const ids: AnimeExternalIds = {
    mal: null,
    anilist: null,
    kitsu: null,
    imdb: null,
    ann: null,
  };

  for (const item of anime) {
    const identity = item.reference;

    if (identity.provider === "jikan") {
      const malId = Number(identity.id);

      if (Number.isFinite(malId)) {
        ids.mal = malId;
      }
    }

    if (identity.provider === "anilist") {
      const aniListId = Number(identity.id);

      if (Number.isFinite(aniListId)) {
        ids.anilist = aniListId;
      }

      if (identity.malId !== null) {
        ids.mal = identity.malId;
      }
    }

    if (identity.provider === "kitsu") {
      ids.kitsu = identity.id;

      if (identity.malId !== null) {
        ids.mal = identity.malId;
      }
    }

    if (item.externalIds?.kitsu) {
      ids.kitsu = item.externalIds.kitsu;
    }

    if (item.externalIds?.ann) {
      ids.ann = item.externalIds.ann;
    }

    if (item.externalIds?.imdb) {
      ids.imdb = item.externalIds.imdb;
    }
  }

  return ids;
}

export function createCanonicalAnime(
  primary: AnimeDetails,
  related: AnimeDetails[] = [],
): CanonicalAnime {
  const allAnime = [primary, ...related];

  const identities = allAnime.reduce(
    (current, anime) => mergeIdentities(current, anime.reference),
    [] as ProviderIdentity[],
  );

  const ids = createExternalIds(allAnime);

  const findFirst = <T>(
    selector: (anime: AnimeDetails) => T | null | undefined,
  ): T | null => {
    for (const anime of allAnime) {
      const value = selector(anime);

      if (value !== null && value !== undefined && value !== "") {
        return value;
      }
    }

    return null;
  };

  const genres = normalizeCollection(allAnime.flatMap((anime) => anime.genres));

  const mainStudio = findFirst((anime) => anime.mainStudio);

  const productionCompanies = normalizeCollection(
    allAnime.flatMap((anime) => anime.productionCompanies ?? []),
  );

  const title = {
    romaji: findFirst((anime) => anime.title.romaji),

    english: findFirst((anime) => anime.title.english),

    native: findFirst((anime) => anime.title.native),

    synonyms: normalizeCollection(
      allAnime.flatMap((anime) => anime.title.synonyms),
    ),
  };

  const rawDescription = findFirst((anime) => anime.description);

  return {
    id: createCanonicalId(primary),

    ids,

    identities,

    title,

    description: normalizeDescription(rawDescription),

    coverImage: findFirst((anime) => anime.coverImage),

    bannerImage: findFirst((anime) => anime.bannerImage),

    color: findFirst((anime) => anime.color),

    format: findFirst((anime) => anime.format),

    status: normalizeStatus(findFirst((anime) => anime.status)),

    season: findFirst((anime) => anime.season),

    seasonYear: findFirst((anime) => anime.seasonYear),

    episodes: findFirst((anime) => anime.episodes),

    duration: findFirst((anime) => anime.duration),

    genres,

    mainStudio,

    productionCompanies,

    source: findFirst((anime) => anime.source),

    ratings: [],

    ratingSources: [],
  };
}
