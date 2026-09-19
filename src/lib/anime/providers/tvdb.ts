import type {
  AnimeLocalizedMetadata,
  LocalizedMetadata,
  LocalizedTitle,
} from "../types";

const TVDB_ENDPOINT = "https://api4.thetvdb.com/v4";

type TVDBLoginResponse = {
  data?: {
    token?: string;
  };
};

type TVDBTranslation = {
  language?: string | null;
  name?: string | null;
  overview?: string | null;
};

type TVDBExtendedResponse = {
  data?: {
    id?: number;
    name?: string | null;
    year?: string | number | null;
    firstAired?: string | null;
    lastAired?: string | null;
    remoteIds?: Array<{
      id?: string | null;
      type?: string | number | null;
      sourceName?: string | null;
    }>;
    companies?: Array<{
      name?: string | null;
      companyName?: string | null;
      id?: number | null;
    }>;
    translations?: {
      nameTranslations?: Array<{
        language?: string | null;
        name?: string | null;
      }>;
      overviewTranslations?: Array<{
        language?: string | null;
        overview?: string | null;
      }>;
    };
    nameTranslations?: Array<{
      language?: string | null;
      name?: string | null;
    }>;
    overviewTranslations?: Array<{
      language?: string | null;
      overview?: string | null;
    }>;
    seasons?: TVDBSeasonBase[];
  };
};

type TVDBTranslationResponse = {
  data?: TVDBTranslation | TVDBTranslation[];
};

type TVDBSeasonBase = {
  id?: number | null;
  name?: string | null;
  number?: number | null;
  year?: string | number | null;
  seriesId?: number | null;
  type?:
    | {
        id?: number | null;
        name?: string | null;
        type?: string | null;
      }
    | number
    | null;
};

type TVDBSeasonExtendedResponse = {
  data?: TVDBSeasonBase & {
    nameTranslations?: Array<{
      language?: string | null;
      name?: string | null;
    }>;
    overviewTranslations?: Array<{
      language?: string | null;
      overview?: string | null;
    }>;
    translations?: {
      nameTranslations?: Array<{
        language?: string | null;
        name?: string | null;
      }>;
      overviewTranslations?: Array<{
        language?: string | null;
        overview?: string | null;
      }>;
    };
  };
};

type TVDBSearchResult = {
  id?: string | number;
  objectID?: string;
  tvdb_id?: string | number;
  name?: string | null;
  type?: string | null;

  translations?: unknown;

  overviews?: unknown;

  aliases?: Array<{
    language?: string | null;
    name?: string | null;
  }>;
};

type TVDBSearchResponse = {
  data?: TVDBSearchResult[];
};

type TVDBResolvedContent = {
  type: "series" | "movie";
  id: string;
  name: string | null;
  metadata: AnimeLocalizedMetadata;
  score: number;
};

type TVDBMatchContext = {
  format: string | null;
  seasonYear: number | null;
  studios: string[];
  productionCompanies: string[];
};

type TVDBMatchCandidate = {
  type: "series" | "movie";
  id: string;
  name: string | null;
  year: number | null;
  score: number;
  titleScore: number;
  yearScore: number;
  companyScore: number;
  seasonScore: number;
  seasonId: string | null;
  seasonNumber: number | null;
};

let tokenPromise: Promise<string | null> | null = null;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

