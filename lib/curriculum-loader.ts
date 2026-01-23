/**
 * Dynamic curriculum loader
 * Auto-discovers subjects from curriculum directory structure
 *
 * Structure:
 * prompts/curriculum/
 *   arskurs-1-3/
 *     matematik/
 *       expert.md    <- Pedagogisk expertis och exempel
 *       lgr22.md     <- Läroplansinnehåll
 *     idrott-och-halsa/
 *       expert.md
 *       lgr22.md
 *     ...
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { isGradeLevelEnabled, isSubjectEnabled } from '@/config/curriculum-config';

// Normalize grade level string to directory name
function normalizeGradeLevel(gradeLevel: string): string {
  const mapping: Record<string, string> = {
    'Årskurs 1-3': 'arskurs-1-3',
    'Årskurs 4-6': 'arskurs-4-6',
    'Årskurs 7-9': 'arskurs-7-9',
  };
  return mapping[gradeLevel] || gradeLevel.toLowerCase().replace(/\s+/g, '-').replace(/å/g, 'a');
}

// Normalize subject string to folder name
function normalizeSubject(subject: string): string {
  return subject
    .toLowerCase()
    .replace(/\s+och\s+/g, '-och-')
    .replace(/\s+/g, '-')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o');
}

// Extract display name from expert.md's H1 heading
// Format: "# Ämnesnamn - Årskurs X-Y - Expert" -> "Ämnesnamn"
async function getDisplayNameFromFolder(folderPath: string): Promise<string | null> {
  try {
    const expertPath = join(folderPath, 'expert.md');
    const content = await readFile(expertPath, 'utf-8');
    const firstLine = content.split('\n')[0];

    // Match H1 heading: "# Subject Name - Grade - Expert"
    const match = firstLine.match(/^#\s+(.+?)(?:\s+-\s+|$)/);
    if (match) {
      return match[1].trim();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Load Expert context from expert.md file
 * Simple file read - no regex extraction needed
 */
export async function loadExpertContext(
  gradeLevel: string,
  subject: string
): Promise<string> {
  try {
    const curriculumDir = join(process.cwd(), 'prompts', 'curriculum');
    const gradeLevelDir = normalizeGradeLevel(gradeLevel);
    const subjectDir = normalizeSubject(subject);
    const expertPath = join(curriculumDir, gradeLevelDir, subjectDir, 'expert.md');

    const content = await readFile(expertPath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to load expert context for ${gradeLevel} - ${subject}:`, error);
    return `Du är specialist på ${subject.toLowerCase()} för ${gradeLevel.toLowerCase()}.`;
  }
}

/**
 * Load Lgr22 context from lgr22.md file
 * Simple file read - no regex extraction needed
 */
export async function loadLgr22Context(
  gradeLevel: string,
  subject: string
): Promise<string> {
  try {
    const curriculumDir = join(process.cwd(), 'prompts', 'curriculum');
    const gradeLevelDir = normalizeGradeLevel(gradeLevel);
    const subjectDir = normalizeSubject(subject);
    const lgr22Path = join(curriculumDir, gradeLevelDir, subjectDir, 'lgr22.md');

    const content = await readFile(lgr22Path, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to load Lgr22 context for ${gradeLevel} - ${subject}:`, error);
    return 'Allmän pedagogisk utveckling genom utomhusaktiviteter.';
  }
}

/**
 * Subject/Grade level option with enabled status
 */
export interface CurriculumOption {
  name: string;
  enabled: boolean;
}

/**
 * Check if path is a directory with the new folder structure (has expert.md)
 */
async function isSubjectFolder(path: string): Promise<boolean> {
  try {
    const expertPath = join(path, 'expert.md');
    const expertStat = await stat(expertPath);
    return expertStat.isFile();
  } catch {
    return false;
  }
}

/**
 * Get all available subjects by scanning curriculum directories
 * Returns array of display names read from each subject's expert.md
 * Filters based on config/curriculum-config.ts settings
 */
export async function getAvailableSubjects(): Promise<string[]> {
  try {
    const curriculumDir = join(process.cwd(), 'prompts', 'curriculum');
    const referenceDir = join(curriculumDir, 'arskurs-1-3');
    const entries = await readdir(referenceDir, { withFileTypes: true });

    const subjects: string[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const folderPath = join(referenceDir, entry.name);

      // Check if this is a subject folder (has expert.md)
      if (await isSubjectFolder(folderPath)) {
        const displayName = await getDisplayNameFromFolder(folderPath);
        if (displayName && isSubjectEnabled(displayName)) {
          subjects.push(displayName);
        }
      }
    }

    return subjects.sort();
  } catch (error) {
    console.error('Failed to load available subjects:', error);
    return [
      'Idrott och hälsa',
      'Matematik',
      'Naturvetenskap',
      'Språk och kommunikation',
    ].filter(isSubjectEnabled);
  }
}

