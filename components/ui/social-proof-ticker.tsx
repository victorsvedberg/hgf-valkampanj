"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Signer {
  displayName: string;
  minutesAgo: number;
}

interface SocialProofTickerProps {
  petitionId?: string;
  className?: string;
  /** Interval in ms between ticker updates */
  rotationInterval?: number;
  /** Interval in ms between API fetches */
  fetchInterval?: number;
}

function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return "just nu";
  if (minutes === 1) return "för 1 minut sedan";
  if (minutes < 60) return `för ${minutes} minuter sedan`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "för 1 timme sedan";
  if (hours < 24) return `för ${hours} timmar sedan`;

  return "för över ett dygn sedan";
}

export function SocialProofTicker({
  petitionId = "stoppa-marknadshyror-2026",
  className = "",
  rotationInterval = 5000,
  fetchInterval = 30000,
}: SocialProofTickerProps) {
  const [signers, setSigners] = useState<Signer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch recent signers
  const fetchSigners = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/signatures/recent?petitionId=${petitionId}&limit=5`
      );
      const data = await response.json();
      if (data.signers && data.signers.length > 0) {
        setSigners(data.signers);
      }
    } catch (error) {
      console.error("Failed to fetch recent signers:", error);
    }
  }, [petitionId]);

  // Initial fetch and interval
  useEffect(() => {
    fetchSigners();
    const interval = setInterval(fetchSigners, fetchInterval);
    return () => clearInterval(interval);
  }, [fetchSigners, fetchInterval]);

  // Rotate through signers
  useEffect(() => {
    if (signers.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % signers.length);
        setIsVisible(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [signers.length, rotationInterval]);

  // Add a new signer to the top (called after successful signature)
  const addSigner = useCallback((displayName: string) => {
    setSigners((prev) => [{ displayName, minutesAgo: 0 }, ...prev.slice(0, 4)]);
    setCurrentIndex(0);
  }, []);

  // Expose addSigner for parent components
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __addSigner?: (name: string) => void }).__addSigner = addSigner;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as unknown as { __addSigner?: (name: string) => void }).__addSigner;
      }
    };
  }, [addSigner]);

  if (signers.length === 0) {
    return null;
  }

  const currentSigner = signers[currentIndex];

  return (
    <div className={`text-white/80 text-sm ${className}`}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span className="font-semibold text-white">
              {currentSigner.displayName}
            </span>{" "}
            skrev under {formatTimeAgo(currentSigner.minutesAgo)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
