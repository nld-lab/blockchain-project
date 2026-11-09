import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type DependencyList } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useScrollReveal(dependencies: DependencyList = []) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
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
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          stagger: 0.12,
          immediateRender: false,
          scrollTrigger: {
            trigger: ".scroll-stagger",
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope, dependencies: [...dependencies], revertOnUpdate: true },
  );

  return scope;
}
