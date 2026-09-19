"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import GlobalSearch from "./GlobalSearch";
import MobileMenu from "./MobileMenu";
import { locales } from "@/i18n/locales";

export default function Header() {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";
  const isAnimePage = pathname.includes("/anime/");

  const currentLanguage =
    locales.find((locale) => locale.code === currentLocale) ?? locales[0];

  const getLocalePath = (localeCode: string) =>
    pathname.replace(`/${currentLocale}`, `/${localeCode}`) || `/${localeCode}`;

  const homePath = `/${currentLocale}`;
  const howItWorksPath = isAnimePage
    ? `${homePath}#how-it-works`
    : "#how-it-works";

  const t = useTranslations("header");

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        isAnimePage
          ? "border-zinc-800/70 bg-zinc-950/80 text-white"
          : "border-zinc-200/70 bg-white/75 text-zinc-950"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link
          href={homePath}
          className={`font-[family:var(--font-space-grotesk)] text-lg font-bold tracking-[-0.04em] ${
            isAnimePage ? "text-white" : "text-zinc-950"
          }`}
        >
          Anime
          <span className={isAnimePage ? "text-zinc-500" : "text-zinc-400"}>
            Consensus
          </span>
        </Link>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href={howItWorksPath}
            className={`px-3 py-2 text-sm transition-colors ${
              isAnimePage
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-500 hover:text-zinc-950"
            }`}
          >
            {t("howItWorks")}
          </Link>

          <Link
            href={`${homePath}#rankings`}
            className={`px-3 py-2 text-sm transition-colors ${
              isAnimePage
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-500 hover:text-zinc-950"
            }`}
          >
            {t("rankings")}
          </Link>

          <GlobalSearch dark={isAnimePage} />

          <details className="relative">
            <summary
              className={`flex cursor-pointer list-none items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isAnimePage
                  ? "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950"
              }`}
            >
              <span>{currentLanguage.code}</span>
              <span aria-hidden="true" className="text-[10px] opacity-50">
                ↓
              </span>
            </summary>

            <div
              className={`absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
                isAnimePage
                  ? "border-zinc-800 bg-zinc-950/95"
                  : "border-zinc-200 bg-white/95"
              }`}
            >
              {locales.map((locale) => {
                const isCurrent = locale.code === currentLocale;

                return (
                  <Link
                    key={locale.code}
                    href={getLocalePath(locale.code)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isCurrent
                        ? isAnimePage
                          ? "bg-zinc-800 text-white"
                          : "bg-zinc-100 text-zinc-950"
                        : isAnimePage
                          ? "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <span>{locale.nativeName}</span>
                    <span className="ml-3 shrink-0 text-[10px] font-mono uppercase opacity-50">
                      {locale.code}
                    </span>
                  </Link>
                );
              })}
            </div>
          </details>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <GlobalSearch dark={isAnimePage} />

          <MobileMenu dark={isAnimePage} />
        </div>
      </div>
    </header>
  );
}
