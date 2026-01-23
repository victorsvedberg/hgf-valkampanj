import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  buildLessonPrompt,
  compileFinalDocument,
  getPromptVersion_v2,
  type SurveyData,
  type LessonData,
  type GenerationMetadata
} from '@/lib/prompts';
import { GenerationLogger } from '@/lib/generation-logger';
import { randomUUID } from 'crypto';

// Ensure Node.js runtime and disable static optimization for SSE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Increase timeout for Vercel (default is 10s on Hobby, need more for AI generation)
export const maxDuration = 300;

// Initialize Anthropic client lazily to avoid build-time errors
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set.');
    }
    anthropicClient = new Anthropic({
      apiKey,
      timeout: 300000 // 5 minutes timeout for large prompts
    });
  }
  return anthropicClient;
}

// Model configuration
const MODEL = 'claude-sonnet-4-5';

// Simple delay helper for retry wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to strip markdown code blocks from JSON responses
function stripMarkdownCodeBlocks(text: string): string {
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = text.trim().match(codeBlockRegex);
  return match ? match[1].trim() : text.trim();
}

// Custom error class to distinguish JSON parsing errors from API errors
class JSONParseError extends Error {
  constructor(message: string, public rawText: string) {
    super(message);
    this.name = 'JSONParseError';
  }
}

// Helper to parse JSON with common error fixes
function parseJSON<T>(text: string): T {
  const cleanText = stripMarkdownCodeBlocks(text);

  if (!cleanText || cleanText.trim() === '') {
    throw new JSONParseError('Tom respons från AI', text);
  }

  try {
    return JSON.parse(cleanText);
  } catch {
    console.warn('⚠️ JSON parse attempt 1 failed, trying fixes...');

    let fixedText = cleanText;

    // Fix 1: Remove trailing commas
    fixedText = fixedText.replace(/,(\s*[}\]])/g, '$1');

    // Fix 2: Extract JSON object
    const jsonMatch = fixedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      fixedText = jsonMatch[0];
    }

    try {
      return JSON.parse(fixedText);
    } catch {
      // Fix 3: Remove control characters
      fixedText = cleanText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      const jsonMatch2 = fixedText.match(/\{[\s\S]*\}/);
      if (jsonMatch2) {
        fixedText = jsonMatch2[0];
      }

      try {
        return JSON.parse(fixedText);
      } catch {
        // Fix 4: Aggressive whitespace cleanup
        fixedText = cleanText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
        const jsonMatch3 = fixedText.match(/\{[\s\S]*\}/);
        if (jsonMatch3) {
          fixedText = jsonMatch3[0];
        }

        try {
          return JSON.parse(fixedText);
        } catch {
          console.error('❌ JSON parse failed after all fix attempts');
          throw new JSONParseError('Kunde inte tolka svar från AI', cleanText);
        }
      }
    }
  }
}

// API call helper with streaming (required for Sonnet 4.5 to avoid timeout)
async function callClaude(systemPrompt: string, userPrompt: string): Promise<{
  text: string;
  usage?: { input_tokens: number; output_tokens: number }
}> {
  const client = getAnthropicClient();

  // Use streaming to avoid connection timeout with Sonnet 4.5
  let fullText = '';
  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullText += event.delta.text;
    }
  }

  const finalMessage = await stream.finalMessage();
  return { text: fullText, usage: finalMessage.usage };
}

