"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";
  const otherLocale = currentLocale === "en" ? "es" : "en";

  const switchPath =
    pathname.replace(`/${currentLocale}`, `/${otherLocale}`) ||
    `/${otherLocale}`;

  const t = useTranslations("header");

  return (
    <header className="relative z-50 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link
          href={`/${currentLocale}`}
          className="font-[family:var(--font-space-grotesk)] text-lg font-bold tracking-[-0.04em]"
        >
          Anime<span className="text-zinc-400">Consensus</span>
        </Link>

        <div className="hidden items-center gap-7 sm:flex">
          <a
            href="#how-it-works"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-950"
          >
            {t("howItWorks")}
          </a>

          <a
            href="#"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-950"
          >
            {t("rankings")}
          </a>

          <Link
            href={switchPath}
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-950"
          >
            {otherLocale}
          </Link>
        </div>

        <MobileMenu otherLocale={otherLocale} switchPath={switchPath} />
      </div>
    </header>
  );
}
