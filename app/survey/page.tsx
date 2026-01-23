"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";

// Curriculum option with enabled status from API
interface CurriculumOption {
  name: string;
  enabled: boolean;
}

// Question interface for type safety
interface Question {
  id: number;
  question: string;
  key: string;
  type: "single-choice" | "text" | "textarea" | "number" | "slider";
  answers?: string[];                  // For single-choice (simple strings)
  answersWithStatus?: CurriculumOption[]; // For single-choice with enabled/disabled
  optional?: boolean;        // For skippable questions
  defaultValue?: string | number;
  placeholder?: string;
  min?: number;              // For number/slider
  max?: number;              // For number/slider
  step?: number;             // For slider
  unit?: string;             // For display (e.g., "minuter")
  conditional?: {            // For questions that appear based on previous answers
    dependsOn: string;
    showIf: (value: string | number | undefined) => boolean;
  };
}

// Base survey questions (will be populated with dynamic data)
const getBaseQuestions = (gradeLevels: CurriculumOption[], subjects: CurriculumOption[]): Question[] => [
  {
    id: 1,
    question: "Vilken årskurs undervisar du?",
    key: "gradeLevel",
    type: "single-choice",
    answersWithStatus: gradeLevels
  },
  {
    id: 2,
    question: "Vilket ämne ska lektionen fokusera på?",
    key: "subject",
    type: "single-choice",
    answersWithStatus: subjects
  },
  {
    id: 3,
    question: "Vad är det specifika arbetsområdet? (valfritt)",
    key: "workArea",
    type: "text",
    optional: true,
    placeholder: "T.ex. 'Mäta utomhus', 'Taluppfattning', 'Ekosystem'..."
  },
  {
    id: 4,
    question: "Vilken årstid planerar du för?",
    key: "season",
    type: "single-choice",
    answers: ["Vår", "Sommar", "Höst", "Vinter"]
  },
  {
    id: 5,
    question: "Var ska lektionen äga rum?",
    key: "location",
    type: "single-choice",
    answers: ["Skolgård", "Park", "Äng", "Skog", "Strand/vatten", "Idrottsplats", "Grillplats", "Annan plats"]
  },
  {
    id: 6,
    question: "Hur lång tid har du för hela lektionen?",
    key: "duration",
    type: "single-choice",
    answers: ["45 minuter", "60 minuter", "90 minuter", "120 minuter"]
  },
  {
    id: 7,
    question: "Hur lång är restiden till platsen?",
    key: "travelTime",
    type: "slider",
    min: 0,
    max: 20,
    step: 5,
    defaultValue: 0,
    unit: "minuter",
    conditional: {
      dependsOn: "location",
      showIf: (value) => value !== "Skolgård"
    }
  },
  {
    id: 8,
    question: "Hur många elever har du i klassen?",
    key: "studentCount",
    type: "number",
    defaultValue: 18,
    min: 1,
    max: 40,
    placeholder: "18"
  },
  {
    id: 9,
    question: "Vad jobbar ni med just nu i klassen? (valfritt)",
    key: "currentTheme",
    type: "textarea",
    optional: true,
    placeholder: "T.ex. 'Vi håller på med hållbar utveckling och återvinning' eller 'Läser en bok om naturen'..."
  },
  {
    id: 10,
    question: "Finns det särskilda klassförutsättningar att ta hänsyn till? (valfritt)",
    key: "classConditions",
    type: "textarea",
    optional: true,
    placeholder: "T.ex. 'Några elever har koncentrationssvårigheter', 'En elev är rullstolsburen', 'Mycket energisk grupp'..."
  },
  {
    id: 11,
    question: "Vilken pedagogisk inriktning föredrar du? (valfritt)",
    key: "pedagogicalApproach",
    type: "single-choice",
    optional: true,
    answers: ["Utforskande", "Strukturerat"]
  }
];

