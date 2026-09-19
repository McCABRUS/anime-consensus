"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import AnimeSearch from "@/components/anime/AnimeSearch";

type Props = {
  dark?: boolean;
};

export default function GlobalSearch({ dark = false }: Props) {
  const [open, setOpen] = useState(false);
  const [isNavigating, startNavigation] = useTransition();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const t = useTranslations("common");

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

      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
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
  }, [open]);

  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus();
    }
  }, [open]);

  const handleNavigate = (href: string) => {
    setOpen(false);

    startNavigation(() => {
      router.push(href);
    });
  };

  const loadingOverlay =
    isNavigating && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white/95 px-5 py-3 shadow-2xl">
              <span
                className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950"
                aria-hidden="true"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Loading
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
          className="fixed inset-0 z-[100] pointer-events-none"
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
