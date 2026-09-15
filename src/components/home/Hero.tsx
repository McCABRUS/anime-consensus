import { useTranslations } from "next-intl";
import AnimeSearch from "@/components/anime/AnimeSearch";
import HeroAnimation from "@/components/motion/HeroAnimation";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[calc(100svh-80px)] items-center overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
      <HeroAnimation>
        <div className="absolute inset-0 -z-10">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
          <HeroVisual />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-5xl">
            <p className="hero-eyebrow mb-6 font-mono text-xs font-semibold tracking-[0.28em] text-zinc-500">
              {t("eyebrow")}
            </p>

            <h1 className="hero-title font-[family:var(--font-space-grotesk)] text-5xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-7xl lg:text-[clamp(5rem,10vw,9.5rem)] lg:leading-[0.88]">
              <span className="block overflow-hidden">
                <span className="hero-title-line block">{t("titleLine1")}</span>
              </span>

              <span className="block overflow-hidden">
                <span className="hero-title-line hero-title-accent block">
                  {t("titleLine2")}
                </span>
              </span>
            </h1>

            <p className="hero-description mt-8 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              {t("description")}
            </p>

            <div className="hero-search mt-10 max-w-2xl">
              <AnimeSearch placeholder={t("searchPlaceholder")} />
            </div>
          </div>
        </div>
      </HeroAnimation>
    </section>
  );
}
