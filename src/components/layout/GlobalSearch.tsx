"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import AnimeSearch from "@/components/anime/AnimeSearch";

type Props = {
  dark?: boolean;
};

export default function GlobalSearch({ dark = false }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
      triggerRef.current?.focus();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
          dark
            ? "border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-zinc-500 hover:text-white"
            : "border-zinc-200 bg-white/80 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950"
        }`}
      >
        {t("search")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-zinc-950/35 p-4 backdrop-blur-sm sm:p-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setOpen(false);
            }
          }}
        >
          <div
            className="mx-auto mt-16 w-full max-w-3xl overflow-visible rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl sm:mt-24 sm:p-6"
            role="dialog"
            aria-modal="true"
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

            <AnimeSearch placeholder={t("search")} autoFocus />
          </div>
        </div>
      )}
    </>
  );
}
