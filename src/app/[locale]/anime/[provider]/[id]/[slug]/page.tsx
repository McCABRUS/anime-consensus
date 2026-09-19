import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Header from "@/components/layout/Header";
import AnimePageAnimation from "@/components/motion/AnimePageAnimation";

import { calculateConsensus } from "@/lib/anime/consensus";

import { resolveCanonicalAnime } from "@/lib/anime/resolve";
import type {
  AnimeProvider,
  RatingProvider,
  RatingSourceStatus,
} from "@/lib/anime/types";

type Props = {
  params: Promise<{
    locale: string;
    provider: string;
    id: string;
    slug: string;
  }>;
};

const VALID_PROVIDERS: AnimeProvider[] = ["anilist", "jikan", "kitsu"];

const STATUS_KEYS = {
  FINISHED: "statusValues.FINISHED",
  RELEASING: "statusValues.RELEASING",
  NOT_YET_RELEASED: "statusValues.NOT_YET_RELEASED",
  CANCELLED: "statusValues.CANCELLED",
  HIATUS: "statusValues.HIATUS",
} as const;

const FORMAT_KEYS = {
  TV: "formats.TV",
  MOVIE: "formats.MOVIE",
  OVA: "formats.OVA",
  ONA: "formats.ONA",
  SPECIAL: "formats.SPECIAL",
  TV_SHORT: "formats.TV_SHORT",
  MUSIC: "formats.MUSIC",
} as const;

const SEASON_KEYS = {
  WINTER: "seasons.WINTER",
  SPRING: "seasons.SPRING",
  SUMMER: "seasons.SUMMER",
  FALL: "seasons.FALL",
} as const;

const PROVIDER_NAMES: Record<RatingProvider, string> = {
  myanimelist: "MyAnimeList",
  anilist: "AniList",
  kitsu: "Kitsu",
  imdb: "IMDb",
  shikimori: "Shikimori Community Average",
  animenewsnetwork: "Anime News Network",
  crunchyroll: "Crunchyroll",
};

function isAnimeProvider(provider: string): provider is AnimeProvider {
  return VALID_PROVIDERS.includes(provider as AnimeProvider);
}

function getGenreKey(genre: string): string {
  return genre
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " AND ")
    .replace(/['’]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function Metric({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-sm text-zinc-300">{value ?? "—"}</p>
    </div>
  );
}

function Description({ text }: { text: string | null }) {
  if (!text) {
    return null;
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="mt-5 max-w-3xl space-y-6 text-lg leading-8 text-zinc-400">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function RatingRow({
  provider,
  value,
  voteCount,
  locale,
  status,
  sourceUrl,
}: {
  provider: RatingProvider;
  value: number | null;
  voteCount: number | null;
  locale: string;
  status: RatingSourceStatus;
  sourceUrl?: string;
}) {
  const formattedVoteCount =
    voteCount !== null ? new Intl.NumberFormat(locale).format(voteCount) : null;

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-4 last:border-0">
      <span className="text-sm text-zinc-300">{PROVIDER_NAMES[provider]}</span>

      {status === "available" && value !== null ? (
        <div className="text-right">
          <div className="font-mono text-sm font-medium text-white">
            {value.toFixed(2)}
            <span className="ml-1 text-zinc-600">/ 10</span>
          </div>

          {formattedVoteCount && (
            <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              {formattedVoteCount} ratings
            </div>
          )}

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-[10px] uppercase tracking-[0.15em] text-zinc-600 transition-colors hover:text-zinc-300"
            >
              Anime News Network →
            </a>
          )}
        </div>
      ) : (
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-600">
          unavailable
        </span>
      )}
    </div>
  );
}

