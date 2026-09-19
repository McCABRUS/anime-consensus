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
      const synopsis = scope.querySelector<HTMLElement>(".anime-page-synopsis");
      const description = scope.querySelector<HTMLElement>(
        ".anime-page-description",
      );

      if (!hero || !cover || !heroCopy || !title) {
        return;
      }

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
        gsap.set([consensusCard, metaCard], {
          opacity: 0,
          y: 56,
          filter: "blur(10px)",
        });

        gsap.to([consensusCard, metaCard], {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: consensusSection,
            start: "top 78%",
            once: true,
          },
        });
      }

      if (score) {
        gsap.set(score, {
          opacity: 0,
          scale: 0.82,
          filter: "blur(8px)",
        });

        gsap.to(score, {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          delay: 0.14,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: consensusSection,
            start: "top 72%",
            once: true,
          },
        });
      }

      if (ratingRows && ratingRows.length > 0) {
        gsap.set(ratingRows, {
          opacity: 0,
          x: -18,
        });

        gsap.to(ratingRows, {
          opacity: 1,
          x: 0,
          duration: 0.42,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: consensusSection,
            start: "top 64%",
            once: true,
          },
        });
      }

      if (synopsis && description) {
        gsap.set([synopsis, description], {
          opacity: 0,
          y: 42,
          filter: "blur(7px)",
        });

        gsap.to(synopsis, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.68,
          ease: "power3.out",
          scrollTrigger: {
            trigger: synopsis,
            start: "top 82%",
            once: true,
          },
        });

        gsap.to(description, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          delay: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: description,
            start: "top 84%",
            once: true,
          },
        });
      }
    },
    {
      scope: root,
    },
  );

  return <div ref={root}>{children}</div>;
}
