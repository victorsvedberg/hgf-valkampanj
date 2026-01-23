# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Utelektiongeneratorn** (Outdoor Lesson Generator) is a Next.js application that generates customized outdoor lesson plans for Swedish teachers. The app uses Anthropic's Claude Sonnet 4.5 model to create curriculum-aligned, safety-assessed lesson plans based on teacher input.

**Language**: Swedish (app content and prompts)
**Target Users**: Swedish teachers (förskola through högstadiet)

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
Copy `.env.local.example` to `.env.local` and add your Anthropic API key:
```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

## Architecture

### Application Flow

1. **Landing Page** (`app/page.tsx`) → User starts journey
2. **Survey** (`app/survey/page.tsx`) → 4-question survey collecting:
   - Season (Årstid)
   - Age group (Åldersgrupp)
   - Duration (Lektionstid)
   - Subject (Ämnesfokus)
3. **Results Generation** (`app/survey/results/page.tsx`) → Multi-step AI generation with live progress
4. **Final Document** → Markdown lesson plan with download capability

### Multi-Stage AI Generation

The lesson plan generation uses a **4-step pipeline** with Anthropic's Claude API (`app/api/generate/route.ts`):

1. **Creative Concept** (`getConceptPrompt`)
   - Generates creative lesson idea based on survey data
   - Uses few-shot examples from `lib/prompts.ts` (Naturparkour, Vandring, Naturbingo)
   - Returns: title, introduction, mainActivity, learningGoals, materials

2. **Curriculum Connection** (`getCurriculumPrompt`)
   - Maps lesson to Swedish curriculum (Lgr22)
   - Age-appropriate curriculum context from predefined contexts
   - Returns: refined activity, curriculum connections, pedagogical notes

3. **Safety Assessment** (`getSafetyPrompt`)
   - Risk analysis for outdoor activity
   - Season and age-specific safety considerations
   - Returns: risk summary, precautions, staffing/weather notes

4. **Document Compilation** (`compileFinalDocument`)
   - Combines all sections into formatted markdown
   - Client-side rendering with react-markdown + remark-gfm

### Retry Logic

The API implements **automatic retry with 20-second delay**:
- First attempt fails → waits 20 seconds
- Second attempt (final) → if fails, shows user-friendly error
- Progress updates streamed via Server-Sent Events (SSE)

### Data Flow

- **Client-side storage**: Survey data persists in `localStorage` (key: `surveyData`)
- **API communication**: POST to `/api/generate` → SSE stream → progress updates
- **State management**: React hooks (no external state library)

### Styling

- **Tailwind CSS 4** (PostCSS-based)
- **Design system**: Flat, nature-inspired with breathing animations
- **Fonts**: Souvenir (headings), Inter Variable (body)
- **Color scheme**: Blue (`#1e3a8a`), beige background (`#F5F1EB`)
- **ShadCN UI** configured (New York style) but minimal component usage

### Important Files

- **`config/curriculum-config.ts`** - Enable/disable subjects and grade levels for testing
- **`prompts/`** - Editable .md template files for all AI prompts (see Prompt Development below)
- `lib/prompts.ts` - Prompt loading and curriculum contexts
- `lib/curriculum-loader.ts` - Dynamic curriculum discovery from `/curriculum/` folder
- `lib/template-engine.ts` - Handlebars-style template variable substitution
- `lib/generation-logger.ts` - Comprehensive logging with timing and token tracking
- `app/api/generate/route.ts` - Main generation logic with streaming, retry, and logging
- `app/survey/results/page.tsx` - Complex UI with SSE consumption and animations
- `.env.local.example` - Required environment variables
- **`logs/`** - Generated JSON logs for each lesson plan generation (gitignored)

## Key Technical Considerations

### Claude API Integration

- Uses **Anthropic SDK**: `@anthropic-ai/sdk`
- API method: `anthropic.messages.create()`
- Model: `claude-sonnet-4-5-20250929` (configurable in route.ts)
- Alternative model: `claude-haiku-4-5-latest` (faster, cheaper)
- Response format: `response.content[0].text`
- System prompt passed as separate `system` parameter (not in messages array)

### Curriculum Data

Curriculum contexts are loaded dynamically from markdown files in `/curriculum/` directory:

```
curriculum/
├── arskurs-1-3/     # Årskurs 1-3
├── arskurs-4-6/     # Årskurs 4-6
└── arskurs-7-9/     # Årskurs 7-9
```

**Display names are read from each file's H1 heading:**
```markdown
# Idrott och hälsa - Årskurs 1-3
```
→ Shows "Idrott och hälsa" in the survey dropdown

**To add a new subject:** Create a `.md` file in each grade folder with the H1 format above.

See `/curriculum/README.md` for full documentation.

### Testing Mode: Enable/Disable Subjects & Grade Levels

