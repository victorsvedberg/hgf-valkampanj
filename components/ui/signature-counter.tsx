"use client";

import { useState, useEffect, useRef } from "react";

interface SignatureCounterProps {
  goal?: number;
  className?: string;
}

// Animera ett nummer från 0 till target
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);

      // Ease out cubic för snyggare animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

// Formatera nummer med mellanslag (svensk standard)
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function SignatureCounter({
  goal = 10000,
  className = ""
}: SignatureCounterProps) {
  const [signatures, setSignatures] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hämta antal underskrifter
  useEffect(() => {
    async function fetchSignatures() {
      try {
        const response = await fetch("/api/signatures/count");
        const data = await response.json();
        setSignatures(data.count);
      } catch (error) {
        console.error("Failed to fetch signatures:", error);
        // Fallback till dummy-data
        setSignatures(6713);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSignatures();
  }, []);

  // Starta animation när komponenten blir synlig
  useEffect(() => {
    if (isLoading || hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, hasStarted]);

  const animatedCount = useCountUp(hasStarted ? signatures : 0, 2000);
  const progressPercent = Math.min((signatures / goal) * 100, 100);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {/* Text ovanför */}
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-white font-bold text-xl md:text-2xl">
          {formatNumber(animatedCount)} underskrifter
        </span>
        <span className="text-white/80 text-sm">
          Mål: {formatNumber(goal)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-white/30 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-[2000ms] ease-out"
          style={{ width: hasStarted ? `${progressPercent}%` : "0%" }}
        />
      </div>
    </div>
  );
}
