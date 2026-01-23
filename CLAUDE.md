# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Stoppa Marknadshyror** - Hyresgästföreningens valkampanjsajt för val 2026. En "julgranssajt" med flera engagemangsspår för att mobilisera medlemmar och sympatisörer.

**Language**: Swedish (app content)
**Target Users**: Hyresgästföreningens medlemmar och allmänheten

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

### De fem spåren (Engagement Tracks)

| Spår | URL | Brevo-tagg | Beskrivning |
|------|-----|------------|-------------|
| 1. Skriv under | `/skriv-under` | `signatur` | Formulär → bekräftelsemejl → automation "ny aktivitet" |
| 2. Kontakta politiker | `/kontakta-politiker` | `har-kontaktat` | Postnummer → lookup → mailto-länk |
| 3. Beställ material | `/bestall-material` | `dörrhängare` | Formulär → notis för fysisk hantering |
| 4. Gå på aktivitet | `/aktiviteter` | `event-deltagare` | Eventlista → anmälan |
| 5. Bli aktiv medlem | `/bli-aktiv` | `volontär-ny` | Formulär → Notion → screening → lokal nivå |

### Prioritetsordning
1. Volontärskap (aktiv medlem)
2. Dörrhängare
3. Kontakta politiker
4. Skriv under

### Application Flow

1. **Landing Page** (`app/page.tsx`) → Hero + engagemangsalternativ
2. **Spårsidor** → Formulär för varje engagemangsnivå
3. **Bekräftelse** → Tack-meddelande + nästa steg

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (PostCSS-based)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **CRM**: Brevo (planerad integration)
- **AI**: Anthropic SDK (för framtida funktioner)

## File Structure

```
app/
├── page.tsx                 # Landing page
├── layout.tsx               # Root layout med metadata
├── globals.css              # Design system & variabler
├── skriv-under/page.tsx     # Spår 1: Skriv under upprop
├── kontakta-politiker/page.tsx # Spår 2: Kontakta politiker
├── bestall-material/page.tsx   # Spår 3: Beställ dörrhängare
├── aktiviteter/page.tsx     # Spår 4: Eventlista
├── bli-aktiv/page.tsx       # Spår 5: Bli aktiv medlem
└── styleguide/page.tsx      # Komponent-dokumentation

components/
├── layout/
│   ├── header.tsx           # Navigation
│   └── footer.tsx           # Footer
└── ui/
    ├── button.tsx           # Button med varianter
    ├── input.tsx            # Text input
    ├── textarea.tsx         # Textarea
    ├── select.tsx           # Select dropdown
    ├── checkbox.tsx         # Checkbox
    └── card.tsx             # Card med sub-komponenter

lib/
└── utils.ts                 # cn() utility för class merging
```

## Design System

Baserat på Hyresgästföreningens huvudsajt (hyresgastforeningen.se).

### Färger (HGF Brand)
```css
/* Varumärkesfärger */
--color-hgf-red: #FF0037         /* Huvudfärg (brand) */
--color-hgf-red-dark: #CC002C    /* Hover */
--color-hgf-black: #1A1A1A       /* Text & sekundär */
--color-hgf-white: #FFFFFF       /* Kontrast */

/* Funktionsfärger (knappar & länkar) */
--color-hgf-blue: #231FD8        /* Action (knappar, länkar) */
--color-hgf-blue-dark: #06007E   /* Hover */

/* Bakgrundsfärger */
--color-hgf-bg: #FFFFFF          /* Standard bakgrund */
--color-hgf-bg-light-blue: #EBF3FF  /* Block & faktarutor */
--color-hgf-bg-blue: #D8E8FF     /* Faktarutor */
--color-hgf-bg-pink: #FFF5FB     /* Länksektioner */
--color-hgf-neutral: #E5E5E5     /* Borders */

/* Övriga */
--color-hgf-warning: #FFE988     /* Viktig info */
--color-hgf-green: #71b942       /* Hem & Hyra specifik */
```

### Typografi
- **Brödtext**: HyraSans, 16px → 18px (fluid)
- **Rubriker**: HyraSansDisplay
  - H1: 27px → 60px (fluid)
  - H2: 23px → 48px (fluid)

### Komponenter

**Button** (`components/ui/button.tsx`)
- Varianter: `default` (blå), `red`, `outline`, `outline-white`, `white`, `ghost`, `link`
- Storlekar: `sm`, `default`, `lg`, `icon`
- Props: `loading`, `asChild`
- Form: Pillerform (border-radius: 2em), font-weight: bold
- OBS: Endast blå och röda knappar - använd `white`/`outline-white` på färgade bakgrunder

**Input** (`components/ui/input.tsx`)
- Props: `label`, `error`, `hint`
- Automatisk tillgänglighet med aria-attribut
- Fokus: blå ring (#231FD8)

**Card** (`components/ui/card.tsx`)
- Sub-komponenter: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### CSS Utility Classes
```css
.container-page   /* max-width: 1375px, padding: 1.5rem/3rem */
.container-narrow /* max-w-3xl, samma padding */
.section          /* py-16 md:py-24 */
.section-sm       /* py-8 md:py-12 */
.hero             /* Hero-sektion med röd bakgrund */
.badge            /* Badge-styling */
.badge-red        /* Röd badge */
.badge-blue       /* Blå badge */
.card-hover       /* Hover-effekt för kort */
```

## TODO: Brevo Integration

Alla formulär är förberedda för Brevo-integration. Implementera:

1. **API Route** (`app/api/brevo/route.ts`)
   - POST-endpoint för formulärdata
   - Skicka till Brevo Contacts API
   - Tagga kontakter enligt spår

2. **Bekräftelsemejl**
   - Konfigurera transactional emails i Brevo
   - Skicka bekräftelse vid varje anmälan

3. **Automation**
   - "Ny aktivitet"-mejl efter X dagar
   - Event-påminnelser

4. **Postnummer → Politiker lookup**
   - Skapa lookup-tabell (JSON eller databas)
   - Implementera i `/kontakta-politiker`

## Development Notes

- **Style Guide**: Besök `/styleguide` för att se alla komponenter
- **Responsiv design**: Mobile-first med Tailwind breakpoints
- **Tillgänglighet**: Alla formulärelement har aria-attribut
- **Font**: HyraSans / HyraSansDisplay (med systemfont som fallback)
