"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import GlobalSearch from "./GlobalSearch";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";
  const otherLocale = currentLocale === "en" ? "es" : "en";
  const isAnimePage = pathname.includes("/anime/");

  const switchPath =
    pathname.replace(`/${currentLocale}`, `/${otherLocale}`) ||
    `/${otherLocale}`;

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

          <Link
            href={switchPath}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              isAnimePage
                ? "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-950"
            }`}
          >
            {otherLocale}
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <GlobalSearch dark={isAnimePage} />

          <MobileMenu
            otherLocale={otherLocale}
            switchPath={switchPath}
            dark={isAnimePage}
          />
        </div>
      </div>
    </header>
  );
}
