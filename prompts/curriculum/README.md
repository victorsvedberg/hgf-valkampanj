# Curriculum - Ämnesinnehåll för Utelektiongeneratorn

Denna mapp innehåller ämnesspecifikt innehåll som injiceras i AI-prompten vid generering av lektioner.

## Mappstruktur

```
curriculum/
├── arskurs-1-3/
│   ├── matematik/
│   │   ├── expert.md    ← Pedagogisk expertis + exempel
│   │   └── lgr22.md     ← Läroplansinnehåll (Lgr22)
│   ├── naturvetenskap/
│   │   ├── expert.md
│   │   └── lgr22.md
│   └── ...
├── arskurs-4-6/
│   └── ...
└── arskurs-7-9/
    └── ...
```

## Lägga till ett nytt ämne

### 1. Skapa mappen

```bash
mkdir curriculum/arskurs-1-3/mitt-nya-amne
```

**Mappnamnsregler:**
- Små bokstäver
- Bindestreck istället för mellanslag
- å → a, ä → a, ö → o
- "och" → "-och-"

| Ämnesnamn | Mappnamn |
|-----------|----------|
| Matematik | `matematik` |
| Idrott och hälsa | `idrott-och-halsa` |
| Naturvetenskap | `naturvetenskap` |
| Bild och form | `bild-och-form` |

### 2. Skapa expert.md

Denna fil innehåller pedagogisk expertis och konkreta exempel.

```markdown
# Matematik - Årskurs 1-3 - Expert

Du är en specialist på att konstruera matematiklektioner för årskurs 1-3.

[Beskrivning av vad som fungerar bra utomhus för detta ämne...]

## Exempel på konkreta aktiviteter

### 1. Aktivitetsnamn
[Detaljerad beskrivning med material, genomförande, variationer...]

### 2. Nästa aktivitet
[...]
```

### 3. Skapa lgr22.md

Denna fil innehåller relevant utdrag ur Lgr22.

```markdown
# Matematik - Årskurs 1-3 - Lgr22

## Centralt innehåll

### Taluppfattning och tals användning
- Punkt 1
- Punkt 2

### Geometri
- Punkt 1
- Punkt 2

## Kunskapskrav / Bedömningskriterier

[Relevanta delar från Lgr22...]
```

### 4. Aktivera ämnet

Redigera `config/curriculum-config.ts`:

```typescript
export const curriculumConfig = {
  enabledGradeLevels: [],           // [] = alla årskurser
  enabledSubjects: ['Matematik'],   // Lägg till ditt nya ämne här
};
```

### 5. Klart!

Ämnet dyker nu automatiskt upp i enkäten och används vid generering.

## Ansvar för innehåll

| Fil | Ansvarig | Innehåll |
|-----|----------|----------|
| `expert.md` | Pedagogisk expert | Roll, metodik, konkreta exempel |
| `lgr22.md` | Läroplansansvarig | Centralt innehåll, kunskapskrav |

## Tips

- **expert.md**: Fokusera på VAD som fungerar bra utomhus och VARFÖR
- **lgr22.md**: Kopiera relevanta delar direkt från Skolverket
- Håll filerna fokuserade - inte för långa
- Uppdatera en fil i taget vid ändringar

---

*Senast uppdaterad: 2025-12-04*
