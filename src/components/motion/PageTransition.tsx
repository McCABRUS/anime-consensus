"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { ReactNode } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

type Props = {
  children: ReactNode;
};

export default function PageTransition({ children }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrapper = root.current;

      if (!wrapper) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const curtain = wrapper.querySelector<HTMLElement>(
        ".route-transition-curtain",
      );
      const mark = wrapper.querySelector<HTMLElement>(".route-transition-mark");
      const line = wrapper.querySelector<HTMLElement>(".route-transition-line");
      const content = wrapper.querySelector<HTMLElement>(
        ".route-transition-content",
      );

      if (!curtain || !mark || !line || !content) {
        return;
      }

      if (reduceMotion) {
        curtain.style.display = "none";
        return;
      }

      gsap.set(curtain, {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 0,
      });

      gsap.set(mark, {
        opacity: 0,
        y: 14,
        filter: "blur(6px)",
      });

      gsap.set(line, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(content, {
        opacity: 0.96,
        y: 8,
        scale: 0.995,
        filter: "blur(1px)",
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
        onComplete: () => {
          gsap.set(curtain, {
            display: "none",
          });
        },
      });

      timeline
        .to(curtain, {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out",
        })
        .to(
          mark,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.28,
            ease: "power2.out",
          },
          "-=0.12",
        )
        .to(
          line,
          {
            scaleX: 1,
            duration: 0.48,
            ease: "power2.inOut",
          },
          "-=0.12",
        )
        .to(
          content,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power4.out",
          },
          "-=0.2",
        )
        .to(
          curtain,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 0.88,
            ease: "expo.inOut",
          },
          "-=0.58",
        )
        .to(
          line,
          {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.36,
            ease: "power2.in",
          },
          "-=0.42",
        )
        .to(
          mark,
          {
            opacity: 0,
            y: -8,
            filter: "blur(4px)",
            duration: 0.24,
            ease: "power2.in",
          },
          "-=0.28",
        );

      return () => {
        timeline.kill();
      };
    },
    {
      scope: root,
    },
  );

  return (
    <div ref={root} className="relative min-h-screen">
      <div className="route-transition-content relative z-0">{children}</div>

      <div
        className="route-transition-curtain fixed inset-0 z-[1000] flex items-center justify-center"
        style={{
          backgroundColor: "rgba(9, 9, 11, 0.82)",
        }}
        aria-hidden="true"
      >
        <div className="flex w-[min(28rem,80vw)] flex-col items-center">
          <span className="route-transition-mark font-mono text-[10px] font-semibold uppercase tracking-[0.42em] text-zinc-400">
            Anime Consensus
          </span>

          <div className="mt-4 h-px w-full overflow-hidden bg-zinc-700/80">
            <div className="route-transition-line h-full w-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
