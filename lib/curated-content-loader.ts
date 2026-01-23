import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface CuratedContent {
  // Metadata
  title: string;
  summary: string;
  url: string;
  icon: string;
  keywords: string[];
  seasons: string[];
  activities: string[];
  insertAfter: 'mainActivity' | 'safety' | 'materials' | 'curriculum' | 'end';
  priority: number;

  // Image (optional)
  image?: string;
  imagePosition?: 'left' | 'right';

  // Content
  content: string;

  // Internal
  filename: string;
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { metadata: Record<string, unknown>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content };
  }

  const [, frontmatterText, mainContent] = match;
  const metadata: Record<string, unknown> = {};

  // Parse simple YAML-like frontmatter
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: string | string[] = line.substring(colonIndex + 1).trim();

    // Remove quotes
    value = value.replace(/^["']|["']$/g, '');

    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''));
    }

    metadata[key] = value;
  }

  return { metadata, content: mainContent.trim() };
}

/**
 * Load all curated content from /curated-content directory
 */
export async function loadAllCuratedContent(): Promise<CuratedContent[]> {
  try {
    const contentDir = join(process.cwd(), 'curated-content');
    const files = await readdir(contentDir);

    const markdownFiles = files.filter(file =>
      file.endsWith('.md') && file !== 'README.md'
    );

    const contents: CuratedContent[] = [];

    for (const filename of markdownFiles) {
      const filePath = join(contentDir, filename);
      const fileContent = await readFile(filePath, 'utf-8');
      const { metadata, content } = parseFrontmatter(fileContent);

      // Skip if priority is 0 (disabled)
      if (metadata.priority === 0 || metadata.priority === '0') {
        continue;
      }

      contents.push({
        title: metadata.title as string || 'Untitled',
        summary: metadata.summary as string || '',
        url: metadata.url as string || '',
        icon: metadata.icon as string || '📄',
        keywords: (metadata.keywords as string[]) || [],
        seasons: (metadata.seasons as string[]) || ['alla'],
        activities: (metadata.activities as string[]) || [],
        insertAfter: (metadata.insertAfter as CuratedContent['insertAfter']) || 'end',
        priority: Number(metadata.priority) || 3,
        image: metadata.image as string | undefined,
        imagePosition: (metadata.imagePosition as 'left' | 'right') || 'right',
        content,
        filename,
      });
    }

    return contents;
  } catch (error) {
    console.error('Failed to load curated content:', error);
    return [];
  }
}

/**
 * Get curated content for a specific lesson based on matching criteria
 */
export async function getCuratedContentForLesson(
  lessonData: {
    title: string;
    introduction: string;
    mainActivity: string;
    season: string;
    subject: string;
    materials?: string[];
  }
): Promise<Map<string, CuratedContent[]>> {
  const allContent = await loadAllCuratedContent();

  // Combine all lesson text for keyword matching
  const lessonText = [
    lessonData.title,
    lessonData.introduction,
    lessonData.mainActivity,
    lessonData.subject,
    ...(lessonData.materials || [])
  ].join(' ').toLowerCase();

  // Score each piece of content
  const scoredContent = allContent.map(content => {
    let score = 0;
    let hasKeywordMatch = false;

    // Keyword matching (REQUIRED - at least one must match)
    // Use word boundary matching to avoid partial matches like "äta" in "mäta"
    for (const keyword of content.keywords) {
      // Create regex with word boundaries (\\b doesn't work well with Swedish chars)
      // Use lookahead/lookbehind for word boundaries that work with unicode
      const keywordLower = keyword.toLowerCase();
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match if keyword is surrounded by non-letter characters or start/end of string
      const wordBoundaryRegex = new RegExp(
        `(?:^|[^a-zåäö])${escapedKeyword}(?:[^a-zåäö]|$)`,
        'i'
      );
      if (wordBoundaryRegex.test(lessonText)) {
        score += 10;
        hasKeywordMatch = true;
      }
    }

    // Only add bonus points if we have at least one keyword match
    if (hasKeywordMatch) {
      // Season matching bonus
      if (
        content.seasons.includes('alla') ||
        content.seasons.some(s =>
          lessonData.season.toLowerCase().includes(s.toLowerCase())
        )
      ) {
        score += 5;
      }

      // Priority boost
      score += (4 - content.priority) * 3; // priority 1 = +9, priority 2 = +6, priority 3 = +3
    }

    return { content, score, hasKeywordMatch };
  });

  // Filter: MUST have keyword match, then sort by score
  const relevantContent = scoredContent
    .filter(item => item.hasKeywordMatch)
    .sort((a, b) => b.score - a.score)
    .map(item => item.content);

  // Group by insertion point
  const groupedContent = new Map<string, CuratedContent[]>();

  for (const content of relevantContent) {
    const key = content.insertAfter;
    if (!groupedContent.has(key)) {
      groupedContent.set(key, []);
    }

    const group = groupedContent.get(key)!;
    // Limit to max 3 resources per insertion point
    if (group.length < 3) {
      group.push(content);
    }
  }

  return groupedContent;
}

/**
 * Format curated content as styled HTML card
 */
export function formatCuratedContent(content: CuratedContent): string {
  const hasImage = content.image && content.image.length > 0;
  const imageOnLeft = content.imagePosition === 'left';

  // Build the text content section
  const textContent = `
<div class="curated-text">
<span class="curated-badge">Tips från Friluftsfrämjandet</span>
<h4 class="curated-title">${content.title}</h4>
<p class="curated-body">${content.content}</p>
<a href="${content.url}" target="_blank" rel="noopener noreferrer" class="curated-button">Läs mer</a>
</div>`;

  // Build the image section if present
  const imageContent = hasImage ? `
<div class="curated-image">
<img src="${content.image}" alt="${content.title}" />
</div>` : '';

  // Combine based on image position
  const innerContent = hasImage
    ? (imageOnLeft ? imageContent + textContent : textContent + imageContent)
    : textContent;

  return `
<div class="curated-card${hasImage ? ' curated-with-image' : ''}${imageOnLeft ? ' curated-image-left' : ''}">
${innerContent}
</div>
`;
}