// Helper function to generate lesson with progress updates
async function* generateWithProgress(surveyData: SurveyData) {
  const sessionId = randomUUID();
  const logger = new GenerationLogger(sessionId, surveyData);

  console.log(`\n🚀 Starting generation session: ${sessionId}`);

  // Simplified steps for UI
  const steps = [
    { name: 'Genererar lektionsplan', status: 'in_progress' },
    { name: 'Formaterar dokumentet', status: 'pending' }
  ];

  // Attempt 1
  try {
    yield { type: 'progress', step: 0, steps, message: 'Skapar din utelektion...' };

    logger.startStep(1, 'Lesson Generation', 'Generate complete lesson with single API call', MODEL);

    // Build prompts
    const { system, user } = await buildLessonPrompt(surveyData);
    logger.logPrompts(system, user);

    console.log('📤 Sending request to Claude...');
    const response = await callClaude(system, user);
    const lessonData = parseJSON<LessonData>(response.text);

    logger.logResponse(response.text, lessonData);
    if (response.usage) {
      logger.logTokenUsage(response.usage.input_tokens, response.usage.output_tokens, 0, 0);
    }
    logger.endStep();
    console.log('✅ Lesson generated');

    steps[0].status = 'complete';
    steps[1].status = 'in_progress';
    yield { type: 'progress', step: 1, steps, message: 'Formaterar dokumentet...' };

    // Compile final document
    logger.startStep(2, 'Document Compilation', 'Compile markdown document', 'local');

    const promptVersion = await getPromptVersion_v2();
    const metadata: GenerationMetadata = { model: MODEL, promptVersion };
    const finalDocument = await compileFinalDocument(lessonData, surveyData, metadata);

    logger.endStep();
    console.log('✅ Document compiled');

    steps[1].status = 'complete';

    // Save log and return
    logger.complete(finalDocument);
    await logger.saveToFile();
    console.log(logger.getSummary());

    yield {
      type: 'complete',
      document: finalDocument,
      metadata: { generatedAt: new Date().toISOString(), surveyData, steps }
    };
    return;

  } catch (firstError) {
    const errorMessage = firstError instanceof Error ? firstError.message : 'Unknown error';
    console.error('❌ First attempt failed:', errorMessage);
    logger.endStep(errorMessage);

    // Determine retry strategy
    let userMessage: string;
    let shouldRetry = true;
    let delayMs = 15000;

    if (firstError instanceof JSONParseError) {
      userMessage = 'AI-svaret kunde inte tolkas. Försöker igen om 10 sekunder...';
      delayMs = 10000;
    } else if (firstError instanceof Anthropic.APIError) {
      const status = firstError.status;
      if (status === 529) {
        userMessage = 'Claude är överbelastad. Försöker igen om 20 sekunder...';
        delayMs = 20000;
      } else if (status === 500 || status === 503) {
        userMessage = 'Claude har tillfälliga problem. Försöker igen om 20 sekunder...';
        delayMs = 20000;
      } else if (status === 429) {
        userMessage = 'För många förfrågningar. Försöker igen om 30 sekunder...';
        delayMs = 30000;
      } else if (status === 401) {
        userMessage = 'Autentiseringsfel. Kontakta support.';
        shouldRetry = false;
      } else {
        userMessage = 'Claude svarar inte. Försöker igen om 20 sekunder...';
        delayMs = 20000;
      }
    } else {
      userMessage = 'Ett oväntat fel uppstod. Försöker igen om 15 sekunder...';
    }

    if (!shouldRetry) {
      logger.fail(errorMessage);
      await logger.saveToFile();
      yield { type: 'error', error: userMessage };
      return;
    }

    yield { type: 'progress', step: 0, steps, message: userMessage };
    await delay(delayMs);
  }

  // Attempt 2 (retry)
  console.log('🔄 Retrying generation...');
  steps.forEach((s, i) => { s.status = i === 0 ? 'in_progress' : 'pending'; });

  try {
    yield { type: 'progress', step: 0, steps, message: 'Försök 2: Genererar lektionsplan...' };

    logger.startStep(1, 'Lesson Generation (Retry)', 'Retry lesson generation', MODEL);

    const { system, user } = await buildLessonPrompt(surveyData);
    logger.logPrompts(system, user);

    const response = await callClaude(system, user);
    const lessonData = parseJSON<LessonData>(response.text);

    logger.logResponse(response.text, lessonData);
    if (response.usage) {
      logger.logTokenUsage(response.usage.input_tokens, response.usage.output_tokens, 0, 0);
    }
    logger.endStep();

    steps[0].status = 'complete';
    steps[1].status = 'in_progress';
    yield { type: 'progress', step: 1, steps, message: 'Försök 2: Formaterar dokumentet...' };

    logger.startStep(2, 'Document Compilation (Retry)', 'Compile markdown document', 'local');

    const promptVersion = await getPromptVersion_v2();
    const metadata: GenerationMetadata = { model: MODEL, promptVersion };
    const finalDocument = await compileFinalDocument(lessonData, surveyData, metadata);

    logger.endStep();
    steps[1].status = 'complete';

    logger.complete(finalDocument);
    await logger.saveToFile();
    console.log(logger.getSummary());

    yield {
      type: 'complete',
      document: finalDocument,
      metadata: { generatedAt: new Date().toISOString(), surveyData, steps }
    };

  } catch (secondError) {
    const errorMessage = secondError instanceof Error ? secondError.message : 'Unknown error';
    console.error('❌ Second attempt failed:', errorMessage);

    logger.fail(errorMessage);
    await logger.saveToFile();
    console.log(logger.getSummary());

    let userError = 'Claude verkar inte gå att nå just nu. Försök igen senare.';
    if (secondError instanceof JSONParseError) {
      userError = 'AI-modellen returnerar oväntade svar. Försök igen om en stund.';
    } else if (secondError instanceof Anthropic.APIError && secondError.status === 529) {
      userError = 'Claude är överbelastad just nu. Försök igen om några minuter.';
    }

    yield { type: 'error', error: userError };
  }
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    const surveyData: SurveyData = await request.json();

    // Validate required fields
    if (!surveyData.gradeLevel || !surveyData.subject || !surveyData.season ||
        !surveyData.location || !surveyData.duration || !surveyData.studentCount) {
      return NextResponse.json({ error: 'Missing required survey data' }, { status: 400 });
    }

    if (surveyData.studentCount < 1 || surveyData.studentCount > 100) {
      return NextResponse.json({ error: 'Student count must be between 1 and 100' }, { status: 400 });
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const update of generateWithProgress(surveyData)) {
            const data = `data: ${JSON.stringify(update)}\n\n`;
            controller.enqueue(encoder.encode(data));

            if (update.type === 'complete' || update.type === 'error') {
              controller.close();
              break;
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Stream processing failed';
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: `Fel vid generering: ${errorMessage}`
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error generating lesson plan:', error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
      } else if (error.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
      }
    }

    return NextResponse.json({ error: 'Failed to generate lesson plan.' }, { status: 500 });
  }
}
