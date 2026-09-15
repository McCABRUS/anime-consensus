"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  otherLocale: string;
  switchPath: string;
};

export default function MobileMenu({ otherLocale, switchPath }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("common");
  const navigation = useTranslations("header");

  return (
    <>
      <button
        type="button"
        aria-label={open ? t("close") : t("menu")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex size-10 items-center justify-center rounded-full border border-zinc-200 sm:hidden"
      >
        <span className="font-mono text-xs">{open ? "×" : "☰"}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-zinc-200 bg-white/95 px-6 py-6 shadow-xl backdrop-blur-xl sm:hidden">
          <nav className="flex flex-col gap-5">
            <a
              href="#how-it-works"
              onClick={() => setOpen(false)}
              className="text-lg text-zinc-800"
            >
              {navigation("howItWorks")}
            </a>

            <a
              href="#"
              onClick={() => setOpen(false)}
              className="text-lg text-zinc-800"
            >
              {navigation("rankings")}
            </a>

            <div className="border-t border-zinc-200 pt-5">
              <a
                href={switchPath}
                className="text-sm font-semibold uppercase tracking-widest text-zinc-500"
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
