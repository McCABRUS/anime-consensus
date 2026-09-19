"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  children: ReactNode;
};

export default function AnimePageAnimation({ children }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;

      if (!scope) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        return;
      }

      const hero = scope.querySelector<HTMLElement>(".anime-page-hero");
      const banner = scope.querySelector<HTMLElement>(".anime-page-banner");
      const cover = scope.querySelector<HTMLElement>(".anime-page-cover");
      const heroCopy = scope.querySelector<HTMLElement>(".anime-page-copy");
      const brand = scope.querySelector<HTMLElement>(".anime-page-brand");
      const title = scope.querySelector<HTMLElement>(".anime-page-title");
      const altTitles = scope.querySelector<HTMLElement>(
        ".anime-page-alt-titles",
      );
      const genres = scope.querySelector<HTMLElement>(".anime-page-genres");

      const consensusSection = scope.querySelector<HTMLElement>(
        ".anime-page-consensus-section",
      );
      const consensusCard = scope.querySelector<HTMLElement>(
        ".anime-page-consensus-card",
      );
      const metaCard = scope.querySelector<HTMLElement>(
        ".anime-page-meta-card",
      );
      const score = scope.querySelector<HTMLElement>(
        ".anime-page-consensus-score",
      );
      const ratingRows = scope.querySelectorAll<HTMLElement>(
        ".anime-page-rating-row",
      );

      if (!hero || !cover || !heroCopy || !title) {
        return;
      }

      /*
       * HERO INTRO
       */

      gsap.set(cover, {
        opacity: 0,
        y: 34,
        rotateY: -8,
        scale: 0.96,
        transformPerspective: 1000,
        filter: "blur(7px)",
      });

      if (brand) {
        gsap.set(brand, {
          opacity: 0,
          y: 14,
          filter: "blur(5px)",
        });
      }

      gsap.set(title, {
        opacity: 0,
        y: 42,
        rotateX: -12,
        transformOrigin: "50% 100%",
        filter: "blur(9px)",
      });

      if (altTitles) {
        gsap.set(altTitles, {
          opacity: 0,
          y: 20,
          filter: "blur(5px)",
        });
      }

      if (genres) {
        gsap.set(genres, {
          opacity: 0,
          y: 18,
        });
      }

      if (banner) {
        gsap.set(banner, {
          scale: 1.08,
          yPercent: -3,
        });
      }

      const intro = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      intro.to(
        cover,
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "expo.out",
        },
        0,
      );

      if (brand) {
        intro.to(
          brand,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.42,
          },
          0.28,
        );
      }

      intro.to(
        title,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 0.95,
          ease: "expo.out",
        },
        0.34,
      );

      if (altTitles) {
        intro.to(
          altTitles,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.45,
          },
          0.82,
        );
      }

      if (genres) {
        intro.to(
          genres,
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
          },
          0.94,
        );
      }

      /*
       * HERO PARALLAX
       */

      if (banner) {
        gsap.to(banner, {
          scale: 1,
          yPercent: 0,
          duration: 1.6,
          ease: "expo.out",
        });

        gsap.to(banner, {
          yPercent: 7,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (consensusSection && consensusCard && metaCard) {
        gsap.fromTo(
          [consensusCard, metaCard],
          {
            y: 36,
            filter: "blur(5px)",
          },
          {
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.12,
            ease: "expo.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: consensusSection,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      if (score && consensusSection) {
        gsap.fromTo(
          score,
          {
            scale: 0.9,
            filter: "blur(4px)",
          },
          {
            scale: 1,
            filter: "blur(0px)",
            duration: 0.75,
            ease: "back.out(1.5)",
            immediateRender: false,
            scrollTrigger: {
              trigger: consensusSection,
              start: "top 76%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      if (ratingRows.length > 0 && consensusSection) {
        gsap.fromTo(
          ratingRows,
          {
            x: -16,
            filter: "blur(2px)",
          },
          {
            x: 0,
            filter: "blur(0px)",
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: consensusSection,
              start: "top 68%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    },
    {
      scope: root,
    },
  );

  return <div ref={root}>{children}</div>;
}
