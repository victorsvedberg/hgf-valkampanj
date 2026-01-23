/**
 * Curriculum Configuration
 *
 * Use this file to control which grade levels and subjects are available
 * in the survey UI. This is useful for testing specific subjects or
 * limiting options during development.
 *
 * HOW TO USE:
 * - Set enabledGradeLevels to an empty array [] to enable ALL grade levels
 * - Set enabledSubjects to an empty array [] to enable ALL subjects
 * - Add specific items to the arrays to limit to only those options
 *
 * Changes take effect immediately (no server restart needed).
 */

export const curriculumConfig = {
  /**
   * Enabled grade levels
   *
   * Options: 'Årskurs 1-3', 'Årskurs 4-6', 'Årskurs 7-9'
   *
   * Examples:
   * - [] = All grade levels enabled
   * - ['Årskurs 1-3'] = Only Årskurs 1-3 enabled
   * - ['Årskurs 4-6', 'Årskurs 7-9'] = Only those two enabled
   */
  enabledGradeLevels: [] as string[],

  /**
   * Enabled subjects
   *
   * Use the exact display names as they appear in the curriculum files.
   * Check /curriculum/arskurs-1-3/ for available subjects.
   *
   * Examples:
   * - [] = All subjects enabled
   * - ['Matematik'] = Only Matematik enabled for testing
   * - ['Matematik', 'Idrott och hälsa'] = Only those two enabled
   */
  enabledSubjects: ['Matematik'] as string[],
};

/**
 * Helper to check if a grade level is enabled
 */
export function isGradeLevelEnabled(gradeLevel: string): boolean {
  if (curriculumConfig.enabledGradeLevels.length === 0) {
    return true; // Empty array means all enabled
  }
  return curriculumConfig.enabledGradeLevels.includes(gradeLevel);
}

/**
 * Helper to check if a subject is enabled
 */
export function isSubjectEnabled(subject: string): boolean {
  if (curriculumConfig.enabledSubjects.length === 0) {
    return true; // Empty array means all enabled
  }
  return curriculumConfig.enabledSubjects.includes(subject);
}
