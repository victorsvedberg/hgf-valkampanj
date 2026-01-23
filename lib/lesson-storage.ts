/**
 * Lesson storage utility
 * Handles saving and retrieving generated lessons from localStorage
 */

export interface StoredLesson {
  id: string;
  createdAt: string;
  title: string;
  surveyData: {
    gradeLevel: string;
    subject: string;
    season: string;
    duration: string;
    location?: string;
    studentCount?: number;
    [key: string]: unknown;
  };
  markdown: string;
}

export interface LessonStorage {
  lessons: StoredLesson[];
  currentLessonId: string | null;
  generatingForSurvey: string | null; // Hash of survey data when generation in progress
}

const STORAGE_KEY = 'outomaten_lessons';
const MAX_LESSONS = 50; // Limit to prevent localStorage overflow

/**
 * Generate a unique ID for a lesson
 */
function generateLessonId(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = Math.random().toString(36).substring(2, 8);
  return `lesson-${timestamp}-${random}`;
}

/**
 * Extract title from markdown content
 */
function extractTitle(markdown: string): string {
  // Look for first H1 heading
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  // Fallback to first line or default
  const firstLine = markdown.split('\n')[0];
  return firstLine?.substring(0, 50) || 'Untitled Lesson';
}

/**
 * Create a hash of survey data to detect same survey
 */
export function hashSurveyData(surveyData: Record<string, unknown>): string {
  const str = JSON.stringify(surveyData, Object.keys(surveyData).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Get the lesson storage from localStorage
 */
export function getLessonStorage(): LessonStorage {
  if (typeof window === 'undefined') {
    return { lessons: [], currentLessonId: null, generatingForSurvey: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse lesson storage:', error);
  }

  return { lessons: [], currentLessonId: null, generatingForSurvey: null };
}

/**
 * Save the lesson storage to localStorage
 */
function saveLessonStorage(storage: LessonStorage): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Failed to save lesson storage:', error);
    // If storage is full, try removing oldest lessons
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      const trimmedStorage = {
        ...storage,
        lessons: storage.lessons.slice(-10) // Keep only last 10
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedStorage));
    }
  }
}

/**
 * Save a generated lesson
 */
export function saveLesson(
  markdown: string,
  surveyData: Record<string, unknown>
): StoredLesson {
  const storage = getLessonStorage();

  const lesson: StoredLesson = {
    id: generateLessonId(),
    createdAt: new Date().toISOString(),
    title: extractTitle(markdown),
    surveyData: surveyData as StoredLesson['surveyData'],
    markdown
  };

  // Add to beginning of array (newest first)
  storage.lessons.unshift(lesson);

  // Trim to max lessons
  if (storage.lessons.length > MAX_LESSONS) {
    storage.lessons = storage.lessons.slice(0, MAX_LESSONS);
  }

  // Set as current
  storage.currentLessonId = lesson.id;
  storage.generatingForSurvey = null;

  saveLessonStorage(storage);

  return lesson;
}

/**
 * Get a lesson by ID
 */
export function getLesson(id: string): StoredLesson | null {
  const storage = getLessonStorage();
  return storage.lessons.find(l => l.id === id) || null;
}

/**
 * Get the current lesson
 */
export function getCurrentLesson(): StoredLesson | null {
  const storage = getLessonStorage();
  if (!storage.currentLessonId) return null;
  return getLesson(storage.currentLessonId);
}

/**
 * Set the current lesson by ID
 */
export function setCurrentLesson(id: string): void {
  const storage = getLessonStorage();
  storage.currentLessonId = id;
  saveLessonStorage(storage);
}

/**
 * Get all saved lessons
 */
export function getAllLessons(): StoredLesson[] {
  const storage = getLessonStorage();
  return storage.lessons;
}

/**
 * Delete a lesson by ID
 */
export function deleteLesson(id: string): void {
  const storage = getLessonStorage();
  storage.lessons = storage.lessons.filter(l => l.id !== id);

  // If deleted lesson was current, clear current
  if (storage.currentLessonId === id) {
    storage.currentLessonId = storage.lessons[0]?.id || null;
  }

  saveLessonStorage(storage);
}

/**
 * Clear the current lesson (to start fresh generation)
 */
export function clearCurrentLesson(): void {
  const storage = getLessonStorage();
  storage.currentLessonId = null;
  storage.generatingForSurvey = null;
  saveLessonStorage(storage);
}

/**
 * Mark that generation is in progress for specific survey data
 */
export function setGeneratingForSurvey(surveyData: Record<string, unknown>): void {
  const storage = getLessonStorage();
  storage.generatingForSurvey = hashSurveyData(surveyData);
  storage.currentLessonId = null; // Clear current while generating
  saveLessonStorage(storage);
}

/**
 * Check if we're currently generating for this survey data
 */
export function isGeneratingForSurvey(surveyData: Record<string, unknown>): boolean {
  const storage = getLessonStorage();
  return storage.generatingForSurvey === hashSurveyData(surveyData);
}

/**
 * Clear the generating flag
 */
export function clearGeneratingFlag(): void {
  const storage = getLessonStorage();
  storage.generatingForSurvey = null;
  saveLessonStorage(storage);
}

/**
 * Format date for display
 */
export function formatLessonDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
