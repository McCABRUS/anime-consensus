"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  otherLocale: string;
  switchPath: string;
  dark?: boolean;
};

export default function MobileMenu({
  otherLocale,
  switchPath,
  dark = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("common");
  const navigation = useTranslations("header");

  const currentLocale = pathname.split("/")[1] || "en";
  const isAnimePage = pathname.includes("/anime/");
  const homePath = `/${currentLocale}`;

  const howItWorksPath = isAnimePage
    ? `${homePath}#how-it-works`
    : "#how-it-works";

  return (
    <>
      <button
        type="button"
        aria-label={open ? t("close") : t("menu")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
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
          className={`absolute left-0 right-0 top-full border-b px-6 py-6 shadow-xl backdrop-blur-xl sm:hidden ${
            dark
              ? "border-zinc-800 bg-zinc-950/95"
              : "border-zinc-200 bg-white/95"
          }`}
        >
          <nav className="flex flex-col gap-5">
            <a
              href={howItWorksPath}
              onClick={() => setOpen(false)}
              className={`text-lg ${dark ? "text-zinc-300" : "text-zinc-800"}`}
            >
              {navigation("howItWorks")}
            </a>

            <a
              href={`${homePath}#rankings`}
              onClick={() => setOpen(false)}
              className={`text-lg ${dark ? "text-zinc-300" : "text-zinc-800"}`}
            >
              {navigation("rankings")}
            </a>

            <div
              className={`border-t pt-5 ${
                dark ? "border-zinc-800" : "border-zinc-200"
              }`}
            >
              <a
                href={switchPath}
                className={`text-sm font-semibold uppercase tracking-widest ${
                  dark ? "text-zinc-500" : "text-zinc-500"
                }`}
              >
                {otherLocale.toUpperCase()}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
