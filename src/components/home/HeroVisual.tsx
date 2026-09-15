"use client";

import { useTranslations } from "next-intl";

const sources = [
  { key: "sourceMal", x: "8%", y: "18%" },
  { key: "sourceImdb", x: "78%", y: "16%" },
  { key: "sourceAniList", x: "4%", y: "76%" },
  { key: "sourceAnn", x: "82%", y: "70%" },
  { key: "sourceCrunchyroll", x: "46%", y: "4%" },
] as const;

export default function HeroVisual() {
  const t = useTranslations("hero");

  return (
    <div className="hero-visual pointer-events-none absolute inset-0 hidden lg:block">
      <div className="hero-orbit hero-orbit-outer" />
      <div className="hero-orbit hero-orbit-inner" />

      {sources.map((source) => (
        <div
          key={source.key}
          className="hero-source absolute flex size-12 items-center justify-center rounded-full border border-zinc-300 bg-white/80 font-mono text-[9px] font-bold text-zinc-500 shadow-lg backdrop-blur-md"
          style={{
            left: source.x,
            top: source.y,
          }}
        >
          {t(source.key)}
        </div>
      ))}

      <div className="hero-core absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-300 bg-zinc-950 text-white shadow-2xl">
        <span className="font-mono text-[9px] tracking-[0.2em]">CONSENSUS</span>
      </div>
    </div>
  );
}
