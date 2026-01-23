"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearCurrentLesson } from "@/lib/lesson-storage";

// Labels for survey keys
const keyLabels: Record<string, string> = {
  gradeLevel: "Årskurs",
  subject: "Ämne",
  workArea: "Arbetsområde",
  season: "Årstid",
  location: "Plats",
  travelTime: "Restid",
  duration: "Lektionstid",
  studentCount: "Antal elever",
  currentTheme: "Aktuellt tema",
  classConditions: "Klassförutsättningar",
  pedagogicalApproach: "Pedagogisk inriktning"
};

// Order of keys for display
const keyOrder = [
  "gradeLevel",
  "subject",
  "workArea",
  "season",
  "location",
  "travelTime",
  "duration",
  "studentCount",
  "currentTheme",
  "classConditions",
  "pedagogicalApproach"
];

export default function ConfirmPage() {
  const router = useRouter();
  const [surveyData, setSurveyData] = useState<Record<string, string | number> | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Set body background for mobile safe areas
  useEffect(() => {
    document.body.style.backgroundColor = '#F8EBD7';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem("surveyData");
    if (savedData) {
      try {
        setSurveyData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading survey data:", error);
        router.push("/survey");
      }
    } else {
      router.push("/survey");
    }
  }, [router]);

  const handleStartGeneration = () => {
    setIsStarting(true);
    // Clear any existing current lesson so results page generates a new one
    clearCurrentLesson();
    router.push("/survey/results");
  };

  const handleBack = () => {
    router.push("/survey");
  };

  const formatValue = (key: string, value: string | number): string => {
    if (key === "travelTime") {
      return value === 0 ? "Ingen restid" : `${value} minuter`;
    }
    if (key === "studentCount") {
      return `${value} elever`;
    }
    return String(value);
  };

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-[#F8EBD7] flex items-center justify-center">
        <div className="text-lg text-[#4377BB]">Laddar...</div>
      </div>
    );
  }

  // Filter to only show answered questions
  const answeredQuestions = keyOrder.filter(key => {
    const value = surveyData[key];
    return value !== undefined && value !== "" && value !== null;
  });

  return (
    <div className="min-h-screen bg-[#F8EBD7] flex flex-col relative overflow-hidden">
      {/* Decorative pattern - dotted orange line (top right) */}
      <img
        src="/assets/pattern-2-dotted-line.svg"
        alt=""
        className="absolute top-0 right-0 w-[300px] md:w-[400px] lg:w-[485px] pointer-events-none hidden md:block"
        style={{ transform: 'translate(10%, -10%)' }}
      />

      {/* Decorative pattern - blue line (bottom right) */}
      <img
        src="/assets/pattern-1-blue-line.svg"
        alt=""
        className="absolute bottom-0 right-0 w-[350px] md:w-[450px] lg:w-[508px] pointer-events-none hidden md:block"
        style={{ transform: 'translate(15%, 25%)' }}
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        <div className="max-w-2xl w-full mx-auto">
          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl text-[#4377BB] mb-8 sm:mb-10 text-center"
            style={{
              fontFamily: 'Jakarta Sans, sans-serif',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Redo att skapa din utelektion?
          </h1>

          {/* Summary card - no shadow */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2
              className="text-lg font-semibold text-[#4377BB] mb-4"
              style={{ fontFamily: 'Inter Variable, sans-serif' }}
            >
              Sammanfattning av dina val
            </h2>

            <div className="space-y-3">
              {answeredQuestions.map((key) => (
                <div
                  key={key}
                  className="flex justify-between items-start py-2 border-b border-[#4377BB]/10 last:border-0"
                >
                  <span
                    className="text-[#4377BB]/70 text-sm"
                    style={{ fontFamily: 'Inter Variable, sans-serif' }}
                  >
                    {keyLabels[key]}
                  </span>
                  <span
                    className="text-[#4377BB] text-sm font-medium text-right max-w-[60%]"
                    style={{ fontFamily: 'Inter Variable, sans-serif' }}
                  >
                    {formatValue(key, surveyData[key])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-[#4377BB]/10 border border-[#4377BB]/20 rounded-lg sm:rounded-xl p-4 sm:p-5 mb-6 sm:mb-8">
            <div className="flex gap-3">
              <div className="text-[#4377BB] text-xl flex-shrink-0" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-[#4377BB] font-semibold text-sm mb-1"
                  style={{ fontFamily: 'Inter Variable, sans-serif' }}
                >
                  Outomaten Beta
                </h3>
                <p
                  className="text-[#4377BB]/80 text-sm leading-relaxed"
                  style={{ fontFamily: 'Inter Variable, sans-serif' }}
                >
                  Lektionsplanen skapas med hjälp av AI och kan innehålla felaktigheter.
                  Se resultatet som inspiration och en grundstruktur som du som lärare
                  kan anpassa och utveckla utifrån din klass och situation.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 items-center">
            <button
              onClick={handleStartGeneration}
              disabled={isStarting}
              className="px-8 sm:px-10 py-3 sm:py-4 bg-[#4377BB] text-white rounded-full
                       hover:bg-[#365f96] transition-all duration-200
                       hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-70 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 text-base sm:text-lg
                       focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              style={{
                fontFamily: 'Inter Variable, sans-serif',
                fontWeight: 600
              }}
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Startar...</span>
                </>
              ) : (
                "Skapa lektionsplan"
              )}
            </button>

            <button
              onClick={handleBack}
              disabled={isStarting}
              className="text-[#4377BB] hover:text-[#365f96] transition-colors
                       py-2 disabled:opacity-50
                       focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2 rounded-lg"
              style={{
                fontFamily: 'Inter Variable, sans-serif',
                fontWeight: 500
              }}
            >
              ← Tillbaka till enkäten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
