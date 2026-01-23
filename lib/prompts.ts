/**
 * Prompt generation for lesson plan creation
 * Simplified: Single API call with dynamically built system prompt
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { loadExpertContext, loadLgr22Context } from './curriculum-loader';
import { getCuratedContentForLesson, formatCuratedContent } from './curated-content-loader';
import { renderTemplate } from './template-engine';

// Extract version from prompt file (reads <!-- version: X.X --> comment)
async function getPromptVersion(filename: string): Promise<string> {
  try {
    const promptsDir = join(process.cwd(), 'prompts');
    const content = await readFile(join(promptsDir, filename), 'utf-8');
    const match = content.match(/<!--\s*version:\s*([\d.]+)\s*-->/);
    return match ? match[1] : '?';
  } catch {
    return '?';
  }
}

// Get prompt version for metadata
export async function getPromptVersion_v2(): Promise<string> {
  return await getPromptVersion('system.md');
}

// Generation metadata for technical summary
export interface GenerationMetadata {
  model: string;
  promptVersion: string;
}

export interface SurveyData {
  // Required fields
  gradeLevel: string;        // "Årskurs 1-3" | "Årskurs 4-6" | "Årskurs 7-9"
  subject: string;           // "Naturvetenskap" | "Matematik" | "Idrott och hälsa" | "Språk och kommunikation"
  season: string;            // "Vår" | "Sommar" | "Höst" | "Vinter"
  location: string;          // e.g., "Skolgård", "Skog", "Park", etc.
  duration: string;          // e.g., "45 minuter", "60 minuter", "90 minuter"
  studentCount: number;      // Default: 18

  // Optional fields
  workArea?: string;         // e.g., "Mäta utomhus", "Taluppfattning"
  travelTime?: number;       // 0-20 minutes (conditional on location)
  currentTheme?: string;     // "Vad jobbar ni med just nu?"
  classConditions?: string;  // e.g., "Koncentrationssvårigheter"
  pedagogicalApproach?: string; // "Utforskande" | "Strukturerat" | "Blandat"
}

export interface ConceptItem {
  term: string;
  explanation: string;
}

export interface CurriculumConnection {
  centralContent: string[];
}

export interface SafetyData {
  riskSummary: string;
  keyPrecautions: string[];
  staffingNote: string;
  weatherNote: string;
}

export interface PreparationData {
  steps: string[];
  materials: string[];
}

// Combined lesson data from single API call
export interface LessonData {
  title: string;
  aboutActivity: string;
  preparation: PreparationData;
  execution: string;
  safety: SafetyData;
  variations: string[];
  curriculum: CurriculumConnection;
  conceptList?: ConceptItem[];
}

/**
 * Build the complete prompt for lesson generation
 * Returns system and user prompts ready for API call
 */
export async function buildLessonPrompt(data: SurveyData): Promise<{
  system: string;
  user: string;
}> {
  // Load the base system template
  const promptsDir = join(process.cwd(), 'prompts');
  let systemTemplate = await readFile(join(promptsDir, 'system.md'), 'utf-8');

  // Remove version comment
  systemTemplate = systemTemplate.replace(/<!--\s*version:\s*[\d.]+\s*-->\s*/, '');

  // Load dynamic content
  const expertContext = await loadExpertContext(data.gradeLevel, data.subject);
  const lgr22Context = await loadLgr22Context(data.gradeLevel, data.subject);

  // Replace template variables in system prompt
  const system = systemTemplate
    .replace('{{expertContext}}', expertContext)
    .replace('{{lgr22Context}}', lgr22Context)
    .replace(/\{\{subject\}\}/g, data.subject)
    .replace(/\{\{gradeLevel\}\}/g, data.gradeLevel)
    .replace(/\{\{season\}\}/g, data.season);

  // Load and render user prompt template
  let userTemplate = await readFile(join(promptsDir, 'user.md'), 'utf-8');
  userTemplate = userTemplate.replace(/<!--\s*version:\s*[\d.]+\s*-->\s*/, '');

  const user = renderTemplate(userTemplate, {
    gradeLevel: data.gradeLevel,
    subject: data.subject,
    workArea: data.workArea,
    season: data.season,
    location: data.location,
    travelTime: data.travelTime,
    duration: data.duration,
    studentCount: data.studentCount,
    currentTheme: data.currentTheme,
    classConditions: data.classConditions,
    pedagogicalApproach: data.pedagogicalApproach,
  }).trim();

  return { system, user };
}

