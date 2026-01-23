/**
 * Logging utility for tracking lesson plan generation
 * Logs each step with prompts, responses, timing, and token usage
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { SurveyData } from './prompts';

export interface StepLog {
  stepNumber: number;
  stepName: string;
  description: string;
  startTime: number;
  endTime?: number;
  durationSeconds?: number;
  model: string;
  reasoningEffort?: string;
  textVerbosity?: string;
  systemPrompt: string;
  userPrompt: string;
  rawResponse?: string;
  parsedResponse?: unknown;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedTokens?: number;
    reasoningTokens?: number;
    estimatedCostUSD: number;
    estimatedCostSEK: number;
    costBreakdown?: {
      inputCost: number;
      cachedInputCost: number;
      outputCost: number;
      reasoningCost: number;
    };
  };
  error?: string;
}

export interface GenerationLog {
  sessionId: string;
  timestamp: string;
  surveyData: SurveyData;
  steps: StepLog[];
  summary?: {
    totalDurationSeconds: number;
    totalDurationFormatted: string; // "2m 34s"
    totalTokens: {
      input: number;
      output: number;
      total: number;
    };
    totalEstimatedCostUSD: number;
    totalEstimatedCostSEK: number;
    costFormattedUSD: string; // "$0.0234"
    costFormattedSEK: string; // "0.25 kr"
  };
  success: boolean;
  finalDocument?: string;
  error?: string;
}

// Claude pricing (as of 2025) - adjust these if pricing changes
// Prices are per 1K tokens
const PRICING = {
  'claude-sonnet-4-5-20250929': {
    input: 0.003,           // Input tokens per 1K
    cachedInput: 0.00375,   // Cached input tokens per 1K (prompt caching)
    output: 0.015,          // Output tokens per 1K
    reasoning: 0,           // No separate reasoning tokens in Claude
  },
  'claude-haiku-4-5-20251001': {
    input: 0.001,           // Input tokens per 1K ($1/MTok)
    cachedInput: 0.0001,    // Cached input tokens per 1K
    output: 0.005,          // Output tokens per 1K ($5/MTok)
    reasoning: 0,
  },
  'local': {
    input: 0,
    cachedInput: 0,
    output: 0,
    reasoning: 0,
  },
};

// USD to SEK exchange rate (update as needed)
const USD_TO_SEK = 10.50;

export class GenerationLogger {
  private log: GenerationLog;
  private currentStep: StepLog | null = null;

  constructor(sessionId: string, surveyData: SurveyData) {
    // Use Swedish timezone for timestamp
    const swedishTimestamp = new Date().toLocaleString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    this.log = {
      sessionId,
      timestamp: swedishTimestamp,
      surveyData,
      steps: [],
      success: false,
    };
  }

  /**
   * Start logging a new step
   */
  startStep(
    stepNumber: number,
    stepName: string,
    description: string,
    model: string,
    reasoningEffort?: string,
    textVerbosity?: string
  ): void {
    this.currentStep = {
      stepNumber,
      stepName,
      description,
      startTime: Date.now(),
      model,
      reasoningEffort,
      textVerbosity,
      systemPrompt: '',
      userPrompt: '',
    };
  }

  /**
   * Log the prompts for the current step
   */
  logPrompts(systemPrompt: string, userPrompt: string): void {
    if (this.currentStep) {
      this.currentStep.systemPrompt = systemPrompt;
      this.currentStep.userPrompt = userPrompt;
    }
  }

  /**
   * Log the response for the current step
   */
  logResponse(rawResponse: string, parsedResponse?: unknown): void {
    if (this.currentStep) {
      this.currentStep.rawResponse = rawResponse;
      this.currentStep.parsedResponse = parsedResponse;
    }
  }

  /**
   * Log token usage and calculate cost with detailed breakdown
   */
  logTokenUsage(
    inputTokens: number,
    outputTokens: number,
    cachedTokens: number = 0,
    reasoningTokens: number = 0
  ): void {
    if (this.currentStep) {
      const totalTokens = inputTokens + outputTokens;
      const model = this.currentStep.model as keyof typeof PRICING;
      const pricing = PRICING[model] || PRICING['claude-sonnet-4-5-20250929'];

      // Calculate non-cached input tokens
      const nonCachedInputTokens = inputTokens - cachedTokens;
      const nonReasoningOutputTokens = outputTokens - reasoningTokens;

      // Calculate costs for each token type
      const inputCost = (nonCachedInputTokens / 1000) * pricing.input;
      const cachedInputCost = (cachedTokens / 1000) * pricing.cachedInput;
      const outputCost = (nonReasoningOutputTokens / 1000) * pricing.output;
      const reasoningCost = (reasoningTokens / 1000) * pricing.reasoning;

      const estimatedCostUSD = inputCost + cachedInputCost + outputCost + reasoningCost;
      const estimatedCostSEK = estimatedCostUSD * USD_TO_SEK;

      this.currentStep.tokenUsage = {
        inputTokens,
        outputTokens,
        totalTokens,
        cachedTokens: cachedTokens > 0 ? cachedTokens : undefined,
        reasoningTokens: reasoningTokens > 0 ? reasoningTokens : undefined,
        estimatedCostUSD,
        estimatedCostSEK,
        costBreakdown: {
          inputCost,
          cachedInputCost,
          outputCost,
          reasoningCost,
        },
      };
    }
  }

  /**
   * End the current step
   */
  endStep(error?: string): void {
    if (this.currentStep) {
      this.currentStep.endTime = Date.now();
      const durationMs = this.currentStep.endTime - this.currentStep.startTime;
      this.currentStep.durationSeconds = Math.round((durationMs / 1000) * 100) / 100; // Round to 2 decimals
      if (error) {
        this.currentStep.error = error;
      }
      this.log.steps.push(this.currentStep);
      this.currentStep = null;
    }
  }

  /**
   * Mark generation as complete
   */
  complete(finalDocument: string): void {
    this.log.success = true;
    this.log.finalDocument = finalDocument;
    this.calculateTotals();
  }

  /**
   * Mark generation as failed
   */
  fail(error: string): void {
    this.log.success = false;
    this.log.error = error;
    this.calculateTotals();
  }

  /**
   * Calculate total statistics
   */
  private calculateTotals(): void {
    if (this.log.steps.length > 0) {
      const firstStep = this.log.steps[0];
      const lastStep = this.log.steps[this.log.steps.length - 1];
      const totalDurationMs = (lastStep.endTime || Date.now()) - firstStep.startTime;
      const totalDurationSeconds = Math.round((totalDurationMs / 1000) * 100) / 100;

      const totals = this.log.steps.reduce(
        (acc, step) => {
          if (step.tokenUsage) {
            acc.input += step.tokenUsage.inputTokens;
            acc.output += step.tokenUsage.outputTokens;
            acc.total += step.tokenUsage.totalTokens;
            acc.costUSD += step.tokenUsage.estimatedCostUSD;
            acc.costSEK += step.tokenUsage.estimatedCostSEK;
          }
          return acc;
        },
        { input: 0, output: 0, total: 0, costUSD: 0, costSEK: 0 }
      );

      // Format duration as "Xm Ys" or "Xs"
      const minutes = Math.floor(totalDurationSeconds / 60);
      const seconds = Math.round(totalDurationSeconds % 60);
      const totalDurationFormatted = minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${totalDurationSeconds.toFixed(2)}s`;

      this.log.summary = {
        totalDurationSeconds,
        totalDurationFormatted,
        totalTokens: {
          input: totals.input,
          output: totals.output,
          total: totals.total,
        },
        totalEstimatedCostUSD: totals.costUSD,
        totalEstimatedCostSEK: totals.costSEK,
        costFormattedUSD: `$${totals.costUSD.toFixed(4)}`,
        costFormattedSEK: `${totals.costSEK.toFixed(2)} kr`,
      };
    }
  }

  /**
   * Save log to file with markdown output appended
   */
  async saveToFile(): Promise<string> {
    const logsDir = join(process.cwd(), 'logs');

    // Create logs directory if it doesn't exist
    try {
      await mkdir(logsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }

    // Generate filename with Swedish timezone timestamp
    const now = new Date();
    const swedishTime = now.toLocaleString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/[:\s]/g, '-').replace(',', '');
    const filename = `generation-${swedishTime}.json`;
    const filepath = join(logsDir, filename);

    // Prepare log content with markdown output appended
    // Create a copy without finalDocument for the JSON part
    const { finalDocument, ...logWithoutDoc } = this.log;

    let fileContent = JSON.stringify(logWithoutDoc, null, 2);

    // Append markdown output as a comment at the end
    if (finalDocument) {
      fileContent += '\n\n' +
        '// ═══════════════════════════════════════════════════════════════════════════════\n' +
        '// GENERATED LESSON PLAN (Markdown)\n' +
        '// ═══════════════════════════════════════════════════════════════════════════════\n' +
        '/*\n' +
        finalDocument + '\n' +
        '*/\n';
    }

    // Write log file (skip on serverless/Vercel where filesystem is read-only)
    try {
      await writeFile(filepath, fileContent, 'utf-8');
      console.log(`✅ Generation log saved: ${filename}`);
      return filepath;
    } catch (error) {
      // On Vercel/serverless, filesystem is read-only - this is expected
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' ||
          (error as NodeJS.ErrnoException).code === 'EROFS') {
        console.log('📝 Log file skipped (serverless environment)');
        return '';
      }
      console.error('Failed to save log file:', error);
      // Don't throw - logging should not break generation
      return '';
    }
  }

  /**
   * Get formatted summary for console
   */
  getSummary(): string {
    const lines = [
      '═══════════════════════════════════════════════════════',
      `📊 GENERATION SUMMARY - ${this.log.sessionId}`,
      '═══════════════════════════════════════════════════════',
      `Status: ${this.log.success ? '✅ SUCCESS' : '❌ FAILED'}`,
      `Total Duration: ${this.log.summary?.totalDurationFormatted || 'N/A'}`,
      '',
      '📝 STEPS:',
    ];

    this.log.steps.forEach((step) => {
      lines.push(`  ${step.stepNumber}. ${step.stepName}`);
      lines.push(`     Duration: ${step.durationSeconds ? `${step.durationSeconds.toFixed(2)}s` : 'N/A'}`);
      if (step.tokenUsage) {
        lines.push(`     Tokens: ${step.tokenUsage.inputTokens.toLocaleString()} in + ${step.tokenUsage.outputTokens.toLocaleString()} out = ${step.tokenUsage.totalTokens.toLocaleString()} total`);
        if (step.tokenUsage.cachedTokens) {
          lines.push(`     ├─ Cached: ${step.tokenUsage.cachedTokens.toLocaleString()} tokens (50% discount)`);
        }
        if (step.tokenUsage.reasoningTokens) {
          lines.push(`     ├─ Reasoning: ${step.tokenUsage.reasoningTokens.toLocaleString()} tokens (4x cost)`);
        }
        lines.push(`     Cost: $${step.tokenUsage.estimatedCostUSD.toFixed(4)} (${step.tokenUsage.estimatedCostSEK.toFixed(2)} kr)`);
      }
      if (step.error) {
        lines.push(`     ❌ Error: ${step.error}`);
      }
      lines.push('');
    });

    if (this.log.summary) {
      lines.push('💰 TOTALS:');
      lines.push(`  Total Tokens: ${this.log.summary.totalTokens.total.toLocaleString()}`);
      lines.push(`  Input: ${this.log.summary.totalTokens.input.toLocaleString()}`);
      lines.push(`  Output: ${this.log.summary.totalTokens.output.toLocaleString()}`);
      lines.push(`  Estimated Cost: ${this.log.summary.costFormattedUSD} (${this.log.summary.costFormattedSEK})`);
    }

    lines.push('═══════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Get the log object
   */
  getLog(): GenerationLog {
    return this.log;
  }
}