/**
 * Get all subjects with their enabled/disabled status
 * Returns all subjects, marking which ones are enabled for selection
 */
export async function getSubjectsWithStatus(): Promise<CurriculumOption[]> {
  try {
    const curriculumDir = join(process.cwd(), 'prompts', 'curriculum');
    const referenceDir = join(curriculumDir, 'arskurs-1-3');
    const entries = await readdir(referenceDir, { withFileTypes: true });

    const subjects: CurriculumOption[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const folderPath = join(referenceDir, entry.name);

      if (await isSubjectFolder(folderPath)) {
        const displayName = await getDisplayNameFromFolder(folderPath);
        if (displayName) {
          subjects.push({
            name: displayName,
            enabled: isSubjectEnabled(displayName),
          });
        }
      }
    }

    // Sort: enabled first, then alphabetically within each group
    return subjects.sort((a, b) => {
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      return a.name.localeCompare(b.name, 'sv');
    });
  } catch (error) {
    console.error('Failed to load subjects with status:', error);
    const fallback = ['Idrott och hälsa', 'Matematik', 'Naturvetenskap', 'Språk och kommunikation'];
    return fallback.map(name => ({ name, enabled: isSubjectEnabled(name) }))
      .sort((a, b) => {
        if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
        return a.name.localeCompare(b.name, 'sv');
      });
  }
}

/**
 * Get all available grade levels by scanning curriculum directory
 * Directory names: arskurs-1-3, arskurs-4-6, arskurs-7-9
 * Filters based on config/curriculum-config.ts settings
 */
export async function getAvailableGradeLevels(): Promise<string[]> {
  try {
    const curriculumDir = join(process.cwd(), 'prompts', 'curriculum');
    const dirs = await readdir(curriculumDir, { withFileTypes: true });

    const gradeLevels = dirs
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        // Convert directory name to display name (Lgr22 format)
        if (dirent.name === 'arskurs-1-3') return 'Årskurs 1-3';
        if (dirent.name === 'arskurs-4-6') return 'Årskurs 4-6';
        if (dirent.name === 'arskurs-7-9') return 'Årskurs 7-9';
        return null; // Ignore other directories
      })
      .filter((name): name is 'Årskurs 1-3' | 'Årskurs 4-6' | 'Årskurs 7-9' => name !== null && isGradeLevelEnabled(name))
      .sort();

    return gradeLevels;
  } catch (error) {
    console.error('Failed to load available grade levels:', error);
    return [
      'Årskurs 1-3',
      'Årskurs 4-6',
      'Årskurs 7-9',
    ].filter(isGradeLevelEnabled);
  }
}

/**
 * Get all grade levels with their enabled/disabled status
 * Returns all grade levels, marking which ones are enabled for selection
 */
export async function getGradeLevelsWithStatus(): Promise<CurriculumOption[]> {
  try {
    const curriculumDir = join(process.cwd(), 'prompts', 'curriculum');
    const dirs = await readdir(curriculumDir, { withFileTypes: true });

    const gradeLevels = dirs
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        if (dirent.name === 'arskurs-1-3') return 'Årskurs 1-3';
        if (dirent.name === 'arskurs-4-6') return 'Årskurs 4-6';
        if (dirent.name === 'arskurs-7-9') return 'Årskurs 7-9';
        return null;
      })
      .filter((name): name is 'Årskurs 1-3' | 'Årskurs 4-6' | 'Årskurs 7-9' => name !== null)
      .map(name => ({
        name,
        enabled: isGradeLevelEnabled(name),
      }))
      .sort((a, b) => {
        if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
        return a.name.localeCompare(b.name, 'sv');
      });

    return gradeLevels;
  } catch (error) {
    console.error('Failed to load grade levels with status:', error);
    const fallback = ['Årskurs 1-3', 'Årskurs 4-6', 'Årskurs 7-9'];
    return fallback.map(name => ({ name, enabled: isGradeLevelEnabled(name) }))
      .sort((a, b) => {
        if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
        return a.name.localeCompare(b.name, 'sv');
      });
  }
}