async function getTVDBToken(): Promise<string | null> {
  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    const apiKey = process.env.TVDB_API_KEY;

    if (!apiKey) {
      console.error("[TheTVDB] TVDB_API_KEY is not configured.");

      return null;
    }

    try {
      const response = await fetch(`${TVDB_ENDPOINT}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apikey: apiKey,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(
          `[TheTVDB] Login failed: ${response.status} ${response.statusText}`,
        );

        return null;
      }

      const payload = (await response.json()) as TVDBLoginResponse;

      const token = payload.data?.token ?? null;

      if (!token) {
        console.error("[TheTVDB] Login response did not include a token.");
      }

      return token;
    } catch (error) {
      console.error(
        `[TheTVDB] Login request failed: ${getErrorMessage(error)}`,
      );

      return null;
    }
  })();

  return tokenPromise;
}

async function tvdbFetch<T>(
  path: string,
  options?: { suppressNotFound?: boolean },
): Promise<T | null> {
  const token = await getTVDBToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${TVDB_ENDPOINT}${path}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      if (response.status === 404 && options?.suppressNotFound) {
        return null;
      }

      console.error(
        `[TheTVDB] Request failed: ${response.status} ${response.statusText} ${path}`,
      );

      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(
      `[TheTVDB] Request failed before receiving a response for ${path}: ${getErrorMessage(error)}`,
    );

    return null;
  }
}

function normalizeTitle(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function extractStringValues(value: unknown): string[] {
  if (typeof value === "string") {
    return value.trim().length > 0 ? [value.trim()] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractStringValues(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.values(value).flatMap((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;

      if (typeof record.name === "string") {
        return extractStringValues(record.name);
      }
    }

    return extractStringValues(item);
  });
}

function getSearchResultNames(result: TVDBSearchResult): string[] {
  return Array.from(
    new Set([
      ...extractStringValues(result.name),
      ...extractStringValues(result.translations),
      ...(result.aliases ?? [])
        .map((alias) => alias.name ?? null)
        .filter((name): name is string => Boolean(name?.trim())),
    ]),
  );
}

function getExpectedTVDBTypes(
  format: string | null,
): Array<"series" | "movie"> {
  switch (format?.toUpperCase()) {
    case "MOVIE":
      return ["movie"];

    case "TV":
    case "TV_SHORT":
    case "OVA":
    case "ONA":
    case "SPECIAL":
      return ["series"];

    case "MUSIC":
      // AniList uses MUSIC for music videos, but TheTVDB may catalog
      // the same work as either a movie or a series. Keep both candidates
      // available and let the identity matcher use year/title/season/etc.
      return ["series", "movie"];

    default:
      return ["series", "movie"];
  }
}

function getTVDBCompanyNames(companies: unknown): string[] {
  if (!companies) {
    return [];
  }

  const extract = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const record = item as Record<string, unknown>;
      const name =
        typeof record.name === "string"
          ? record.name
          : typeof record.companyName === "string"
            ? record.companyName
            : null;

      return name?.trim() ? [name.trim()] : [];
    });
  };

  if (Array.isArray(companies)) {
    return extract(companies);
  }

  if (typeof companies !== "object") {
    return [];
  }

  return Object.values(companies).flatMap((value) => extract(value));
}

function getExtendedAliases(data: unknown): string[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const aliases = (
    data as {
      aliases?: Array<{ name?: string | null }>;
    }
  ).aliases;

  return (aliases ?? [])
    .map((alias) => alias.name?.trim() ?? "")
    .filter((name) => name.length > 0);
}

function getExtendedTranslationNames(data: unknown): string[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const value = data as {
    translations?: {
      nameTranslations?: Array<{ name?: string | null }>;
    };
    nameTranslations?: Array<{ name?: string | null }>;
  };

  return [
    ...(value.translations?.nameTranslations ?? []),
    ...(value.nameTranslations ?? []),
  ]
    .map((translation) => translation.name?.trim() ?? "")
    .filter((name) => name.length > 0);
}

function getExtendedCandidateNames(
  result: TVDBSearchResult,
  data: unknown,
): string[] {
  const dataName =
    data &&
    typeof data === "object" &&
    typeof (data as { name?: unknown }).name === "string"
      ? (data as { name: string }).name
      : null;

  return Array.from(
    new Set(
      [
        ...getSearchResultNames(result),
        ...getExtendedTranslationNames(data),
        ...getExtendedAliases(data),
        dataName,
      ].filter((name): name is string => Boolean(name?.trim())),
    ),
  );
}

function calculateFallbackTitleScore(
  title: LocalizedTitle,
  candidateNames: string[],
): number {
  let bestScore = 0;

  for (const animeTitle of getTitleCandidates(title)) {
    const score = calculateMatchScore(animeTitle, {
      name: null,
      translations: Object.fromEntries(
        candidateNames.map((name, index) => [`candidate-${index}`, name]),
      ),
    });

    if (score >= 100) {
      bestScore = Math.max(bestScore, 60);
    } else if (score >= 80) {
      bestScore = Math.max(bestScore, 48);
    } else {
      bestScore = Math.max(bestScore, score);
    }
  }

  return bestScore;
}

function calculateCompanyScore(
  animeCompanies: string[],
  tvdbCompanies: string[],
): number {
  if (animeCompanies.length === 0 || tvdbCompanies.length === 0) {
    return 0;
  }

  const normalize = (value: string) =>
    normalizeTitle(value)
      .replace(/\bstudio\b/g, "")
      .trim();

  const animeCompaniesNormalized = new Set(
    animeCompanies.map(normalize).filter((value) => value.length > 0),
  );
  const tvdbCompaniesNormalized = tvdbCompanies
    .map(normalize)
    .filter((value) => value.length > 0);

  return tvdbCompaniesNormalized.some((company) =>
    animeCompaniesNormalized.has(company),
  )
    ? 15
    : 0;
}

function getCandidateYear(data: unknown): number | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const value = data as {
    year?: string | number | null;
    firstAired?: string | null;
  };

  if (typeof value.year === "number" && Number.isFinite(value.year)) {
    return value.year;
  }

  if (typeof value.year === "string" && /^\d{4}$/.test(value.year)) {
    return Number(value.year);
  }

  if (typeof value.firstAired === "string") {
    const match = value.firstAired.match(/^(\d{4})/);

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

type TVDBSeasonMatch = {
  id: string;
  number: number | null;
  year: number | null;
  titleScore: number;
  yearScore: number;
  metadata: AnimeLocalizedMetadata | null;
};

function getSeasonCandidateNames(
  season: TVDBSeasonBase,
  data?: TVDBSeasonExtendedResponse["data"],
): string[] {
  const values = [
    season.name,
    data?.name,
    ...(data?.translations?.nameTranslations ?? []).map(
      (translation) => translation.name ?? null,
    ),
    ...(data?.nameTranslations ?? []).map(
      (translation) => translation.name ?? null,
    ),
  ];

  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      ),
    ),
  );
}

function getSeasonYear(
  season: TVDBSeasonBase | TVDBSeasonExtendedResponse["data"],
): number | null {
  if (!season) {
    return null;
  }

  const year = season.year;

  if (typeof year === "number" && Number.isFinite(year)) {
    return year;
  }

  if (typeof year === "string" && /^\d{4}$/.test(year)) {
    return Number(year);
  }

  return null;
}

async function resolveTVDBSeasonMetadata(
  seasonId: string,
  languageCodes: Record<string, string>,
): Promise<AnimeLocalizedMetadata | null> {
  const payload = await tvdbFetch<TVDBSeasonExtendedResponse>(
    `/seasons/${encodeURIComponent(seasonId)}/extended?meta=translations`,
  );

  const data = payload?.data;

  if (!data) {
    return null;
  }

  const nameTranslations =
    data.translations?.nameTranslations ?? data.nameTranslations ?? [];
  const overviewTranslations =
    data.translations?.overviewTranslations ?? data.overviewTranslations ?? [];

  const metadata = buildLocalizedMetadata(
    languageCodes,
    nameTranslations,
    overviewTranslations,
  );

  const localizedMetadata: AnimeLocalizedMetadata =
    metadata ??
    ({
      source: "tvdb",
      translations: {},
    } satisfies AnimeLocalizedMetadata);

  for (const [locale, languageCode] of Object.entries(languageCodes)) {
    if (localizedMetadata.translations[locale]?.overview) {
      continue;
    }

    const directTranslation = await tvdbFetch<TVDBTranslationResponse>(
      `/seasons/${encodeURIComponent(
        seasonId,
      )}/translations/${encodeURIComponent(languageCode)}`,
      { suppressNotFound: true },
    );

    if (!directTranslation?.data) {
      continue;
    }

    const translation = Array.isArray(directTranslation.data)
      ? (directTranslation.data.find(
          (item) => item.language === languageCode,
        ) ??
        directTranslation.data[0] ??
        null)
      : directTranslation.data;

    if (!translation) {
      continue;
    }

    const translatedTitle = translation.name?.trim() || null;
    const translatedOverview = translation.overview?.trim() || null;

    if (!translatedTitle && !translatedOverview) {
      continue;
    }

    localizedMetadata.translations[locale] = {
      title: translatedTitle,
      overview: translatedOverview,
    };
  }

  return Object.keys(localizedMetadata.translations).length > 0
    ? localizedMetadata
    : null;
}

async function findTVDBSeasonMatch(
  title: LocalizedTitle,
  context: TVDBMatchContext,
  languageCodes: Record<string, string>,
  seriesData: TVDBExtendedResponse["data"],
): Promise<TVDBSeasonMatch | null> {
  const seasons = seriesData?.seasons ?? [];

  if (seasons.length === 0) {
    return null;
  }

  const preliminary = seasons
    .filter((season) => season.id !== null && season.id !== undefined)
    .map((season) => {
      const year = getSeasonYear(season);
      const yearDifference =
        context.seasonYear !== null && year !== null
          ? Math.abs(context.seasonYear - year)
          : null;

      if (yearDifference !== null && yearDifference > 1) {
        return null;
      }

      return {
        season,
        titleScore: 0,
        year,
        yearDifference,
      };
    })
    .filter(
      (
        value,
      ): value is {
        season: TVDBSeasonBase;
        titleScore: number;
        year: number | null;
        yearDifference: number | null;
      } => value !== null,
    )
    .sort((a, b) => {
      const aYearScore =
        a.yearDifference === null ? 0 : a.yearDifference === 0 ? 25 : 15;
      const bYearScore =
        b.yearDifference === null ? 0 : b.yearDifference === 0 ? 25 : 15;

      return bYearScore - aYearScore;
    })
    .slice(0, 10);

  if (preliminary.length === 0) {
    return null;
  }

  const evaluated = await Promise.all(
    preliminary.map(async (candidate) => {
      const seasonId = String(candidate.season.id);

      const payload = await tvdbFetch<TVDBSeasonExtendedResponse>(
        `/seasons/${encodeURIComponent(seasonId)}/extended?meta=translations`,
      );

      const data = payload?.data;

      if (!data) {
        return null;
      }

      const names = getSeasonCandidateNames(candidate.season, data);
      const titleScore = calculateFallbackTitleScore(title, names);
      const year = getSeasonYear(data) ?? candidate.year;
      const yearDifference =
        context.seasonYear !== null && year !== null
          ? Math.abs(context.seasonYear - year)
          : null;

      if (yearDifference !== null && yearDifference > 1) {
        return null;
      }

      const yearScore =
        yearDifference === null ? 0 : yearDifference === 0 ? 25 : 15;

      const metadata = await resolveTVDBSeasonMetadata(seasonId, languageCodes);

      return {
        id: seasonId,
        number:
          typeof data.number === "number"
            ? data.number
            : (candidate.season.number ?? null),
        year,
        titleScore,
        yearScore,
        metadata,
      };
    }),
  );

  const valid = evaluated
    .filter(
      (
        value,
      ): value is {
        id: string;
        number: number | null;
        year: number | null;
        titleScore: number;
        yearScore: number;
        metadata: AnimeLocalizedMetadata | null;
      } => value !== null && value.titleScore >= 45,
    )
    .sort((a, b) => b.titleScore + b.yearScore - (a.titleScore + a.yearScore));

  const best = valid[0];

  if (!best) {
    return null;
  }

  return {
    id: best.id,
    number: best.number,
    year: best.year,
    titleScore: best.titleScore,
    yearScore: best.yearScore,
    metadata: best.metadata,
  };
}

async function evaluateFallbackCandidate(
  title: LocalizedTitle,
  languageCodes: Record<string, string>,
  context: TVDBMatchContext,
  candidate: {
    type: "series" | "movie";
    result: TVDBSearchResult;
    data: unknown;
    id: string;
  },
): Promise<TVDBMatchCandidate | null> {
  const expectedTypes = getExpectedTVDBTypes(context.format);

  if (!expectedTypes.includes(candidate.type)) {
    return null;
  }

  const names = getExtendedCandidateNames(candidate.result, candidate.data);
  const titleScore = calculateFallbackTitleScore(title, names);

  if (titleScore < 45) {
    return null;
  }

  const candidateYear = getCandidateYear(candidate.data);
  let yearScore = 0;

  if (context.seasonYear !== null && candidateYear !== null) {
    const difference = Math.abs(context.seasonYear - candidateYear);

    if (difference <= 1) {
      yearScore = difference === 0 ? 25 : 15;
    }
  }

  const companyScore = calculateCompanyScore(
    [...context.studios, ...context.productionCompanies],
    getTVDBCompanyNames(
      candidate.data && typeof candidate.data === "object"
        ? (candidate.data as { companies?: unknown }).companies
        : undefined,
    ),
  );

  const dataName =
    candidate.data &&
    typeof candidate.data === "object" &&
    typeof (candidate.data as { name?: unknown }).name === "string"
      ? (candidate.data as { name: string }).name
      : null;

  let seasonScore = 0;
  let seasonId: string | null = null;
  let seasonNumber: number | null = null;

  if (candidate.type === "series") {
    const seasonMatch = await findTVDBSeasonMatch(
      title,
      context,
      languageCodes,
      candidate.data as TVDBExtendedResponse["data"],
    );

    if (seasonMatch) {
      seasonId = seasonMatch.id;
      seasonNumber = seasonMatch.number;
      seasonScore = seasonMatch.titleScore + seasonMatch.yearScore;
    } else if (
      context.seasonYear !== null &&
      candidateYear !== null &&
      Math.abs(context.seasonYear - candidateYear) > 1
    ) {
      return null;
    }
  } else if (
    context.seasonYear !== null &&
    candidateYear !== null &&
    Math.abs(context.seasonYear - candidateYear) > 1
  ) {
    return null;
  }

  return {
    type: candidate.type,
    id: candidate.id,
    name: dataName ?? candidate.result.name ?? null,
    year: candidateYear,
    titleScore,
    yearScore,
    companyScore,
    seasonScore,
    seasonId,
    seasonNumber,
    score:
      titleScore + 10 + yearScore + companyScore + (seasonId ? seasonScore : 0),
  };
}

function calculateMatchScore(
  animeTitle: string,
  result: TVDBSearchResult,
): number {
  const normalizedAnimeTitle = normalizeTitle(animeTitle);

  if (!normalizedAnimeTitle) {
    return 0;
  }

  const resultNames = getSearchResultNames(result);

  let bestScore = 0;

  for (const name of resultNames) {
    const normalizedName = normalizeTitle(name);

    if (!normalizedName) {
      continue;
    }

    if (normalizedName === normalizedAnimeTitle) {
      bestScore = Math.max(bestScore, 100);
      continue;
    }

    if (
      normalizedName.includes(normalizedAnimeTitle) ||
      normalizedAnimeTitle.includes(normalizedName)
    ) {
      bestScore = Math.max(bestScore, 80);
      continue;
    }

    const animeWords = new Set(normalizedAnimeTitle.split(" "));
    const resultWords = new Set(normalizedName.split(" "));

    const intersection = [...animeWords].filter((word) =>
      resultWords.has(word),
    );

    const similarity =
      Math.min(
        intersection.length / Math.max(animeWords.size, 1),
        intersection.length / Math.max(resultWords.size, 1),
      ) * 60;

    bestScore = Math.max(bestScore, similarity);
  }

  return bestScore;
}

function buildLocalizedMetadata(
  languageCodes: Record<string, string>,
  nameTranslations: Array<{
    language?: string | null;
    name?: string | null;
  }>,
  overviewTranslations: Array<{
    language?: string | null;
    overview?: string | null;
  }>,
): AnimeLocalizedMetadata | null {
  const namesByLanguage = new Map<string, string>();
  const overviewsByLanguage = new Map<string, string>();

  for (const translation of nameTranslations) {
    if (
      translation.language &&
      translation.name &&
      translation.name.trim().length > 0
    ) {
      namesByLanguage.set(translation.language, translation.name.trim());
    }
  }

  for (const translation of overviewTranslations) {
    if (
      translation.language &&
      translation.overview &&
      translation.overview.trim().length > 0
    ) {
      overviewsByLanguage.set(
        translation.language,
        translation.overview.trim(),
      );
    }
  }

  const localizedMetadata: Record<string, LocalizedMetadata> = {};

  for (const [locale, languageCode] of Object.entries(languageCodes)) {
    const localizedTitle = namesByLanguage.get(languageCode) ?? null;
    const localizedOverview = overviewsByLanguage.get(languageCode) ?? null;

    if (!localizedTitle && !localizedOverview) {
      continue;
    }

    localizedMetadata[locale] = {
      title: localizedTitle,
      overview: localizedOverview,
    };
  }

  if (Object.keys(localizedMetadata).length === 0) {
    return null;
  }

  return {
    source: "tvdb",
    translations: localizedMetadata,
  };
}

function getExtendedTranslations(payload: TVDBExtendedResponse | null): {
  nameTranslations: Array<{
    language?: string | null;
    name?: string | null;
  }>;
  overviewTranslations: Array<{
    language?: string | null;
    overview?: string | null;
  }>;
} {
  const data = payload?.data;

  if (!data) {
    return {
      nameTranslations: [],
      overviewTranslations: [],
    };
  }

  return {
    nameTranslations:
      data.translations?.nameTranslations ?? data.nameTranslations ?? [],

    overviewTranslations:
      data.translations?.overviewTranslations ??
      data.overviewTranslations ??
      [],
  };
}

async function getDirectTranslation(
  type: "series" | "movie",
  id: string,
  languageCode: string,
): Promise<TVDBTranslation | null> {
  const payload = await tvdbFetch<TVDBTranslationResponse>(
    `/${type === "movie" ? "movies" : "series"}/${encodeURIComponent(
      id,
    )}/translations/${encodeURIComponent(languageCode)}`,
    { suppressNotFound: true },
  );

  if (!payload?.data) {
    return null;
  }

  if (Array.isArray(payload.data)) {
    return (
      payload.data.find(
        (translation) => translation.language === languageCode,
      ) ??
      payload.data[0] ??
      null
    );
  }

  return payload.data;
}

async function resolveTVDBContent(
  type: "series" | "movie",
  id: string,
  title: LocalizedTitle,
  languageCodes: Record<string, string>,
): Promise<TVDBResolvedContent | null> {
  const payload = await tvdbFetch<TVDBExtendedResponse>(
    `/${type === "movie" ? "movies" : "series"}/${encodeURIComponent(
      id,
    )}/extended?meta=translations`,
    {
      suppressNotFound: true,
    },
  );

  if (!payload?.data) {
    return null;
  }

  const { nameTranslations, overviewTranslations } =
    getExtendedTranslations(payload);

  const metadata = buildLocalizedMetadata(
    languageCodes,
    nameTranslations,
    overviewTranslations,
  );

  const candidateName = payload.data.name ?? null;

  const score = calculateMatchScore(
    title.english ?? title.romaji ?? title.native ?? title.synonyms[0] ?? "",
    {
      name: candidateName,
      translations: Object.fromEntries(
        nameTranslations
          .filter((translation) => translation.language && translation.name)
          .map((translation) => [
            translation.language as string,
            translation.name as string,
          ]),
      ),
    },
  );

  const localizedMetadataResult =
    metadata ??
    ({
      source: "tvdb",
      translations: {},
    } satisfies AnimeLocalizedMetadata);

  for (const [locale, languageCode] of Object.entries(languageCodes)) {
    const existingTranslation = localizedMetadataResult.translations[locale];

    if (existingTranslation?.title && existingTranslation?.overview) {
      continue;
    }

    const directTranslation = await getDirectTranslation(
      type,
      id,
      languageCode,
    );

    if (!directTranslation) {
      continue;
    }

    const translatedTitle = directTranslation.name?.trim() || null;

    const translatedOverview = directTranslation.overview?.trim() || null;

    if (!translatedTitle && !translatedOverview) {
      continue;
    }

    localizedMetadataResult.translations[locale] = {
      title: translatedTitle,
      overview: translatedOverview,
    };
  }

  if (Object.keys(localizedMetadataResult.translations).length === 0) {
    return null;
  }

  return {
    type,
    id,
    name: candidateName,
    metadata: localizedMetadataResult,
    score,
  };
}

async function resolveTVDBId(
  tvdbId: string,
  title: LocalizedTitle,
  languageCodes: Record<string, string>,
): Promise<TVDBResolvedContent | null> {
  const candidates = await Promise.all([
    resolveTVDBContent("series", tvdbId, title, languageCodes),
    resolveTVDBContent("movie", tvdbId, title, languageCodes),
  ]);

  const validCandidates = candidates.filter(
    (candidate): candidate is TVDBResolvedContent => candidate !== null,
  );

  if (validCandidates.length === 0) {
    return null;
  }

  validCandidates.sort((a, b) => b.score - a.score);

  const best = validCandidates[0];

  if (best.score < 60) {
    return null;
  }

  return best;
}

function getTitleCandidates(title: LocalizedTitle): string[] {
  return Array.from(
    new Set(
      [title.english, title.romaji, title.native, ...title.synonyms]
        .map((value) => value?.trim() ?? "")
        .filter((value) => value.length > 0),
    ),
  );
}

function getSearchCandidateId(result: TVDBSearchResult): string | null {
  const rawId = result.tvdb_id ?? result.id;

  if (rawId === undefined || rawId === null) {
    return null;
  }

  const value = String(rawId).trim();

  if (!value) {
    return null;
  }

  return value.replace(/^(?:series|movie)-/i, "");
}

async function findTVDBMatch(
  title: LocalizedTitle,
  languageCodes: Record<string, string>,
  context: TVDBMatchContext,
): Promise<TVDBMatchCandidate | null> {
  const titleCandidates = getTitleCandidates(title);
  const expectedTypes = getExpectedTVDBTypes(context.format);
  const uniqueResults = new Map<
    string,
    TVDBSearchResult & { searchQuery: string }
  >();

  for (const query of titleCandidates) {
    const payloads = await Promise.all(
      expectedTypes.map((type) =>
        tvdbFetch<TVDBSearchResponse>(
          `/search?query=${encodeURIComponent(query)}&type=${type}`,
        ),
      ),
    );

    for (const payload of payloads) {
      for (const result of payload?.data?.slice(0, 5) ?? []) {
        if (result.type !== "series" && result.type !== "movie") {
          continue;
        }

        const candidateId = getSearchCandidateId(result);

        if (!candidateId || !expectedTypes.includes(result.type)) {
          continue;
        }

        const preliminaryTitleScore = calculateFallbackTitleScore(
          title,
          getSearchResultNames(result),
        );

        if (preliminaryTitleScore < 45) {
          continue;
        }

        const key = `${result.type}:${candidateId}`;

        if (!uniqueResults.has(key)) {
          uniqueResults.set(key, { ...result, searchQuery: query });
        }
      }
    }
  }

  if (uniqueResults.size === 0) {
    return null;
  }

  const evaluatedCandidates = (
    await Promise.all(
      Array.from(uniqueResults.values()).map(async (candidate) => {
        const id = getSearchCandidateId(candidate);

        if (
          !id ||
          (candidate.type !== "series" && candidate.type !== "movie")
        ) {
          return null;
        }

        const payload = await tvdbFetch<TVDBExtendedResponse>(
          `/${candidate.type === "movie" ? "movies" : "series"}/${encodeURIComponent(
            id,
          )}/extended?meta=translations`,
        );

        if (!payload?.data) {
          return null;
        }

        return evaluateFallbackCandidate(title, languageCodes, context, {
          type: candidate.type,
          result: candidate,
          data: payload.data,
          id,
        });
      }),
    )
  ).filter((candidate): candidate is TVDBMatchCandidate => candidate !== null);

  evaluatedCandidates.sort((a, b) => b.score - a.score);

  const best = evaluatedCandidates[0];
  const secondBest = evaluatedCandidates[1];

  if (!best || best.score < 70) {
    return null;
  }

  if (secondBest && best.score - secondBest.score < 10) {
    console.warn(
      "[TheTVDB] Fallback match is ambiguous; metadata will not be used.",
      {
        best: {
          id: best.id,
          type: best.type,
          name: best.name,
          score: best.score,
        },
        secondBest: {
          id: secondBest.id,
          type: secondBest.type,
          name: secondBest.name,
          score: secondBest.score,
        },
      },
    );

    return null;
  }

  return best;
}

async function getTVDBLocalizedMetadataByIds(
  title: LocalizedTitle,
  languageCodes: Record<string, string>,
  tvdbIds: string[],
): Promise<AnimeLocalizedMetadata | null> {
  const candidates = await Promise.all(
    tvdbIds.map((tvdbId) => resolveTVDBId(tvdbId, title, languageCodes)),
  );

  const validCandidates = candidates.filter(
    (candidate): candidate is TVDBResolvedContent => candidate !== null,
  );

  if (validCandidates.length === 0) {
    return null;
  }

  validCandidates.sort((a, b) => b.score - a.score);

  return validCandidates[0].metadata;
}

export async function getTVDBLocalizedMetadata(
  title: LocalizedTitle,
  languageCodes: Record<string, string>,
  tvdbIds: string[] = [],
  context?: TVDBMatchContext,
): Promise<AnimeLocalizedMetadata | null> {
  if (tvdbIds.length > 0) {
    const metadata = await getTVDBLocalizedMetadataByIds(
      title,
      languageCodes,
      tvdbIds,
    );

    return metadata;
  }

  if (!context) {
    return null;
  }

  const match = await findTVDBMatch(title, languageCodes, context);

  if (!match) {
    return null;
  }

  if (match.type === "series" && match.seasonId) {
    const seasonMetadata = await resolveTVDBSeasonMetadata(
      match.seasonId,
      languageCodes,
    );

    if (seasonMetadata) {
      return seasonMetadata;
    }

    console.warn(
      "[TheTVDB] Matched season did not provide localized metadata; falling back to series metadata.",
      {
        seriesId: match.id,
        seasonId: match.seasonId,
        seasonNumber: match.seasonNumber,
      },
    );
  }

  const resolved = await resolveTVDBContent(
    match.type,
    match.id,
    title,
    languageCodes,
  );

  if (!resolved) {
    console.warn("[TheTVDB] Safe fallback match had no localized metadata.", {
      id: match.id,
      type: match.type,
    });

    return null;
  }

  return resolved.metadata;
}
