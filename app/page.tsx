"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  getAllLessons,
  setCurrentLesson,
  formatLessonDate,
  type StoredLesson
} from '@/lib/lesson-storage';

// Split text into individual characters wrapped in spans
function SplitText({ children, className }: { children: string; className?: string }) {
  return (
    <>
      {children.split('').map((char, i) => (
        <span
          key={i}
          className={`inline-block ${className || ''}`}
          style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </span>
      ))}
    </>
  );
}

export default function StartPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [recentLessons, setRecentLessons] = useState<StoredLesson[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [showLessons, setShowLessons] = useState(false);

  // Refs for GSAP animations
  const headingLine1Ref = useRef<HTMLSpanElement>(null);
  const headingLine2Ref = useRef<HTMLSpanElement>(null);
  const subheadingRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  // Use layoutEffect to check localStorage BEFORE paint
  useLayoutEffect(() => {
    const lessons = getAllLessons();
    setRecentLessons(lessons.slice(0, 3));
    setIsReady(true);
  }, []);

  // Prefetch survey page for faster navigation
  useEffect(() => {
    router.prefetch('/survey');
    router.prefetch('/survey/results');
  }, [router]);

  // Set body background to black for mobile safe areas
  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  // GSAP animation on mount
  useEffect(() => {
    if (!isReady) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Get character spans
    const line1Chars = headingLine1Ref.current?.querySelectorAll('span');
    const line2Chars = headingLine2Ref.current?.querySelectorAll('span');
    const subheadingSentences = subheadingRef.current?.querySelectorAll('span');

    // Set initial states - everything hidden
    if (line1Chars) {
      gsap.set(line1Chars, {
        y: 50,
        opacity: 0,
        rotateX: -90,
        transformOrigin: "50% 50% -20px",
      });
    }
    if (line2Chars) {
      gsap.set(line2Chars, {
        y: 40,
        opacity: 0,
        rotateX: -90,
        transformOrigin: "50% 100%",
      });
    }
    if (subheadingSentences) {
      gsap.set(subheadingSentences, {
        y: 15,
        opacity: 0,
        filter: "blur(4px)"
      });
    }
    // Hide button container entirely until needed
    gsap.set(buttonContainerRef.current, {
      opacity: 0,
      y: 15,
      scale: 0.95
    });

    // Animate "Välkommen till" - characters flip in (faster)
    if (line1Chars) {
      tl.to(line1Chars, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.5,
        stagger: {
          each: 0.02,
          from: "start"
        },
        ease: "back.out(1.7)"
      });
    }

    // Animate "Out-O-Maten!" - starts earlier, overlaps more
    if (line2Chars) {
      tl.to(line2Chars, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.5,
        stagger: {
          each: 0.025,
          from: "edges"
        },
        ease: "back.out(1.5)"
      }, "-=0.35");
    }

    // Subheading sentences - starts during heading animation
    if (subheadingSentences) {
      tl.to(subheadingSentences, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.4,
        stagger: 0.08,
        ease: "power2.out"
      }, "-=0.5");
    }

    // Button container appears
    tl.to(buttonContainerRef.current, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.5)"
    }, "+=0.3");

    // Show lessons after main animation
    tl.call(() => {
      if (recentLessons.length > 0) {
        setShowLessons(true);
      }
    }, [], "-=0.2");

    return () => {
      tl.kill();
    };
  }, [isReady, recentLessons.length]);

  const handleStart = () => {
    setIsLoading(true);
    setIsExiting(true);
    // Store initial state in localStorage
    localStorage.setItem("surveyData", JSON.stringify({}));
    // Navigate after exit animation
    setTimeout(() => {
      router.push('/survey');
    }, 400);
  };

  const handleViewLesson = (lessonId: string) => {
    setIsExiting(true);
    setCurrentLesson(lessonId);
    setTimeout(() => {
      router.push('/survey/results');
    }, 400);
  };

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/header_bg.webp')`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Logo flag from top - centered on mobile, left-aligned on desktop */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 md:left-12 z-20"
        initial={{ y: -100, opacity: 0 }}
        animate={isExiting ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: isExiting ? 0 : 0.2,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <div style={{ backgroundColor: '#4377bb' }}>
          <img
            src="/assets/ff_logo.svg"
            alt="Friluftsfrämjandet"
            className="h-24 sm:h-20 md:h-28 w-auto"
          />
        </div>
      </motion.div>

      {/* Content Container - only animate on exit, not on initial load */}
      <motion.div
        className={`relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-8 md:px-6 pt-24 sm:pt-20 md:pt-0 pb-8 text-center text-white transition-opacity duration-300 ${
          isReady && !isExiting ? 'opacity-100' : ''
        }`}
        initial={false}
        animate={isExiting ? {
          opacity: 0,
          y: -20,
          scale: 0.98
        } : {}}
        transition={{
          duration: 0.35,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        style={{ opacity: isReady && !isExiting ? 1 : 0 }}
      >
        {/* Main Heading */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 sm:mb-8 leading-tight perspective-[1000px]"
          style={{
            fontFamily: 'Jakarta Sans, sans-serif',
            fontWeight: 600,
            letterSpacing: '-0.02em'
          }}
        >
          <span ref={headingLine1Ref} className="block" style={{ transformStyle: 'preserve-3d' }}>
            <SplitText>Välkommen till</SplitText>
          </span>
          <span ref={headingLine2Ref} className="block mt-2" style={{ transformStyle: 'preserve-3d' }}>
            <SplitText>Outomaten!</SplitText>
          </span>
        </h1>

        {/* Subheading - split into sentences */}
        <div
          ref={subheadingRef}
          className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
          style={{
            fontFamily: 'Inter Variable, sans-serif',
            fontWeight: 500,
            letterSpacing: '-0.01em'
          }}
        >
          <span className="inline">Varför inte flytta ut klassrummet? </span>
          <span className="inline">Att ha lektion utomhus ökar såväl elevernas inlärning som koncentration och studiemotivation. </span>
          <span className="inline">Mata in dina behov. </span>
          <span className="inline">Få ut idéer till utelektioner på ett klick. </span>
          <span className="inline">Svårare är det inte.</span>
        </div>

        {/* CTA Button */}
        <div ref={buttonContainerRef} className="inline-block">
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="bg-white text-gray-900 px-8 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            style={{
              fontFamily: 'Inter Variable, sans-serif',
              fontWeight: 600,
              letterSpacing: '-0.01em'
            }}
          >
            {isLoading ? "Startar..." : "Sätt igång!"}
          </button>
        </div>

        {/* Recent lessons - always reserve space if lessons exist, then fade in */}
        {recentLessons.length > 0 && (
          <div className="mt-8 sm:mt-12 w-full max-w-md mx-auto sm:max-w-none">
          <p
            className={`text-white/70 text-sm mb-4 transition-all duration-500 ease-out ${
              showLessons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ fontFamily: 'Inter Variable, sans-serif' }}
          >
            Dina senaste lektioner
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center w-full">
            {recentLessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => handleViewLesson(lesson.id)}
                aria-label={`Visa lektion: ${lesson.title}`}
                className={`group relative px-4 py-3 rounded-2xl text-left w-full sm:w-auto sm:max-w-[220px] bg-[#4377BB]/90 backdrop-blur-sm border border-white/30 hover:bg-[#4377BB] hover:border-white/50 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 ${
                  showLessons ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
                style={{
                  transitionDelay: showLessons ? `${index * 100 + 150}ms` : '0ms'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-white text-sm font-medium truncate"
                      style={{ fontFamily: 'Inter Variable, sans-serif' }}
                    >
                      {lesson.title}
                    </p>
                    <p
                      className="text-white/60 text-xs truncate"
                      style={{ fontFamily: 'Inter Variable, sans-serif' }}
                    >
                      {lesson.surveyData.gradeLevel} · {formatLessonDate(lesson.createdAt)}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
        )}
      </motion.div>

      {/* Bottom gradient - stronger on mobile to blend with black body background */}
      <div className="absolute bottom-0 left-0 w-full h-40 sm:h-32 bg-gradient-to-t from-black via-black/70 to-transparent sm:from-black/50 sm:via-transparent pointer-events-none"></div>
    </div>
  );
}