Control which subjects and grade levels appear in the survey UI via `config/curriculum-config.ts`:

```typescript
export const curriculumConfig = {
  // Empty array [] = ALL enabled
  // Specific values = ONLY those shown in UI

  enabledGradeLevels: [],              // All grade levels
  // enabledGradeLevels: ['Årskurs 1-3'], // Only lågstadiet

  enabledSubjects: [],                 // All subjects
  // enabledSubjects: ['Matematik'],     // Only Matematik
};
```

**Use cases:**
- Testing a specific subject's lesson generation quality
- Limiting options during demos or user testing
- Focusing development on one grade level at a time

**Available values:**
- Grade levels: `'Årskurs 1-3'`, `'Årskurs 4-6'`, `'Årskurs 7-9'`
- Subjects: Exact display names from curriculum files (check `/curriculum/arskurs-1-3/`)

**Hot reload**: Changes apply immediately without server restart.

### Few-Shot Learning

The system uses **3 detailed examples** in `EXAMPLES_CONTEXT` to guide model output style:
1. Naturparkour på schemat (Friluftsfrämjandet)
2. Vandring på schemat (Friluftsfrämjandet)
3. Naturbingo i närområdet (custom example)

These examples establish tone, structure, safety thinking, and curriculum mapping patterns.

## Prompt Development & Debugging

### Editable Prompt Templates

All AI prompts are stored as **editable .md files** in `/prompts/`:

```
/prompts/
├── 01-concept-system.md      # Step 1: System instructions + examples
├── 01-concept-user.md         # Step 1: User request template
├── 02-curriculum-system.md    # Step 2: Curriculum expert instructions
├── 02-curriculum-user.md      # Step 2: Curriculum mapping request
├── 03-safety-system.md        # Step 3: Safety expert instructions
├── 03-safety-user.md          # Step 3: Safety assessment request
└── README.md                  # Full documentation
```

**Template Syntax**: Handlebars-style `{{variable}}` and `{{#if variable}}...{{/if}}`

**Hot Reload**: Changes load automatically on each API request (no server restart needed)

### Generation Logging

Every lesson generation creates a **detailed JSON log** in `/logs/`:

**Log Contents:**
- ✅ Full prompts with substituted variables
- ✅ Raw API responses (before parsing)
- ✅ Parsed JSON objects
- ✅ Token usage (input/output) per step
- ✅ Cost estimation in both **USD and SEK** (Claude Sonnet 4.5 pricing)
- ✅ Timing in **seconds** per step
- ✅ Error messages and retry attempts
- ✅ Summary section with formatted totals
- ✅ **Full markdown lesson plan** appended at end of log

**Console Output**: Each generation prints a detailed summary:
```
🚀 Starting generation session: abc123-def456...
📤 Sending Step 1 request to Claude...
✅ Step 1 complete

═══════════════════════════════════════
📊 GENERATION SUMMARY
Status: ✅ SUCCESS
Total Duration: 45s

📝 STEPS:
  1. Creative Concept Generation
     Duration: 15.20s
     Tokens: 2,085 in + 1,182 out = 3,267 total
     Cost: $0.0240 (0.25 kr)

💰 TOTALS:
  Total Tokens: 8,450
  Estimated Cost: $0.0567 (0.60 kr)
═══════════════════════════════════════
```

**Log Files**: `logs/generation-2025-01-15-14-23-45.json`
- JSON metadata at top
- Markdown lesson plan at bottom (in comment block)

### Iterating on Prompts

1. **Edit** a prompt template in `/prompts/`
2. **Test** by generating a new lesson
3. **Check logs** in `/logs/` to see:
   - Exact prompts sent to AI
   - Raw responses received
   - Token usage (with cached/reasoning breakdown)
   - Cost in USD and SEK
   - Timing per step
   - Full markdown output at end
4. **Refine** based on results
5. **Repeat**

No code changes or server restarts needed!

### Pricing Configuration

**USD to SEK Exchange Rate**: Update in `lib/generation-logger.ts`:
```typescript
const USD_TO_SEK = 10.50; // Adjust as needed
```

**Claude Sonnet 4.5 Pricing** (per 1K tokens):
- Input: $0.003
- Output: $0.015

**Claude Haiku 4.5 Pricing** (per 1K tokens):
- Input: $0.0008
- Output: $0.004

## Development Notes

- **StrictMode protection**: Results page has `hasRequestStarted` ref to prevent double API calls
- **Node.js runtime**: API route uses `export const runtime = 'nodejs'` for SSE support
- **Dynamic rendering**: `export const dynamic = 'force-dynamic'` to bypass static optimization
- **No API route caching**: Real-time generation required for each request
- **Mobile-first**: Responsive design with touch-friendly interactions
- **Swedish locale**: All dates formatted as `sv-SE`
- **Prompt templates hot-reload**: Edit `.md` files in `/prompts/` without restarting server
