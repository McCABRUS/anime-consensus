"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const items = [
  {
    key: "source",
    number: "01",
  },
  {
    key: "normalize",
    number: "02",
  },
  {
    key: "consensus",
    number: "03",
  },
] as const;

export default function HowItWorks() {
  const t = useTranslations("howItWorks");
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        return;
      }

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 76%",
          end: "top 25%",
          scrub: 1.2,
        },
      });

      intro.fromTo(
        ".how-eyebrow",
        {
          opacity: 0,
          y: 28,
          letterSpacing: "0.5em",
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          letterSpacing: "0.28em",
          filter: "blur(0px)",
          ease: "power3.out",
        },
        0,
      );

      intro.fromTo(
        ".how-title",
        {
          opacity: 0,
          y: 70,
          rotateX: 18,
          transformOrigin: "50% 100%",
          filter: "blur(12px)",
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          ease: "power3.out",
        },
        0.05,
      );

      intro.fromTo(
        ".how-description",
        {
          opacity: 0,
          y: 35,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power2.out",
        },
        0.14,
      );

      const cards = gsap.utils.toArray<HTMLElement>(".how-card");

      gsap.fromTo(
        ".how-cards-line",
        {
          scaleX: 0,
          transformOrigin: "left center",
        },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".how-cards",
            start: "top 78%",
            end: "top 32%",
            scrub: 1,
          },
        },
      );

      cards.forEach((card, index) => {
        const direction = index === 0 ? -1 : index === 2 ? 1 : 0;
        const number = card.querySelector<HTMLElement>(".how-card-number");
        const content = card.querySelector<HTMLElement>(".how-card-content");

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 86%",
            end: "top 48%",
            scrub: 1,
          },
        });

        timeline.fromTo(
          card,
          {
            opacity: 0.45,
            y: 90,
            x: direction * 40,
            rotateY: direction * 10,
            rotateX: 6,
            scale: 0.96,
            filter: "blur(6px)",
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            filter: "blur(0px)",
            ease: "power3.out",
          },
          0,
        );

        if (number) {
          timeline.fromTo(
            number,
            {
              opacity: 0.65,
              y: 18,
              scale: 0.78,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              ease: "back.out(1.8)",
            },
            0.18,
          );
        }

        if (content) {
          timeline.fromTo(
            content,
            {
              opacity: 0.72,
              y: 28,
            },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
            },
            0.2,
          );
        }
      });

      gsap.to(".how-card-glow", {
        xPercent: 120,
        duration: 4.5,
        repeat: -1,
        ease: "none",
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      id="how-it-works"
      className="relative isolate overflow-hidden border-t border-zinc-200 bg-zinc-950 px-6 py-28 text-white sm:px-10 lg:px-16 lg:py-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_45%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-px w-[70%] -translate-x-1/2 overflow-hidden bg-zinc-800">
        <div className="how-cards-line h-full w-full origin-left scale-x-0 bg-zinc-500" />
      </div>

      <div className="mx-auto max-w-7xl">
        <p className="how-eyebrow font-mono text-xs tracking-[0.28em] text-zinc-500">
          {t("eyebrow")}
        </p>

        <div className="mt-6 max-w-4xl" style={{ perspective: "1200px" }}>
          <h2 className="how-title font-[family:var(--font-space-grotesk)] text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            {t("title")}
          </h2>

          <p className="how-description mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="how-cards relative mt-20 grid gap-px overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.key}
              className="how-card group relative min-h-[320px] overflow-hidden bg-zinc-900/80 p-8 sm:p-10"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="how-card-glow pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              <span className="how-card-number relative z-10 font-mono text-xs text-zinc-400 transition-colors duration-300 group-hover:text-white">
                {item.number}
              </span>

              <div className="how-card-content relative z-10">
                <h3 className="mt-16 font-[family:var(--font-space-grotesk)] text-2xl font-medium text-white transition-transform duration-500 group-hover:translate-x-1">
                  {t(`${item.key}.title`)}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-300 transition-colors duration-500 group-hover:text-zinc-200">
                  {t(`${item.key}.description`)}
                </p>
              </div>

              <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-zinc-500 transition-transform duration-700 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