/**
 * Compile final markdown document from lesson data
 */
export async function compileFinalDocument(
  lesson: LessonData,
  surveyData: SurveyData,
  metadata?: GenerationMetadata
): Promise<string> {
  // Get curated content for this lesson (tips från Friluftsfrämjandet etc.)
  const curatedContentMap = await getCuratedContentForLesson({
    title: lesson.title,
    introduction: lesson.aboutActivity,
    mainActivity: lesson.execution,
    season: surveyData.season,
    subject: surveyData.subject,
    materials: lesson.preparation.materials,
  });

  // Helper to insert curated content at a specific point
  const insertCuratedContent = (insertPoint: string): string => {
    const content = curatedContentMap.get(insertPoint);
    if (!content || content.length === 0) return '';
    return '\n' + content.map(c => formatCuratedContent(c)).join('\n');
  };

  // Build overview items (no icons, compact, no redundant labels)
  const overviewItems = [
    surveyData.gradeLevel,
    surveyData.subject + (surveyData.workArea ? ` (${surveyData.workArea})` : ''),
    surveyData.location + (surveyData.travelTime ? ` (${surveyData.travelTime} min restid)` : ''),
    surveyData.season,
    surveyData.duration,
    `${surveyData.studentCount} elever`,
    surveyData.pedagogicalApproach,
  ].filter(Boolean);

  const overviewHTML = `
<div class="overview-grid">${overviewItems.map(item => `<span class="overview-item">${item}</span>`).join('')}</div>
${surveyData.currentTheme ? `<div class="overview-context"><strong>Tema:</strong> ${surveyData.currentTheme}</div>` : ''}
${surveyData.classConditions ? `<div class="overview-context"><strong>Förutsättningar:</strong> ${surveyData.classConditions}</div>` : ''}
`;

  return `# ${lesson.title}

## Översikt
${overviewHTML}

## Om aktiviteten
${lesson.aboutActivity}

## Förberedelser
${lesson.preparation.steps.map(step => `- ${step}`).join('\n')}

### Material som behövs
${lesson.preparation.materials.map(material => `- ${material}`).join('\n')}
${insertCuratedContent('materials')}
## Genomförande
${lesson.execution}
${insertCuratedContent('mainActivity')}
## Säkerhet

${lesson.safety.riskSummary}

### Viktiga säkerhetsåtgärder
${lesson.safety.keyPrecautions.map((precaution: string) => `- ${precaution}`).join('\n')}

**Bemanning:** ${lesson.safety.staffingNote}

**Väder:** ${lesson.safety.weatherNote}
${insertCuratedContent('safety')}
## Variation och fördjupning
${lesson.variations.map(variation => `- ${variation}`).join('\n')}

## Koppling till centralt innehåll (Lgr22)
${lesson.curriculum.centralContent.map((content: string) => `- ${content}`).join('\n')}
${insertCuratedContent('curriculum')}${lesson.conceptList && lesson.conceptList.length > 0 ? `

## Begrepp att förklara
${lesson.conceptList.map(item => `**${item.term}:** ${item.explanation}`).join('\n\n')}` : ''}
${insertCuratedContent('end')}
---

<div class="tech-summary">
<strong>Teknisk information</strong><br/>
Genererad: ${new Date().toLocaleDateString('sv-SE')}${metadata ? `<br/>
Modell: ${metadata.model}<br/>
Promptversion: ${metadata.promptVersion}` : ''}
</div>
`;
}