export default async function AnimePage({ params }: Props) {
  const { locale, provider, id } = await params;

  if (!isAnimeProvider(provider)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "anime",
  });

  const anime = await resolveCanonicalAnime(provider, id);

  if (!anime) {
    notFound();
  }

  const consensus = calculateConsensus(anime.ratings);
  const genreTranslations = t.raw("genreValues") as Record<string, string>;

  const defaultTitle =
    anime.title.english ||
    anime.title.romaji ||
    anime.title.native ||
    "Unknown anime";

  const localizedTitle =
    locale !== "en"
      ? (anime.localizedMetadata?.translations[locale]?.title ?? null)
      : null;

  const title = localizedTitle || defaultTitle;

  const localizedDescription =
    locale !== "en"
      ? (anime.localizedMetadata?.translations[locale]?.overview ??
        anime.description)
      : anime.description;

  const usesTVDBDescription =
    locale !== "en" &&
    Boolean(anime.localizedMetadata?.translations[locale]?.overview);

  const additionalTitles = [
    {
      label: t("english"),
      value: anime.title.english,
    },
    {
      label: t("original"),
      value: anime.title.native,
    },
    {
      label: t("reading"),
      value: anime.title.romaji,
    },
  ];

  const alternativeTitles = anime.title.synonyms ?? [];

  const displayedTitles = [
    ...additionalTitles,
    ...alternativeTitles.map((value) => ({
      label: t("alternative"),
      value,
    })),
  ].filter(({ value }) => {
    if (!value) {
      return false;
    }

    return value !== title;
  });

  const uniqueDisplayedTitles = displayedTitles.filter(
    ({ value }, index, titles) =>
      titles.findIndex((item) => item.value === value) === index,
  );

  const translatedFormat = anime.format
    ? t(FORMAT_KEYS[anime.format as keyof typeof FORMAT_KEYS] ?? "unknown")
    : t("unknown");

  const translatedStatus = anime.status
    ? t(STATUS_KEYS[anime.status as keyof typeof STATUS_KEYS] ?? "unknown")
    : t("unknown");

  const translatedSeason =
    anime.season && SEASON_KEYS[anime.season as keyof typeof SEASON_KEYS]
      ? t(SEASON_KEYS[anime.season as keyof typeof SEASON_KEYS])
      : null;

  const seasonValue =
    anime.seasonYear !== null
      ? [String(anime.seasonYear), translatedSeason].filter(Boolean).join(" ")
      : t("unknown");

  const mainStudio = anime.mainStudio ?? t("unknown");

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Header />

      <AnimePageAnimation>
        <section className="anime-page-hero relative overflow-hidden">
          {anime.bannerImage && (
            <>
              <Image
                src={anime.bannerImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className="anime-page-banner object-cover opacity-20"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/80 to-zinc-950" />
            </>
          )}

          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 sm:px-10 lg:px-16">
            <div className="grid gap-10 md:grid-cols-[240px_1fr]">
              {anime.coverImage && (
                <div className="anime-page-cover relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl">
                  <Image
                    src={anime.coverImage}
                    alt={title}
                    fill
                    priority
                    sizes="240px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="anime-page-copy max-w-4xl self-end">
                <p className="anime-page-brand font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
                  {t("brand")}
                </p>

                <h1 className="anime-page-title mt-4 font-[family:var(--font-space-grotesk)] text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-8xl">
                  {title}
                </h1>

                {uniqueDisplayedTitles.length > 0 && (
                  <div className="anime-page-alt-titles mt-4 space-y-1">
                    {uniqueDisplayedTitles.map(({ label, value }) => (
                      <p
                        key={`${label}-${value}`}
                        className="text-sm text-zinc-500"
                      >
                        <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-600">
                          {label}
                        </span>
                        {value}
                      </p>
                    ))}
                  </div>
                )}

                {anime.genres.length > 0 && (
                  <div className="anime-page-genres mt-8 flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400"
                      >
                        {genreTranslations[getGenreKey(genre)] ?? genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="anime-page-consensus-section mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="anime-page-consensus-card rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                    Consensus
                  </p>

                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="anime-page-consensus-score text-7xl font-semibold tracking-[-0.06em] text-white">
                      {consensus.score !== null
                        ? consensus.score.toFixed(2)
                        : "—"}
                    </span>

                    <span className="font-mono text-sm text-zinc-600">
                      / 10
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    Sources
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    {consensus.ratingCount}
                  </p>
                </div>
              </div>

              {anime.ratingSources.length > 0 ? (
                <div className="mt-8 border-t border-zinc-800">
                  {anime.ratingSources.map((source) => (
                    <div
                      key={source.provider}
                      className="anime-page-rating-row"
                    >
                      <RatingRow
                        provider={source.provider}
                        value={source.rating?.normalizedValue ?? null}
                        voteCount={source.rating?.voteCount ?? null}
                        locale={locale}
                        status={source.status}
                        sourceUrl={source.rating?.sourceUrl}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-8 border-t border-zinc-800 pt-6 text-sm text-zinc-600">
                  No ratings available.
                </p>
              )}
            </div>

            <aside className="anime-page-meta-card space-y-5 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Metric label={t("format")} value={translatedFormat} />

              <Metric label={t("status")} value={translatedStatus} />

              <Metric
                label={t("episodes")}
                value={
                  anime.episodes !== null
                    ? String(anime.episodes)
                    : t("unknown")
                }
              />

              <Metric label={t("season")} value={seasonValue} />

              <Metric label={t("studio")} value={mainStudio} />

              {anime.productionCompanies.length > 0 && (
                <div className="border-b border-zinc-800 pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    {t("productionCompanies")}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                    {anime.productionCompanies.map((company) => (
                      <span key={company} className="text-sm text-zinc-300">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="anime-page-synopsis mx-auto grid max-w-7xl gap-16 px-6 pb-20 sm:px-10 lg:grid-cols-[1fr_340px] lg:px-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-600">
              {t("synopsis")}
            </p>

            {localizedDescription ? (
              <div className="anime-page-description">
                <Description text={localizedDescription} />
              </div>
            ) : (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-500">
                {t("noDescription")}
              </p>
            )}

            {usesTVDBDescription && (
              <p className="mt-6 text-xs text-zinc-600">
                <a
                  href="https://thetvdb.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-zinc-400"
                >
                  {t("tvdbSource")}
                </a>
              </p>
            )}
          </div>
        </section>
      </AnimePageAnimation>
    </main>
  );
}
