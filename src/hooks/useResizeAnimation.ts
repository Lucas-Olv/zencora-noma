import { useEffect, useRef } from "react";

interface ResizeAnimationOptions {
  duration?: number;
  easing?: string;
}

export const useResizeAnimation = (options: ResizeAnimationOptions = {}) => {
  const { duration = 300, easing = "cubic-bezier(0.4, 0, 0.2, 1)" } = options;

  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add transition styles
    element.style.transition = `all ${duration}ms ${easing}`;
    element.style.willChange = "transform, width, height";

    // Handle resize
    const handleResize = () => {
      requestAnimationFrame(() => {
        // Force reflow to ensure smooth animation
        element.offsetHeight;
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [duration, easing]);

  return elementRef;
};
