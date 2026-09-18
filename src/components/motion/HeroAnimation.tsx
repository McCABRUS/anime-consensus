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
    <div
      ref={container}
      className="relative flex min-h-[calc(100svh-80px)] w-full items-center"
    >
      {children}
    </div>
  );
}
