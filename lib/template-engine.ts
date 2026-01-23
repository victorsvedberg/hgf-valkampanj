/**
 * Simple Handlebars-like template engine for prompt templates
 * Supports: {{variable}} and {{#if variable}}...{{/if}}
 */

export function renderTemplate(template: string, data: Record<string, unknown> | { [key: string]: unknown }): string {
  let result = template;

  // Handle {{#if variable}}...{{/if}} conditionals
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (match, variable, content) => {
    const value = data[variable];
    // Show content if variable exists and is truthy
    return value ? content : '';
  });

  // Handle simple {{variable}} replacements
  const varRegex = /\{\{(\w+)\}\}/g;
  result = result.replace(varRegex, (match, variable) => {
    const value = data[variable];
    return value !== undefined && value !== null ? String(value) : '';
  });

  return result;
}

/**
 * Load a prompt template from the prompts directory
 */
export async function loadPromptTemplate(filename: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const promptsDir = path.join(process.cwd(), 'prompts');
  const filePath = path.join(promptsDir, filename);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to load prompt template: ${filename}`, error);
    throw new Error(`Prompt template not found: ${filename}`);
  }
}

/**
 * Load and render a prompt template with data
 */
export async function renderPromptTemplate(
  filename: string,
  data: Record<string, unknown> | { [key: string]: unknown }
): Promise<string> {
  const template = await loadPromptTemplate(filename);
  return renderTemplate(template, data);
}
