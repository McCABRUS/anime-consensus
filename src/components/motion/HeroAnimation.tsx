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

export default function HeroAnimation({ children }: Props) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = container.current;

      if (!root) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const visual = root.querySelector<HTMLElement>(".hero-visual");
      const grid = root.querySelector<HTMLElement>(".hero-grid");
      const orbs = root.querySelectorAll<HTMLElement>(".hero-orb");
      const orbitOuter = root.querySelector<HTMLElement>(".hero-orbit-outer");
      const orbitInner = root.querySelector<HTMLElement>(".hero-orbit-inner");
      const core = root.querySelector<HTMLElement>(".hero-core");
      const sources = root.querySelectorAll<HTMLElement>(".hero-source");
      const eyebrow = root.querySelector<HTMLElement>(".hero-eyebrow");
      const titleLines = root.querySelectorAll<HTMLElement>(".hero-title-line");
      const description = root.querySelector<HTMLElement>(".hero-description");
      const search = root.querySelector<HTMLElement>(".hero-search");

      if (!visual || !grid || !core || !eyebrow || !description || !search) {
        return;
      }

      if (reduceMotion) {
        return;
      }

      gsap.set(visual, {
        opacity: 0,
        y: 40,
        scale: 0.82,
        rotateX: 10,
        rotateY: -7,
        transformPerspective: 1400,
      });

      gsap.set(grid, {
        opacity: 0,
        scale: 1.12,
        y: 20,
      });

      gsap.set(orbs, {
        opacity: 0,
        scale: 0.45,
      });

      gsap.set([orbitOuter, orbitInner], {
        opacity: 0,
        scale: 0.45,
        rotation: 0,
      });

      gsap.set(core, {
        opacity: 0,
        scale: 0.2,
        y: 20,
        transformPerspective: 1000,
      });

      gsap.set(sources, {
        opacity: 0,
        scale: 0.25,
        y: 28,
      });

      gsap.set(eyebrow, {
        opacity: 0,
        y: 34,
        filter: "blur(8px)",
      });

      gsap.set(titleLines, {
        opacity: 0,
        yPercent: 125,
        rotateX: -82,
        skewY: 4,
        filter: "blur(5px)",
        transformOrigin: "50% 100%",
        transformPerspective: 1200,
      });

      gsap.set(description, {
        opacity: 0,
        y: 28,
        filter: "blur(8px)",
      });

      gsap.set(search, {
        opacity: 0,
        y: 34,
        scale: 0.96,
        filter: "blur(6px)",
      });

      const intro = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      intro
        .to(grid, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.8,
          ease: "power2.out",
        })
        .to(
          search,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power3.out",
          },
          "-=1.58",
        )
        .to(
          visual,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            duration: 1.65,
            ease: "expo.out",
          },
          "-=1.08",
        )
        .to(
          orbs,
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=1.3",
        )
        .to(
          [orbitOuter, orbitInner],
          {
            opacity: 1,
            scale: 1,
            duration: 1.8,
            stagger: 0.12,
            ease: "expo.out",
          },
          "-=1.35",
        )
        .to(
          eyebrow,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
          },
          "-=1.2",
        )
        .to(
          titleLines,
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            skewY: 0,
            filter: "blur(0px)",
            duration: 1.25,
            stagger: 0.12,
            ease: "power4.out",
          },
          "-=0.45",
        )
        .to(
          description,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
          },
          "-=0.7",
        )
        .to(
          core,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.15,
            ease: "back.out(1.7)",
          },
          "-=1.05",
        )
        .to(
          sources,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: {
              each: 0.1,
              from: "random",
            },
            ease: "back.out(1.7)",
          },
          "-=0.75",
        );

      gsap.to(core, {
        scale: 1.1,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.08), 0 24px 90px rgba(0,0,0,0.28), 0 0 70px rgba(99,102,241,0.16)",
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.2,
      });

      if (orbitOuter) {
        gsap.to(orbitOuter, {
          rotation: 360,
          duration: 34,
          repeat: -1,
          ease: "none",
        });
      }

      if (orbitInner) {
        gsap.to(orbitInner, {
          rotation: -360,
          duration: 22,
          repeat: -1,
          ease: "none",
        });
      }

      gsap.to(sources, {
        y: -10,
        duration: 1.9,
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.16,
          from: "random",
        },
        ease: "sine.inOut",
      });

      gsap.to(orbs, {
        scale: 1.12,
        x: 18,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        stagger: 0.7,
        ease: "sine.inOut",
      });

      const quickVisualX = gsap.quickTo(visual, "x", {
        duration: 0.9,
        ease: "power3.out",
      });
      const quickVisualY = gsap.quickTo(visual, "y", {
        duration: 0.9,
        ease: "power3.out",
      });
      const quickGridX = gsap.quickTo(grid, "x", {
        duration: 1.2,
        ease: "power3.out",
      });
      const quickGridY = gsap.quickTo(grid, "y", {
        duration: 1.2,
        ease: "power3.out",
      });

      const handlePointerMove = (event: PointerEvent) => {
        const bounds = root.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        quickVisualX(x * 26);
        quickVisualY(y * 20);
        quickGridX(x * 10);
        quickGridY(y * 8);
      };

      const resetPointer = () => {
        quickVisualX(0);
        quickVisualY(0);
        quickGridX(0);
        quickGridY(0);
      };

      root.addEventListener("pointermove", handlePointerMove);
      root.addEventListener("pointerleave", resetPointer);

      // Scroll depth affects only the visual layers. Text, search, and the
      // background remain fully visible in both scroll directions.
      gsap.to(visual, {
        yPercent: 8,
        scale: 0.97,
        rotateX: -1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(grid, {
        yPercent: 4,
        scale: 1.02,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 1.4,
        },
      });

      return () => {
        root.removeEventListener("pointermove", handlePointerMove);
        root.removeEventListener("pointerleave", resetPointer);
      };
    },
    {
      scope: container,
    },
  );

  return (
    <div
      ref={container}
      className="relative flex min-h-[calc(100svh-80px)] w-full items-center"
    >
      {children}
    </div>
  );
}
