import { useEffect, useRef } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  easing?: string;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    delay = 0,
    distance = 20,
    duration = 800,
    easing = "cubic-bezier(0.4, 0, 0.2, 1)",
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add initial styles
    element.style.opacity = "0";
    element.style.transform = `translateY(${distance}px)`;
    element.style.transition = `all ${duration}ms ${easing} ${delay}ms`;
    element.style.willChange = "transform, opacity";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use requestAnimationFrame for smoother animation
            requestAnimationFrame(() => {
              element.style.opacity = "1";
              element.style.transform = "translateY(0)";
            });
            observer.unobserve(element);
          }
        });
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, delay, distance, duration, easing]);

  return elementRef;
};
