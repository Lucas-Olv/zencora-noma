import { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  distance?: number;
  duration?: number;
  easing?: string;
}

export const ScrollReveal = ({
  children,
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px',
  className = '',
  distance = 20,
  duration = 800,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
}: ScrollRevealProps) => {
  const ref = useScrollReveal({ 
    delay, 
    threshold, 
    rootMargin,
    distance,
    duration,
    easing
  }) as React.RefObject<HTMLDivElement>;

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-300 ease-in-out ${className}`}
    >
      {children}
    </div>
  );
}; 