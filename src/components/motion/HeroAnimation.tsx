"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { ReactNode } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

type Props = {
  children: ReactNode;
};

export default function HeroAnimation({ children }: Props) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        return;
      }

      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      tl.from(".hero-grid", {
        opacity: 0,
        duration: 1.4,
      })
        .from(
          ".hero-orb",
          {
            scale: 0,
            opacity: 0,
            duration: 1.5,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=1",
        )
        .from(
          ".hero-eyebrow",
          {
            y: 25,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.9",
        )
        .from(
          ".hero-title-line",
          {
            yPercent: 110,
            rotateX: -35,
            opacity: 0,
            duration: 1.1,
            stagger: 0.15,
            transformOrigin: "center bottom",
          },
          "-=0.3",
        )
        .from(
          ".hero-description",
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.55",
        )
        .from(
          ".hero-search",
          {
            y: 35,
            scale: 0.96,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        )
        .from(
          ".hero-core",
          {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.8",
        )
        .from(
          ".hero-source",
          {
            scale: 0.4,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "back.out(1.8)",
          },
          "-=0.5",
        );

      gsap.to(".hero-core", {
        scale: 1.08,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".hero-source", {
        y: -8,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.2,
          from: "random",
        },
        ease: "sine.inOut",
      });
    },
    {
      scope: container,
    },
  );

  return (
    <div ref={container} className="absolute inset-0">
      {children}
    </div>
  );
}
