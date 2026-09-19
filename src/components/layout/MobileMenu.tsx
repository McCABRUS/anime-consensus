"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { locales } from "@/i18n/locales";

type Props = {
  dark?: boolean;
};

export default function MobileMenu({ dark = false }: Props) {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const pathname = usePathname();
  const t = useTranslations("common");
  const navigation = useTranslations("header");

  const currentLocale = pathname.split("/")[1] || "en";
  const isAnimePage = pathname.includes("/anime/");
  const homePath = `/${currentLocale}`;

  const currentLanguage =
    locales.find((locale) => locale.code === currentLocale) ?? locales[0];

  const howItWorksPath = isAnimePage
    ? `${homePath}#how-it-works`
    : "#how-it-works";

  const getLocalePath = (localeCode: string) =>
    pathname.replace(`/${currentLocale}`, `/${localeCode}`) || `/${localeCode}`;

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setLanguageOpen(false);
  };

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        aria-label={open ? t("close") : t("menu")}
        aria-expanded={open}
        onClick={toggleMenu}
        className={`flex size-10 items-center justify-center rounded-full border sm:hidden ${
          dark
            ? "border-zinc-700 text-zinc-300"
            : "border-zinc-200 text-zinc-700"
        }`}
      >
        <span className="font-mono text-xs">{open ? "×" : "☰"}</span>
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 top-full z-[100] max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-b px-6 py-6 shadow-xl backdrop-blur-xl sm:hidden ${
            dark
              ? "border-zinc-800 bg-zinc-950/95"
              : "border-zinc-200 bg-white/95"
          }`}
        >
          <nav className="flex flex-col gap-5">
            <a
              href={howItWorksPath}
              onClick={closeMenu}
              className={`text-lg ${dark ? "text-zinc-300" : "text-zinc-800"}`}
            >
              {navigation("howItWorks")}
            </a>

            <a
              href={`${homePath}#rankings`}
              onClick={closeMenu}
              className={`text-lg ${dark ? "text-zinc-300" : "text-zinc-800"}`}
            >
              {navigation("rankings")}
            </a>

            <div
              className={`border-t pt-5 ${
                dark ? "border-zinc-800" : "border-zinc-200"
              }`}
            >
              <button
                type="button"
                aria-expanded={languageOpen}
                onClick={() => setLanguageOpen((value) => !value)}
                className={`flex w-full items-center justify-between text-sm font-semibold uppercase tracking-widest ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                <span>
                  {currentLanguage.nativeName} ({currentLanguage.code})
                </span>

                <span
                  aria-hidden="true"
                  className={`text-base transition-transform duration-200 ${
                    languageOpen ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {languageOpen && (
                <div
                  className={`mt-3 max-h-[42dvh] overflow-y-auto rounded-2xl border p-1 overscroll-contain ${
                    dark
                      ? "border-zinc-800 bg-zinc-950/70"
                      : "border-zinc-200 bg-zinc-50/80"
                  }`}
                >
                  <div className="grid gap-1">
                    {locales.map((locale) => {
                      const isCurrent = locale.code === currentLocale;

                      return (
                        <Link
                          key={locale.code}
                          href={getLocalePath(locale.code)}
                          aria-current={isCurrent ? "page" : undefined}
                          onClick={closeMenu}
                          className={`flex min-h-11 items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                            isCurrent
                              ? dark
                                ? "bg-zinc-800 text-white"
                                : "bg-white text-zinc-950 shadow-sm"
                              : dark
                                ? "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                : "text-zinc-600 hover:bg-white hover:text-zinc-950"
                          }`}
                        >
                          <span className="truncate">{locale.nativeName}</span>

                          <span className="ml-3 shrink-0 text-[10px] font-mono uppercase opacity-50">
                            {locale.code}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
