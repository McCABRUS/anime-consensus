"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import gsap from "gsap";

import { createAnimeSlug } from "@/lib/anime/slug";
import type { AnimeSearchResult } from "@/lib/anime/types";

const emptySubscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

const ROUTE_TRANSITION_DURATION = 0.72;

type Props = {
  placeholder: string;
  autoFocus?: boolean;
  onNavigate?: (href: string) => void;
};

export default function AnimeSearch({
  placeholder,
  autoFocus = false,
  onNavigate,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("anime");

  const currentLocale = pathname.split("/")[1] || "en";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const loadingContentRef = useRef<HTMLDivElement>(null);
  const navigationStartedRef = useRef(false);

  const isNavigating =
    !onNavigate && pendingPath !== null && pathname !== pendingPath;

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    const requestId = ++requestIdRef.current;

    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setIsOpen(true);

      try {
        const response = await fetch(
          `/api/anime/search?q=${encodeURIComponent(normalizedQuery)}`,
        );

        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }

        const data = (await response.json()) as {
          results: AnimeSearchResult[];
        };

        if (requestId !== requestIdRef.current) {
          return;
        }

        setResults(data.results);
        setHighlightedIndex(-1);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error(error);
        setResults([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    if (!isNavigating || !pendingHref) {
      navigationStartedRef.current = false;
      return;
    }

    const overlay = loadingOverlayRef.current;
    const content = loadingContentRef.current;

    if (!overlay || !content || navigationStartedRef.current) {
      return;
    }

    navigationStartedRef.current = true;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    gsap.set(overlay, {
      opacity: 0,
      pointerEvents: "auto",
    });

    gsap.set(content, {
      opacity: 0,
      y: 8,
      scale: 0.96,
    });

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
      onComplete: () => {
        router.push(pendingHref);
      },
    });

    timeline
      .to(overlay, {
        opacity: 1,
        duration: ROUTE_TRANSITION_DURATION,
        ease: "power2.inOut",
      })
      .to(
        content,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: "power3.out",
        },
        0.18,
      );

    return () => {
      timeline.kill();
      document.body.style.overflow = previousOverflow;
    };
  }, [isNavigating, pendingHref, router]);

  useEffect(() => {
    if (!isNavigating) {
      navigationStartedRef.current = false;
    }
  }, [isNavigating]);

  const selectAnime = (anime: AnimeSearchResult) => {
    if (isNavigating) {
      return;
    }

    const selectedTitle =
      anime.title.english ||
      anime.title.romaji ||
      anime.title.native ||
      "anime";

    setQuery(selectedTitle);
    setIsOpen(false);
    setHighlightedIndex(-1);

    const slug = createAnimeSlug(selectedTitle);
    const href = `/${currentLocale}/anime/${anime.provider}/${anime.id}/${slug}`;

    if (onNavigate) {
      onNavigate(href);
      return;
    }

    const targetPath = new URL(href, window.location.origin).pathname;

    if (targetPath === pathname) {
      return;
    }

    setPendingHref(href);
    setPendingPath(targetPath);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length || isNavigating) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        setHighlightedIndex((current) =>
          current < results.length - 1 ? current + 1 : 0,
        );
        break;

      case "ArrowUp":
        event.preventDefault();

        setHighlightedIndex((current) =>
          current > 0 ? current - 1 : results.length - 1,
        );
        break;

      case "Enter":
        event.preventDefault();

        if (highlightedIndex >= 0) {
          const selected = results[highlightedIndex];

          if (selected) {
            selectAnime(selected);
          }
        }

        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const loadingOverlay =
    !onNavigate && isClient && pendingPath
      ? createPortal(
          <div
            ref={loadingOverlayRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/80"
            style={{
              opacity: 0,
              pointerEvents: "none",
            }}
            aria-hidden={!isNavigating}
            aria-live="polite"
            aria-busy={isNavigating}
          >
            <div
              ref={loadingContentRef}
              className="flex items-center gap-3 rounded-full border border-zinc-200/20 bg-white/10 px-5 py-3 shadow-2xl backdrop-blur-xl"
            >
              <span
                className="size-4 animate-spin rounded-full border-2 border-zinc-500 border-t-white"
                aria-hidden="true"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                {t("loading")}
              </span>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative" aria-busy={isNavigating}>
      {loadingOverlay}

      <div className="group flex items-center rounded-2xl border border-zinc-200 bg-white/80 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 focus-within:border-zinc-400 focus-within:shadow-[0_24px_100px_rgba(0,0,0,0.12)]">
        <label htmlFor={inputId} className="sr-only">
          {placeholder}
        </label>

        <input
          id={inputId}
          name="anime-search"
          ref={inputRef}
          type="search"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            const value = event.target.value;

            setQuery(value);

            if (value.trim().length < 2) {
              setResults([]);
              setIsLoading(false);
              setIsOpen(false);
              setHighlightedIndex(-1);
            }
          }}
          onFocus={() => {
            if (results.length > 0 && !isNavigating) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          disabled={isNavigating}
          className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base text-zinc-900 outline-none placeholder:text-zinc-400"
        />

        <div className="flex size-12 shrink-0 items-center justify-center">
          {isLoading || isNavigating ? (
            <span className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />
          ) : (
            <span className="text-xl text-zinc-500">→</span>
          )}
        </div>
      </div>

      {isOpen && !isNavigating && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl"
          role="listbox"
        >
          {results.map((anime, index) => {
            const isHighlighted = index === highlightedIndex;

            const title =
              anime.title.english ||
              anime.title.romaji ||
              anime.title.native ||
              "Unknown title";

            const secondaryTitle =
              anime.title.english !== anime.title.romaji
                ? anime.title.romaji
                : anime.title.native;

            return (
              <button
                key={anime.id}
                type="button"
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectAnime(anime)}
                disabled={isNavigating}
                className={`flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors ${
                  isHighlighted
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                  {anime.coverImage && (
                    <Image
                      src={anime.coverImage}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{title}</p>

                  {secondaryTitle && (
                    <p
                      className={`truncate text-xs ${
                        isHighlighted ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {secondaryTitle}
                    </p>
                  )}

                  <div
                    className={`mt-1 flex gap-2 text-[10px] font-mono uppercase ${
                      isHighlighted ? "text-zinc-400" : "text-zinc-400"
                    }`}
                  >
                    {anime.seasonYear && <span>{anime.seasonYear}</span>}
                    {anime.format && <span>{anime.format}</span>}
                    {anime.episodes && <span>{anime.episodes} EP</span>}
                  </div>
                </div>
              </button>
            );
          })}

          {!isLoading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              No anime found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
