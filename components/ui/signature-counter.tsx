"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SignatureCounterProps {
  petitionId?: string;
  goal?: number;
  className?: string;
  /** Polling interval in ms (default 30s) */
  pollInterval?: number;
}

// Animera ett nummer från 0 till target
function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (target === 0) return;

    // If target increased by a small amount (optimistic update), animate from current
    const startValue =
      prevTarget.current > 0 && target - prevTarget.current <= 5
        ? prevTarget.current
        : 0;

    prevTarget.current = target;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);

      // Ease out cubic för snyggare animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startValue + easeOut * (target - startValue)));

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
  petitionId = "stoppa-marknadshyror-2026",
  goal = 10000,
  className = "",
  pollInterval = 30000,
}: SignatureCounterProps) {
  const [signatures, setSignatures] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hämta antal underskrifter
  const fetchSignatures = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/signatures/count?petitionId=${petitionId}`
      );
      const data = await response.json();
      setSignatures(data.count);
    } catch (error) {
      console.error("Failed to fetch signatures:", error);
    } finally {
      setIsLoading(false);
    }
  }, [petitionId]);

  // Initial fetch
  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  // Polling for updates
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(fetchSignatures, pollInterval);
    return () => clearInterval(interval);
  }, [fetchSignatures, pollInterval]);

  // Optimistic increment method (called from parent)
  const incrementCount = useCallback((amount: number = 1) => {
    setSignatures((prev) => prev + amount);
  }, []);

  // Update count to a specific value (e.g., after API response)
  const updateCount = useCallback((newCount: number) => {
    setSignatures(newCount);
  }, []);

  // Expose methods for parent components
  useEffect(() => {
    if (typeof window !== "undefined") {
      (
        window as unknown as {
          __incrementSignatureCount?: (amount?: number) => void;
          __updateSignatureCount?: (count: number) => void;
        }
      ).__incrementSignatureCount = incrementCount;
      (
        window as unknown as {
          __incrementSignatureCount?: (amount?: number) => void;
          __updateSignatureCount?: (count: number) => void;
        }
      ).__updateSignatureCount = updateCount;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (
          window as unknown as {
            __incrementSignatureCount?: (amount?: number) => void;
          }
        ).__incrementSignatureCount;
        delete (
          window as unknown as { __updateSignatureCount?: (count: number) => void }
        ).__updateSignatureCount;
      }
    };
  }, [incrementCount, updateCount]);

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
        <span className="text-white/80 text-sm">Mål: {formatNumber(goal)}</span>
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
