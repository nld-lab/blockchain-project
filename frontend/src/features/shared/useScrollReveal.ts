import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type DependencyList } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useScrollReveal(dependencies: DependencyList = []) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          motionOK: "(prefers-reduced-motion: no-preference)",
          motionReduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const reduced = Boolean(context.conditions?.motionReduce);

          gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((element) => {
            gsap.fromTo(
              element,
              reduced
                ? { autoAlpha: 0 }
                : { autoAlpha: 0, y: 36 },
              {
                autoAlpha: 1,
                ...(reduced ? {} : { y: 0 }),
                duration: reduced ? 0.15 : 0.8,
                ease: reduced ? "power1.out" : "power2.out",
                immediateRender: false,
                scrollTrigger: {
                  trigger: element,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          });

          gsap.fromTo(
            ".scroll-stagger > *",
            reduced
              ? { autoAlpha: 0 }
              : { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              ...(reduced ? {} : { y: 0 }),
              duration: reduced ? 0.15 : 0.65,
              ease: reduced ? "power1.out" : "power2.out",
              stagger: reduced ? 0.03 : 0.12,
              immediateRender: false,
              scrollTrigger: {
                trigger: ".scroll-stagger",
                start: "top 84%",
                toggleActions: "play none none reverse",
              },
            },
          );
        },
      );
    },
    { scope, dependencies: [...dependencies], revertOnUpdate: true },
  );

  return scope;
}
