
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothExperience({ children }) {
  const root = useRef(null);

  // Smooth scrolling starts only after the page has hydrated.
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    const update = () => ScrollTrigger.update();

    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", update);
    gsap.ticker.add(raf);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", update);
      lenis.destroy();
    };
  }, []);

  // All visual animations begin after hydration.
  useEffect(() => {
    const element = root.current;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const headings = element.querySelectorAll(
      ".hero h1, .section-heading h2, .story-copy h2, .faq-intro h2"
    );

    headings.forEach((heading, index) => {
      heading.setAttribute(
        "data-glitch",
        heading.textContent.replace(/\s+/g, " ").trim()
      );

      heading.style.setProperty(
        "--glitch-delay",
        `${index * 1.35}s`
      );
    });

    const media = gsap.matchMedia();

    media.add(
      {
        desktop: "(min-width: 761px)",
        mobile: "(max-width: 760px)",
      },
      (context) => {
        const desktop = context.conditions.desktop;

        const sections = gsap.utils.toArray(
          "main > section",
          element
        );

        const morph = element.querySelector(".scroll-morph");

        // A soft transition layer between sections.
        function playMorph(direction) {
          if (!morph) return;

          gsap.killTweensOf(morph);

          gsap.set(morph, {
            autoAlpha: 0,
            xPercent: direction > 0 ? -105 : 105,
            scaleX: 0.8,
            scaleY: 0.85,
            rotation: direction * 5,
          });

          gsap.timeline()
            .to(morph, {
              autoAlpha: 0.65,
              xPercent: 0,
              scaleX: 1.08,
              scaleY: 1.08,
              rotation: 0,
              duration: 0.35,
              ease: "power3.out",
            })
            .to(morph, {
              autoAlpha: 0,
              xPercent: direction > 0 ? 108 : -108,
              scaleX: 1.3,
              scaleY: 1.2,
              rotation: -direction * 4,
              duration: 0.42,
              ease: "power3.inOut",
            });
        }

        sections.forEach((section, index) => {
          const isHero = index === 0;

          const selector = isHero
            ? ".hero-copy .eyebrow, .hero-copy h1, .hero-description, .hero-actions, .hero-footnote, .hero-visual"
            : ".section-heading, .product-card, .story-art, .story-copy .eyebrow, .story-copy h2, .story-copy > p, .story-link, .value-item, .faq-intro, .faq-list";

          const targets = section.querySelectorAll(selector);

          if (targets.length) {
            if (isHero) {
              // The hero is already visible. This only adds a gentle entrance.
              gsap.fromTo(
                targets,
                {
                  y: 15,
                  autoAlpha: 0.82,
                  filter: "blur(2px)",
                },
                {
                  y: 0,
                  autoAlpha: 1,
                  filter: "blur(0px)",
                  stagger: 0.045,
                  duration: 0.8,
                  ease: "power3.out",
                  clearProps: "filter",
                }
              );
            } else {
              // Other sections stay visible until they enter the viewport.
              // This avoids hiding content while visitors wait to scroll.
              ScrollTrigger.create({
                trigger: section,
                start: "top 88%",
                once: true,
                onEnter: () => {
                  gsap.fromTo(
                    targets,
                    {
                      y: desktop ? 24 : 12,
                      autoAlpha: 0.78,
                      scale: desktop ? 0.99 : 1,
                      filter: desktop ? "blur(3px)" : "blur(0px)",
                    },
                    {
                      y: 0,
                      autoAlpha: 1,
                      scale: 1,
                      filter: "blur(0px)",
                      stagger: desktop ? 0.045 : 0.025,
                      duration: desktop ? 0.8 : 0.65,
                      ease: "power3.out",
                      clearProps: "filter",
                    }
                  );
                },
              });
            }
          }

          if (desktop) {
            // Keep section movement subtle so the page feels connected.
            gsap.to(section, {
              y: -14,
              scale: 0.992,
              opacity: 0.94,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "bottom 92%",
                end: "bottom 25%",
                scrub: 0.8,
              },
            });

            // Gentle depth movement for the artwork.
            const artwork = section.querySelector(
              ".hero-photo, .story-art, .product-art"
            );

            if (artwork) {
              gsap.fromTo(
                artwork,
                {
                  scale: 1.045,
                  rotation: index % 2 === 0 ? -0.8 : 0.8,
                },
                {
                  scale: 1,
                  rotation: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                  },
                }
              );
            }
          }

          if (index > 0 && morph) {
            ScrollTrigger.create({
              trigger: section,
              start: "top 72%",
              onEnter: () => playMorph(1),
              onEnterBack: () => playMorph(-1),
            });
          }
        });

        // Marquees remain visible and move gently into position.
        gsap.utils
          .toArray(".motion-marquee", element)
          .forEach((marquee, index) => {
            gsap.fromTo(
              marquee,
              {
                y: 12,
                rotation: index % 2 === 0 ? -0.4 : 0.4,
              },
              {
                y: 0,
                rotation: 0,
                duration: 0.75,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: marquee,
                  start: "top 96%",
                  once: true,
                },
              }
            );
          });

        const refreshFrame = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });

        return () => {
          cancelAnimationFrame(refreshFrame);
        };
      }
    );

    return () => {
      media.revert();
    };
  }, []);

  return (
    <div ref={root} className="motion-shell">
      <div className="motion-atmosphere" aria-hidden="true">
        <span className="ambient-orb orb-one" />
        <span className="ambient-orb orb-two" />
        <span className="ambient-orb orb-three" />
      </div>

      <div className="scroll-morph" aria-hidden="true" />

      {children}
    </div>
  );
}