export default function SurveyPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({
    studentCount: 18,  // Default value
    travelTime: 0      // Default value
  });
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [textInput, setTextInput] = useState("");
  const [numberInput, setNumberInput] = useState<number>(18);
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [disabledMessage, setDisabledMessage] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial page load for staggered entrance animation
  const [mounted, setMounted] = useState(false); // Track client-side mount for hydration-safe animations

  // Load dynamic curriculum data on mount
  useEffect(() => {
    async function loadCurriculumData() {
      try {
        const response = await fetch('/api/curriculum');
        const data = await response.json();

        // Populate questions with dynamic data (now includes enabled status)
        const dynamicQuestions = getBaseQuestions(data.gradeLevels, data.subjects);
        setQuestions(dynamicQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load curriculum data:', error);
        // Fallback to default questions (all enabled)
        const fallbackQuestions = getBaseQuestions(
          [
            { name: 'Årskurs 1-3', enabled: true },
            { name: 'Årskurs 4-6', enabled: true },
            { name: 'Årskurs 7-9', enabled: true },
          ],
          [
            { name: 'Naturvetenskap', enabled: true },
            { name: 'Matematik', enabled: true },
            { name: 'Idrott och hälsa', enabled: true },
            { name: 'Språk och kommunikation', enabled: true },
          ]
        );
        setQuestions(fallbackQuestions);
        setLoading(false);
      }
    }
    loadCurriculumData();
  }, []);

  // Get visible questions (accounting for conditionals)
  const getVisibleQuestions = () => {
    return questions.filter(q => {
      if (!q.conditional) return true;
      const dependentValue = answers[q.conditional.dependsOn];
      return q.conditional.showIf(dependentValue);
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const current = visibleQuestions[currentQuestion];

  // Load existing answers from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("surveyData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAnswers(parsedData);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Initialize input states when question changes
  useEffect(() => {
    if (!current) return;

    const existingValue = answers[current.key];

    if (current.type === "text" || current.type === "textarea") {
      setTextInput(existingValue as string || "");
    } else if (current.type === "number") {
      setNumberInput(existingValue as number || current.defaultValue as number || 1);
    } else if (current.type === "slider") {
      setSliderValue([existingValue as number || current.defaultValue as number || 0]);
    }
  }, [currentQuestion, current, answers]);

  // Calculate progress percentage (guard against division by zero)
  const progress = visibleQuestions.length > 0
    ? ((currentQuestion + 1) / visibleQuestions.length) * 100
    : 0;

  // Handle answer selection for single-choice
  const handleSingleChoice = (answer: string) => {
    saveAnswer(answer);
    moveToNext();
  };

  // Handle click on disabled option
  const handleDisabledClick = () => {
    setDisabledMessage("Detta alternativ är inte tillgängligt under betatestning. Vi jobbar på att göra fler ämnen och årskurser tillgängliga snart!");
    setTimeout(() => setDisabledMessage(null), 4000);
  };

  // Handle text/textarea/number submission
  const handleTextSubmit = () => {
    if (current.type === "text" || current.type === "textarea") {
      if (!current.optional && !textInput.trim()) {
        return; // Don't proceed if required field is empty
      }
      saveAnswer(textInput);
    } else if (current.type === "number") {
      saveAnswer(numberInput);
    } else if (current.type === "slider") {
      saveAnswer(sliderValue[0]);
    }
    moveToNext();
  };

  // Handle skip for optional questions
  const handleSkip = () => {
    saveAnswer(undefined);
    moveToNext();
  };

  // Save answer to state and localStorage
  const saveAnswer = (answer: string | number | undefined) => {
    const updatedAnswers = { ...answers };

    if (answer === undefined) {
      delete updatedAnswers[current.key];
    } else {
      updatedAnswers[current.key] = answer;
    }

    setAnswers(updatedAnswers);
    localStorage.setItem("surveyData", JSON.stringify(updatedAnswers));
  };

  // Move to next question or finish
  const moveToNext = () => {
    // If this is the last question, navigate to confirmation page
    if (currentQuestion >= visibleQuestions.length - 1) {
      console.log("Survey complete! Answers:", answers);
      router.push('/survey/confirm');
      return;
    }

    // Set direction for animation and move to next question
    setDirection(1);
    setCurrentQuestion(currentQuestion + 1);
  };

  // Handle going back to previous question or start page
  const handleBack = () => {
    if (currentQuestion === 0) {
      router.push('/');
    } else {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Render input based on question type
  const renderInput = () => {
    if (!current) return null;

    switch (current.type) {
      case "single-choice":
        // Handle both old format (answers) and new format (answersWithStatus)
        const options = current.answersWithStatus
          ? current.answersWithStatus
          : current.answers?.map(a => ({ name: a, enabled: true })) || [];

        // Use two columns for 6+ options, compact grid for 8+ options on mobile
        const useGrid = options.length >= 6;
        const useCompactGrid = options.length >= 8;

        return (
          <div className={`w-full ${useGrid
            ? `grid ${useCompactGrid ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-2 sm:gap-3 max-w-xl`
            : 'flex flex-col gap-3 items-center md:items-start'}`}>
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => option.enabled
                  ? handleSingleChoice(option.name)
                  : handleDisabledClick()
                }
                className={`${useCompactGrid ? 'px-4 py-3 text-sm sm:px-6 sm:py-3.5 sm:text-base' : 'px-8 py-4'} rounded-full transition-all duration-200
                         text-left ${useGrid ? 'w-full min-w-0' : 'min-w-[200px] md:min-w-[240px]'}
                         focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2
                         ${option.enabled
                           ? 'bg-[#4377BB] text-white hover:bg-[#365f96] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                           : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                         }`}
                style={{
                  fontFamily: 'Inter Variable, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '-0.01em'
                }}
              >
                {option.name}
              </button>
            ))}
          </div>
        );

      case "text":
        return (
          <div className="w-full max-w-md">
            <label htmlFor={`input-${current.key}`} className="sr-only">
              {current.question}
            </label>
            <input
              id={`input-${current.key}`}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={current.placeholder}
              aria-describedby={current.optional ? `optional-${current.key}` : undefined}
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-[#4377BB]/30
                       focus:border-[#4377BB] focus:outline-none transition-colors
                       bg-white focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              style={{ fontFamily: 'Inter Variable, sans-serif' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSubmit();
                }
              }}
            />
            {current.optional && (
              <span id={`optional-${current.key}`} className="sr-only">Detta fält är valfritt</span>
            )}
            <button
              onClick={handleTextSubmit}
              disabled={!current.optional && !textInput.trim()}
              className="mt-4 px-8 py-3 bg-[#4377BB] text-white rounded-full
                       hover:bg-[#365f96] transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              style={{
                fontFamily: 'Inter Variable, sans-serif',
                fontWeight: 600
              }}
            >
              Fortsätt
            </button>
          </div>
        );

      case "textarea":
        return (
          <div className="w-full max-w-md">
            <label htmlFor={`textarea-${current.key}`} className="sr-only">
              {current.question}
            </label>
            <textarea
              id={`textarea-${current.key}`}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={current.placeholder}
              rows={4}
              aria-describedby={current.optional ? `optional-${current.key}` : undefined}
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-[#4377BB]/30
                       focus:border-[#4377BB] focus:outline-none transition-colors
                       bg-white resize-none focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              style={{ fontFamily: 'Inter Variable, sans-serif' }}
            />
            {current.optional && (
              <span id={`optional-${current.key}`} className="sr-only">Detta fält är valfritt</span>
            )}
            <button
              onClick={handleTextSubmit}
              disabled={!current.optional && !textInput.trim()}
              className="mt-4 px-8 py-3 bg-[#4377BB] text-white rounded-full
                       hover:bg-[#365f96] transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              style={{
                fontFamily: 'Inter Variable, sans-serif',
                fontWeight: 600
              }}
            >
              Fortsätt
            </button>
          </div>
        );

      case "number":
        return (
          <div className="w-full max-w-md">
            <label htmlFor={`number-${current.key}`} className="sr-only">
              {current.question}
            </label>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setNumberInput(Math.max((current.min || 1), numberInput - 1))}
                aria-label="Minska antal"
                className="w-12 h-12 bg-[#4377BB] text-white rounded-full
                         hover:bg-[#365f96] transition-all duration-200
                         text-2xl font-bold focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              >
                −
              </button>
              <input
                id={`number-${current.key}`}
                type="number"
                value={numberInput}
                onChange={(e) => setNumberInput(Math.max(current.min || 1, Math.min(current.max || 100, parseInt(e.target.value) || 0)))}
                min={current.min}
                max={current.max}
                className="flex-1 px-6 py-4 text-2xl text-center rounded-2xl border-2 border-[#4377BB]/30
                         focus:border-[#4377BB] focus:outline-none transition-colors
                         bg-white font-semibold text-[#4377BB] focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
                style={{ fontFamily: 'Inter Variable, sans-serif' }}
              />
              <button
                onClick={() => setNumberInput(Math.min((current.max || 100), numberInput + 1))}
                aria-label="Öka antal"
                className="w-12 h-12 bg-[#4377BB] text-white rounded-full
                         hover:bg-[#365f96] transition-all duration-200
                         text-2xl font-bold focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              >
                +
              </button>
            </div>
            <button
              onClick={handleTextSubmit}
              className="px-8 py-3 bg-[#4377BB] text-white rounded-full
                       hover:bg-[#365f96] transition-all duration-200
                       focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              style={{
                fontFamily: 'Inter Variable, sans-serif',
                fontWeight: 600
              }}
            >
              Fortsätt
            </button>
          </div>
        );

      case "slider":
        return (
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-center md:text-left mb-6">
                <span className="text-5xl font-bold text-[#4377BB]" aria-live="polite">
                  {sliderValue[0]}
                </span>
                <span className="text-2xl text-[#4377BB]/60 ml-2">
                  {current.unit}
                </span>
              </div>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                min={current.min || 0}
                max={current.max || 100}
                step={current.step || 1}
                aria-label={current.question}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-[#4377BB]/60">
                <span>{current.min || 0} {current.unit}</span>
                <span>{current.max || 100} {current.unit}</span>
              </div>
            </div>
            <button
              onClick={handleTextSubmit}
              className="px-8 py-3 bg-[#4377BB] text-white rounded-full
                       hover:bg-[#365f96] transition-all duration-200
                       focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
              style={{
                fontFamily: 'Inter Variable, sans-serif',
                fontWeight: 600
              }}
            >
              Fortsätt
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Set mounted on client to ensure animations work after hydration
  // Also set body background for mobile safe areas
  useEffect(() => {
    setMounted(true);
    document.body.style.backgroundColor = '#F8EBD7';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  // Only show content when mounted on client and data is ready
  const showContent = mounted && !loading && current;

  return (
    <div className="h-[100dvh] bg-[#F8EBD7] flex flex-col relative overflow-hidden">
      {/* Logo flag - hidden on mobile, animates in from top right on larger screens */}
      <motion.div
        className="absolute top-0 right-4 sm:right-6 md:right-8 z-20 hidden sm:block"
        initial={{ y: -100, opacity: 0 }}
        animate={showContent ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.1,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <div style={{ backgroundColor: '#4377bb' }}>
          <img
            src="/assets/ff_logo.svg"
            alt="Friluftsfrämjandet"
            className="h-16 md:h-20 w-auto"
          />
        </div>
      </motion.div>

      {/* Decorative pattern - dotted orange line (top right) - fixed to viewport */}
      <img
        src="/assets/pattern-2-dotted-line.svg"
        alt=""
        className="fixed top-0 right-0 w-[300px] md:w-[400px] lg:w-[485px] pointer-events-none hidden md:block z-0"
        style={{ transform: 'translate(10%, -10%)' }}
      />

      {/* Decorative pattern - blue line (bottom right) - fixed to viewport */}
      <img
        src="/assets/pattern-1-blue-line.svg"
        alt=""
        className="fixed bottom-0 right-0 w-[350px] md:w-[450px] lg:w-[508px] pointer-events-none hidden md:block z-0"
        style={{ transform: 'translate(15%, 25%)' }}
      />

      {/* Toast message for disabled options */}
      {disabledMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50
                     bg-white border border-gray-200 rounded-2xl shadow-xl
                     px-6 py-4 max-w-md mx-4
                     animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ fontFamily: 'Inter Variable, sans-serif' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 text-lg">⏳</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {disabledMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with progress bar - full width, no rounded corners */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Enkätframsteg: fråga ${currentQuestion + 1} av ${visibleQuestions.length}`}
        className="w-full bg-white/10 relative z-10 h-3 overflow-hidden"
      >
        {/* Progress fill - blue bar on transparent white background */}
        <motion.div
          className="h-full bg-[#4377BB]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-10 md:py-16 lg:py-24 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {showContent && (
            <motion.div
              key={currentQuestion}
              initial={initialLoad ? { opacity: 0 } : { opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              onAnimationComplete={() => {
                if (initialLoad) setInitialLoad(false);
              }}
              className="max-w-7xl w-full"
            >
            {/* Question - left aligned on desktop, centered on mobile */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#4377BB] mb-10 md:mb-14 lg:mb-16 text-center md:text-left max-w-2xl"
              style={{
                fontFamily: 'Jakarta Sans, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
              initial={initialLoad ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: initialLoad ? 0.1 : 0,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {currentQuestion + 1}. {current.question}
            </motion.h1>

            {/* Input area - left aligned on desktop */}
            <motion.div
              className="flex flex-col items-center md:items-start"
              initial={initialLoad ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: initialLoad ? 0.25 : 0,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {renderInput()}
            </motion.div>

            {/* Navigation buttons */}
            <motion.div
              className="mt-10 md:mt-14 flex justify-center md:justify-start gap-6 items-center pb-4"
              initial={initialLoad ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: initialLoad ? 0.4 : 0,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {/* Back button */}
              <button
                onClick={handleBack}
                className="text-[#4377BB] hover:text-[#365f96] transition-colors
                         flex items-center gap-2 py-2 text-sm sm:text-base"
                style={{
                  fontFamily: 'Inter Variable, sans-serif',
                  fontWeight: 500
                }}
              >
                ← {currentQuestion === 0 ? 'Till startsidan' : 'Tillbaka'}
              </button>

              {/* Skip button for optional questions */}
              {current.optional && (
                <button
                  onClick={handleSkip}
                  className="text-[#4377BB]/60 hover:text-[#4377BB] transition-colors py-2 text-sm sm:text-base"
                  style={{
                    fontFamily: 'Inter Variable, sans-serif',
                    fontWeight: 500
                  }}
                >
                  Hoppa över →
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
