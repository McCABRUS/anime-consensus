"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import AnimeSearch from "@/components/anime/AnimeSearch";

const emptySubscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

const ROUTE_TRANSITION_DURATION = 0.72;

type Props = {
  dark?: boolean;
};

export default function GlobalSearch({ dark = false }: Props) {
  const [open, setOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const loadingContentRef = useRef<HTMLDivElement>(null);
  const navigationStartedRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const animeT = useTranslations("anime");

  const isNavigating = pendingPath !== null && pathname !== pendingPath;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      const isSearchShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      const isSlashShortcut =
        event.key === "/" && !isTyping && !event.ctrlKey && !event.metaKey;

      if (isSearchShortcut || isSlashShortcut) {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape" && open && !isNavigating) {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavigating, open]);

  useEffect(() => {
    if (!open || isNavigating) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        modalRef.current &&
        !modalRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isNavigating, open]);

  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus();
    }
  }, [open]);

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

  const handleNavigate = (href: string) => {
    if (isNavigating) {
      return;
    }

    const targetPath = new URL(href, window.location.origin).pathname;

    if (targetPath === pathname) {
      setOpen(false);
      return;
    }

    setOpen(false);
    setPendingHref(href);
    setPendingPath(targetPath);
  };

  const loadingOverlay =
    isClient && pendingPath
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
                {animeT("loading")}
              </span>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {loadingOverlay}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={isNavigating}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
          dark
            ? "border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-zinc-500 hover:text-white"
            : "border-zinc-200 bg-white/80 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950"
        } ${isNavigating ? "cursor-wait opacity-60" : ""}`}
      >
        {t("search")}
      </button>

      {open && !isNavigating && (
        <div
          className="pointer-events-none fixed inset-0 z-[100]"
          aria-hidden="false"
        >
          <div
            ref={modalRef}
            className="pointer-events-auto mx-auto mt-16 w-[calc(100%-2rem)] max-w-3xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl sm:mt-24 sm:w-[calc(100%-4rem)] sm:p-6"
            role="dialog"
            aria-modal="false"
            aria-label={t("search")}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                {t("search")}
              </p>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-950"
              >
                {t("close")}
              </button>
            </div>

            <AnimeSearch
              placeholder={t("search")}
              autoFocus
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      )}
    </>
  );
}
