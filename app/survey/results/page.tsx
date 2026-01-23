"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  saveLesson,
  getCurrentLesson,
  getAllLessons,
  setCurrentLesson,
  deleteLesson,
  clearCurrentLesson,
  formatLessonDate,
  type StoredLesson
} from '@/lib/lesson-storage';

// Toast notification component
const Toast = ({
  message,
  isVisible,
  onClose,
  type = 'success'
}: {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-4 md:right-6 z-[100]
                 bg-white border border-gray-200 rounded-2xl shadow-xl
                 px-5 py-4 max-w-sm
                 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ fontFamily: 'Inter Variable, sans-serif' }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-[#4377BB]/10' : 'bg-red-100'
        }`}>
          {type === 'success' ? (
            <svg className="w-4 h-4 text-[#4377BB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Stäng notifikation"
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Split button dropdown component
const DownloadDropdown = ({
  markdownContent,
  onDownloadMarkdown,
  onDownloadPDF,
  showToast
}: {
  markdownContent: string;
  onDownloadMarkdown: () => void;
  onDownloadPDF: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to clean markdown content for copying
  const cleanMarkdownContent = (content: string): string => {
    // Remove tech-summary div
    let cleaned = content.replace(/<div class="tech-summary">[\s\S]*?<\/div>/gi, '');

    // Parse overview-grid and convert to plain text
    cleaned = cleaned.replace(/<div class="overview-grid">([\s\S]*?)<\/div>/gi, (_, inner) => {
      const temp = document.createElement('div');
      temp.innerHTML = inner;
      const items = temp.querySelectorAll('.overview-item, span');
      const textItems = Array.from(items).map(item => item.textContent || '').filter(Boolean);
      return textItems.join(' • ') + '\n';
    });

    // Remove any remaining HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, '');

    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

    return cleaned;
  };

  const handleCopyText = async () => {
    try {
      const cleanedContent = cleanMarkdownContent(markdownContent);
      await navigator.clipboard.writeText(cleanedContent);
      showToast('Lektionsplanen har kopierats till urklipp!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Kunde inte kopiera texten. Försök igen.', 'error');
    }
    setIsOpen(false);
  };

  const handleContinueInClaude = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      // Claude supports ?q= parameter - pre-fill with instruction to paste the lesson
      const prefilledPrompt = encodeURIComponent(
        'Här är en lektionsplan jag skapat. Hjälp mig att vidareutveckla den:\n\n[Klistra in med Cmd+V / Ctrl+V]'
      );
      window.open(`https://claude.ai/new?q=${prefilledPrompt}`, '_blank');
      showToast('Kopierat! Klistra in lektionsplanen med Cmd+V i Claude-chatten.');
    } catch (err) {
      console.error('Failed to copy:', err);
      window.open('https://claude.ai/new', '_blank');
      showToast('Kunde inte kopiera automatiskt. Kopiera manuellt och öppna Claude.', 'error');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        {/* Primary button - now downloads PDF */}
        <button
          onClick={onDownloadPDF}
          className="px-3 py-1.5 text-sm bg-[#4377BB] text-white rounded-l-full hover:bg-[#365f96] transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
          style={{ fontFamily: 'Inter Variable, sans-serif', fontWeight: 500 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Ladda ner PDF
        </button>

        {/* Dropdown trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Fler nedladdningsalternativ"
          aria-expanded={isOpen}
          className="px-2 py-1.5 text-sm bg-[#4377BB] text-white rounded-r-full hover:bg-[#365f96] transition-colors border-l border-[#5a8fd0] focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
          style={{ fontFamily: 'Inter Variable, sans-serif' }}
        >
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          <button
            onClick={() => { onDownloadMarkdown(); setIsOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#4377BB]/5 flex items-center gap-3 transition-colors"
            style={{ fontFamily: 'Inter Variable, sans-serif' }}
          >
            <svg className="w-4 h-4 text-[#4377BB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Ladda ner Markdown
          </button>

          <button
            onClick={handleCopyText}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#4377BB]/5 flex items-center gap-3 transition-colors"
            style={{ fontFamily: 'Inter Variable, sans-serif' }}
          >
            <svg className="w-4 h-4 text-[#4377BB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Kopiera text
          </button>

          <div className="h-px bg-gray-100 my-2" />

          <button
            onClick={handleContinueInClaude}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#4377BB]/5 flex items-center gap-3 transition-colors"
            style={{ fontFamily: 'Inter Variable, sans-serif' }}
          >
            <svg className="w-4 h-4 text-[#4377BB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Fortsätt i Claude
          </button>
        </div>
      )}
    </div>
  );
};

// Lesson history sidebar component with slide animation
const LessonHistory = ({
  lessons,
  currentLessonId,
  onSelectLesson,
  onDeleteLesson,
  isOpen,
  onClose
}: {
  lessons: StoredLesson[];
  currentLessonId: string | null;
  onSelectLesson: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar with slide animation */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tidigare lektioner"
        className={`fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-hidden flex flex-col
        transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
          <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
            Tidigare lektioner
          </h2>
          <button
            onClick={onClose}
            aria-label="Stäng historik"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Inga sparade lektioner ännu
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    lesson.id === currentLessonId ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                  }`}
                  onClick={() => onSelectLesson(lesson.id)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isAnimating ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
                        {lesson.surveyData.gradeLevel} • {lesson.surveyData.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
                        {formatLessonDate(lesson.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Vill du ta bort denna lektion?')) {
                          onDeleteLesson(lesson.id);
                        }
                      }}
                      aria-label={`Ta bort ${lesson.title}`}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with count */}
        {lessons.length > 0 && (
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
              {lessons.length} {lessons.length === 1 ? 'sparad lektion' : 'sparade lektioner'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

// Step indicator component
const StepLoader = ({
  step,
  stepNumber,
  isActive,
  isComplete,
  message
}: {
  step: string;
  stepNumber: number;
  isActive: boolean;
  isComplete: boolean;
  message?: string;
}) => {
  return (
    <div className="relative mb-6">
      <div className="flex items-start gap-4">
        {/* Circle indicator */}
        <div className="relative flex-shrink-0">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-500 ease-in-out
            ${isComplete ? 'bg-[#4377BB] scale-100' :
              isActive ? 'bg-[#4377BB]' :
              'bg-[#4377BB]/20 scale-90'}
          `}>
            {isComplete ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : isActive ? (
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            ) : (
              <span className="text-[#4377BB]/60 font-medium text-sm">{stepNumber}</span>
            )}
          </div>

          {/* Connecting line */}
          {stepNumber < 4 && (
            <div className={`
              absolute top-10 left-5 w-0.5 h-10 -translate-x-1/2
              transition-all duration-500
              ${isComplete ? 'bg-[#4377BB]' : 'bg-[#4377BB]/20'}
            `}></div>
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 pt-2">
          <h3 className={`
            text-base font-medium transition-all duration-500
            ${isActive ? 'text-[#4377BB]' :
              isComplete ? 'text-[#4377BB]' :
              'text-[#4377BB]/40'}
          `} style={{ fontFamily: 'Inter Variable, sans-serif' }}>
            {step}
          </h3>
          {isActive && message && (
            <p className="text-sm text-[#4377BB]/60 mt-1">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} sekunder`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} ${minutes === 1 ? 'minut' : 'minuter'}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} min`;
};

// Loading messages (without emojis)
const loadingMessages = [
  "Skapar din utelektion...",
  "Analyserar läroplanen...",
  "Lägger till pedagogiska moment...",
  "Bygger aktivitetsstrukturen...",
];

export default function ResultsPage() {
  const router = useRouter();

  // Track if client has mounted (avoids hydration mismatch with localStorage)
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // currentStep is no longer used - we use simulatedStep instead
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const hasRequestStarted = useRef(false);
  const hasRequestCompleted = useRef(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(120);
  const startTimeRef = useRef<number>(Date.now());
  // Simulated steps for better UX (progress moves smoothly regardless of API)
  // Total: ~90 seconds to match typical API response time
  const simulatedSteps = [
    { name: 'Skapar kreativt koncept', duration: 25 },
    { name: 'Kopplar till läroplanen', duration: 30 },
    { name: 'Lägger till säkerhetsinfo', duration: 20 },
    { name: 'Färdigställer dokumentet', duration: 15 }
  ];
  const [simulatedStep, setSimulatedStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0); // 0-100 within current step

  // Lesson history state
  const [savedLessons, setSavedLessons] = useState<StoredLesson[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [surveyDataForSave, setSurveyDataForSave] = useState<Record<string, unknown> | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Ref for PDF content
  const documentRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Rotate loading messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Simulated progress animation - moves smoothly through steps based on time
  useEffect(() => {
    if (isLoading && !hasRequestCompleted.current) {
      const totalDuration = simulatedSteps.reduce((sum, s) => sum + s.duration, 0);

      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(Math.floor(elapsed));

        // Calculate which step we should be on based on elapsed time
        let accumulatedTime = 0;
        let currentStepIndex = 0;
        let progressInStep = 0;

        for (let i = 0; i < simulatedSteps.length; i++) {
          const stepDuration = simulatedSteps[i].duration;
          if (elapsed < accumulatedTime + stepDuration) {
            currentStepIndex = i;
            progressInStep = ((elapsed - accumulatedTime) / stepDuration) * 100;
            break;
          }
          accumulatedTime += stepDuration;
          currentStepIndex = i;
          progressInStep = 100;
        }

        // Don't go past 90% on last step until API completes
        if (currentStepIndex === simulatedSteps.length - 1 && progressInStep > 90) {
          progressInStep = 90;
        }

        setSimulatedStep(currentStepIndex);
        setStepProgress(Math.min(progressInStep, 100));

        // Estimate remaining time
        const remaining = Math.max(0, Math.floor(totalDuration - elapsed));
        setEstimatedTimeRemaining(remaining);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, simulatedSteps]);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    // Load saved lessons
    setSavedLessons(getAllLessons());

    // Check for existing current lesson
    const existingLesson = getCurrentLesson();
    if (existingLesson) {
      setMarkdownContent(existingLesson.markdown);
      setCurrentLessonId(existingLesson.id);
      setIsLoading(false);
      hasRequestCompleted.current = true;
    }

    // Mark as mounted so we can render
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Wait for mount before starting generation
    if (!hasMounted) return;

    // Only run once - handle StrictMode double-mounting
    if (hasRequestStarted.current) {
      return;
    }
    hasRequestStarted.current = true;

    // If we already have content, don't generate
    if (hasRequestCompleted.current) {
      return;
    }

    // No existing lesson, start generation
    generateLessonPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted]);

  const generateLessonPlan = async () => {
    // Prevent any calls after completion
    if (hasRequestCompleted.current) {
      console.log('Request already completed, skipping...');
      return;
    }

    try {
      const savedData = localStorage.getItem("surveyData");
      if (!savedData) {
        setError("Ingen undersökningsdata hittades. Vänligen fyll i formuläret först.");
        router.push('/survey');
        return;
      }

      const data = JSON.parse(savedData);
      setSurveyDataForSave(data);
      console.log('Survey data loaded:', data);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate lesson plan');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim()) {
              try {
                const update = JSON.parse(jsonStr);

                if (update.type === 'progress') {
                  // We now use time-based simulated progress for smoother UX
                  // Just update the message if provided
                  if (update.message) {
                    setCurrentMessage(update.message);
                  }
                } else if (update.type === 'complete') {
                  hasRequestCompleted.current = true;

                  // Save the lesson
                  const savedLesson = saveLesson(update.document, surveyDataForSave || data);

                  setMarkdownContent(update.document);
                  setCurrentLessonId(savedLesson.id);
                  setSavedLessons(getAllLessons());
                  setIsLoading(false);
                } else if (update.type === 'error') {
                  throw new Error(update.error);
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      }

    } catch (err) {
      console.error('Error generating lesson plan:', err);
      hasRequestCompleted.current = true;
      setError(err instanceof Error ? err.message : 'Ett fel uppstod vid generering av lektionsplanen.');
      setIsLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lektionsplan-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showToast('Markdown-fil har laddats ner!');
  };

  const handleDownloadPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');

      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper to add text with word wrap and page breaks
      const addText = (text: string, fontSize: number, isBold: boolean = false, isHeading: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');

        if (isHeading) {
          doc.setTextColor(67, 119, 187); // #4377BB
        } else {
          doc.setTextColor(55, 65, 81); // #374151
        }

        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.4;

        for (const line of lines) {
          if (yPos + lineHeight > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        }
      };

      // Helper to add spacing
      const addSpace = (space: number) => {
        yPos += space;
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // Helper to extract text from HTML
      const extractTextFromHtml = (html: string): string => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || '';
      };

      // Helper to parse overview grid
      const parseOverviewGrid = (html: string): string[] => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const items = temp.querySelectorAll('.overview-item, span');
        return Array.from(items).map(item => item.textContent || '').filter(Boolean);
      };

      // Pre-process: remove tech-summary div completely
      const processedContent = markdownContent
        .replace(/<div class="tech-summary">[\s\S]*?<\/div>/gi, '')
        .trim();

      // Parse markdown content into sections
      const lines = processedContent.split('\n');
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
          addSpace(3);
          i++;
          continue;
        }

        // Handle overview-grid HTML block
        if (trimmed.includes('<div class="overview-grid">') || trimmed.includes('overview-grid')) {
          // Collect all lines of this HTML block
          let htmlBlock = trimmed;
          while (i < lines.length - 1 && !htmlBlock.includes('</div>')) {
            i++;
            htmlBlock += ' ' + lines[i].trim();
          }

          // Extract items from the overview grid
          const items = parseOverviewGrid(htmlBlock);
          if (items.length > 0) {
            addText(items.join('  •  '), 10, false, false);
            addSpace(4);
          }
          i++;
          continue;
        }

        // Skip other HTML tags
        if (trimmed.startsWith('<') && trimmed.includes('>')) {
          // Extract text content if any
          const textContent = extractTextFromHtml(trimmed);
          if (textContent && textContent.length > 2) {
            addText(textContent, 10, false, false);
            addSpace(2);
          }
          i++;
          continue;
        }

        // H1
        if (trimmed.startsWith('# ')) {
          addSpace(4);
          addText(trimmed.substring(2), 18, true, true);
          addSpace(6);
        }
        // H2
        else if (trimmed.startsWith('## ')) {
          addSpace(6);
          addText(trimmed.substring(3), 14, true, true);
          addSpace(4);
        }
        // H3
        else if (trimmed.startsWith('### ')) {
          addSpace(4);
          addText(trimmed.substring(4), 12, true, true);
          addSpace(3);
        }
        // H4
        else if (trimmed.startsWith('#### ')) {
          addSpace(3);
          addText(trimmed.substring(5), 11, true, true);
          addSpace(2);
        }
        // Bullet point
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          // Remove markdown bold markers from bullet content
          const bulletContent = trimmed.substring(2).replace(/\*\*(.*?)\*\*/g, '$1');
          addText('• ' + bulletContent, 10, false, false);
          addSpace(2);
        }
        // Numbered list
        else if (/^\d+\.\s/.test(trimmed)) {
          addText(trimmed, 10, false, false);
          addSpace(2);
        }
        // Bold text (simple handling)
        else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          addText(trimmed.slice(2, -2), 10, true, false);
          addSpace(2);
        }
        // Regular paragraph
        else {
          // Remove markdown bold markers for display
          const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
          addText(cleanText, 10, false, false);
          addSpace(2);
        }

        i++;
      }

      // Save the PDF
      doc.save(`lektionsplan-${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('PDF har laddats ner!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast('Kunde inte skapa PDF. Försök igen.', 'error');
    }
  };

  const handleNewLesson = () => {
    // Clear current lesson so we generate fresh
    clearCurrentLesson();
    localStorage.removeItem('surveyData');
    router.push('/survey');
  };

  const handleSelectLesson = (id: string) => {
    const lesson = savedLessons.find(l => l.id === id);
    if (lesson) {
      setCurrentLesson(id);
      setMarkdownContent(lesson.markdown);
      setCurrentLessonId(id);
      setIsHistoryOpen(false);
    }
  };

  const handleDeleteLesson = (id: string) => {
    deleteLesson(id);
    const updatedLessons = getAllLessons();
    setSavedLessons(updatedLessons);

    // If we deleted the current lesson, show the next one or clear
    if (id === currentLessonId) {
      if (updatedLessons.length > 0) {
        handleSelectLesson(updatedLessons[0].id);
      } else {
        setMarkdownContent("");
        setCurrentLessonId(null);
      }
    }
  };


  // Show nothing until client mounts (prevents hydration mismatch)
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#F8EBD7]" />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8EBD7] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Jakarta Sans, sans-serif' }}>
            Något gick fel
          </h2>
          <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
            {error}
          </p>
          <button
            onClick={handleNewLesson}
            className="px-6 py-3 bg-[#4377BB] text-white rounded-full hover:bg-[#365f96] transition-colors"
            style={{ fontFamily: 'Inter Variable, sans-serif', fontWeight: 500 }}
          >
            Börja om
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8EBD7] flex items-center justify-center px-4 py-8 relative overflow-hidden">
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

        <div className="max-w-xl w-full relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-[#4377BB] mb-4"
                style={{
                  fontFamily: 'Jakarta Sans, sans-serif',
                  fontWeight: 700,
                }}>
              Skapar din lektion...
            </h1>
            <p className="text-base sm:text-lg text-[#4377BB]/60"
               style={{ fontFamily: 'Inter Variable, sans-serif' }}>
              {loadingMessage}
            </p>
          </div>

          {/* Progress card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8">
            {/* Time info */}
            <div className="mb-6 text-center">
              <p className="text-sm text-[#4377BB]/60 mb-1" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
                Beräknad tid: <span className="font-medium text-[#4377BB]">ca 1-2 minuter</span>
              </p>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="text-[#4377BB]/50" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
                  {formatTime(elapsedTime)} förfluten
                </span>
                <span className="text-[#4377BB]/30">•</span>
                <span className="text-[#4377BB]/50" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
                  ca <span className="font-medium text-[#4377BB]">{formatTime(estimatedTimeRemaining)}</span> kvar
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-[#4377BB]/60 mb-2">
                <span style={{ fontFamily: 'Inter Variable, sans-serif' }}>Framsteg</span>
                <span style={{ fontFamily: 'Inter Variable, sans-serif' }}>
                  {Math.round(((simulatedStep + stepProgress / 100) / simulatedSteps.length) * 100)}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(((simulatedStep + stepProgress / 100) / simulatedSteps.length) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Genererar lektionsplan"
                className="relative h-2 bg-[#4377BB]/10 rounded-full overflow-hidden"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[#4377BB] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((simulatedStep + stepProgress / 100) / simulatedSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div>
              {simulatedSteps.map((step, index) => (
                <StepLoader
                  key={index}
                  step={step.name}
                  stepNumber={index + 1}
                  isActive={index === simulatedStep}
                  isComplete={index < simulatedStep}
                  message={index === simulatedStep ? currentMessage : undefined}
                />
              ))}
            </div>
          </div>

          {/* Bottom message */}
          <div className="text-center mt-6">
            <p className="text-[#4377BB]/40 text-sm" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
              Outomaten drivs av AI från Anthropic
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8EBD7]">
      {/* Toast notification */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />

      {/* Lesson History Sidebar */}
      <LessonHistory
        lessons={savedLessons}
        currentLessonId={currentLessonId}
        onSelectLesson={handleSelectLesson}
        onDeleteLesson={handleDeleteLesson}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Header - responsive layout */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
          {/* Stack vertically with left alignment */}
          <div className="flex flex-col gap-3">
            <h1 className="text-xl md:text-2xl text-[#4377BB]"
                style={{ fontFamily: 'Jakarta Sans, sans-serif', fontWeight: 600 }}>
              Din lektionsplan är klar!
            </h1>

            {/* Action buttons - left aligned */}
            <div className="flex gap-2 items-center flex-wrap">
              {/* History button - icon only on mobile */}
              <button
                onClick={() => setIsHistoryOpen(true)}
                aria-label="Visa tidigare lektioner"
                className="flex-shrink-0 p-2 md:px-3 md:py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
                style={{ fontFamily: 'Inter Variable, sans-serif', fontWeight: 500 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden md:inline">Historik</span>
                {savedLessons.length > 0 && (
                  <span className="bg-gray-300 text-gray-700 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {savedLessons.length}
                  </span>
                )}
              </button>

              <DownloadDropdown
                markdownContent={markdownContent}
                onDownloadMarkdown={handleDownloadMarkdown}
                onDownloadPDF={handleDownloadPDF}
                showToast={showToast}
              />

              <button
                onClick={handleNewLesson}
                className="flex-shrink-0 px-3 py-2 md:py-1.5 text-sm bg-[#4377BB] text-white rounded-full hover:bg-[#365f96] transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#4377BB] focus-visible:ring-offset-2"
                style={{ fontFamily: 'Inter Variable, sans-serif', fontWeight: 500 }}
              >
                <span className="hidden sm:inline">Skapa ny lektion</span>
                <span className="sm:hidden flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ny
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div ref={documentRef} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 border border-gray-100">
          <div className="prose prose-lg max-w-none"
               style={{ fontFamily: 'Inter Variable, sans-serif' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({children}) => (
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#4377BB] mb-4 sm:mb-6"
                      style={{ fontFamily: 'Jakarta Sans, sans-serif', fontWeight: 600 }}>
                    {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 className="text-xl sm:text-2xl text-[#4377BB] mt-6 sm:mt-8 mb-3 sm:mb-4"
                      style={{ fontFamily: 'Jakarta Sans, sans-serif', fontWeight: 600 }}>
                    {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 className="text-lg sm:text-xl text-[#4377BB] mt-5 sm:mt-6 mb-2 sm:mb-3"
                      style={{ fontFamily: 'Inter Variable, sans-serif', fontWeight: 600 }}>
                    {children}
                  </h3>
                ),
                h4: ({children}) => (
                  <h4 className="text-base sm:text-lg text-[#4377BB] mt-4 sm:mt-5 mb-2"
                      style={{ fontFamily: 'Inter Variable, sans-serif', fontWeight: 600 }}>
                    {children}
                  </h4>
                ),
                p: ({children}) => (
                  <p className="mb-4 leading-relaxed text-gray-700">
                    {children}
                  </p>
                ),
                ul: ({children}) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                    {children}
                  </ul>
                ),
                li: ({children}) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
                strong: ({children}) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
