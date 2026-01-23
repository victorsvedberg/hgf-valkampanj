# Prompts - All AI-promptar samlade

Denna mapp innehåller allt som bygger prompten som skickas till Claude.

## Mappstruktur

```
prompts/
├── README.md                ← Du läser den nu
├── system.md                ← Huvudprompt (system message)
├── user.md                  ← Mall för user message (dokumentation)
└── curriculum/              ← Ämnesspecifikt innehåll
    ├── arskurs-1-3/
    │   └── matematik/
    │       ├── expert.md    ← Pedagogisk expertis + exempel
    │       └── lgr22.md     ← Läroplansinnehåll
    ├── arskurs-4-6/
    └── arskurs-7-9/
```

## Hur prompten byggs

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM MESSAGE                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  system.md (bas-template)                             │  │
│  │    ├── {{expertContext}} ← curriculum/.../expert.md   │  │
│  │    ├── {{lgr22Context}}  ← curriculum/.../lgr22.md    │  │
│  │    ├── {{subject}}       ← Formulärdata               │  │
│  │    ├── {{gradeLevel}}    ← Formulärdata               │  │
│  │    └── {{season}}        ← Formulärdata               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            +
┌─────────────────────────────────────────────────────────────┐
│                    USER MESSAGE                             │
│  Skapa en kreativ utelektion baserat på:                   │
│  - Årskurs: Årskurs 1-3                                    │
│  - Ämne: Matematik                                         │
│  - Årstid: Höst                                            │
│  - Plats: Skog                                             │
│  - ...                                                      │
└─────────────────────────────────────────────────────────────┘
```

## Filer

### `system.md`
Huvudmallen som bygger system-prompten. Innehåller:
- Expert-roll och uppgiftsbeskrivning
- Skrivstilsinstruktioner
- Output-format (JSON-schema)
- Placeholders för dynamiskt innehåll

### `user.md`
Dokumentation av user message-formatet. Mallen byggs i kod men denna fil visar strukturen.

### `curriculum/`
Ämnesspecifikt innehåll uppdelat per fil:

| Fil | Innehåll | Ansvarig |
|-----|----------|----------|
| `expert.md` | Specialist-roll, vad som fungerar utomhus, konkreta exempel | Pedagogisk expert |
| `lgr22.md` | Centralt innehåll, kunskapskrav från Lgr22 | Läroplansansvarig |

## Placeholders i system.md

| Placeholder | Källa | Beskrivning |
|-------------|-------|-------------|
| `{{expertContext}}` | `curriculum/[årskurs]/[ämne]/expert.md` | Specialist-roll och exempellektioner |
| `{{lgr22Context}}` | `curriculum/[årskurs]/[ämne]/lgr22.md` | Centralt innehåll från läroplanen |
| `{{subject}}` | Formulärdata | Valt ämne |
| `{{gradeLevel}}` | Formulärdata | Vald årskurs |
| `{{season}}` | Formulärdata | Vald årstid |

## Lägga till nytt ämne

1. Skapa mapp: `prompts/curriculum/arskurs-1-3/mitt-nya-amne/`
2. Skapa `expert.md` med pedagogisk expertis
3. Skapa `lgr22.md` med läroplansinnehåll
4. Aktivera i `config/curriculum-config.ts`

Se `curriculum/README.md` för detaljerade instruktioner.

## Redigera promptar

| Vill du ändra... | Redigera |
|------------------|----------|
| Generell stil och JSON-format | `system.md` |
| Ämnesspecifik expertis | `curriculum/[årskurs]/[ämne]/expert.md` |
| Läroplansinnehåll | `curriculum/[årskurs]/[ämne]/lgr22.md` |

**Hot reload**: Ändringar laddas automatiskt vid nästa generering.

## Logging

Varje generering skapar en loggfil i `/logs/` med:
- Fullständig prompt med alla variabler ersatta
- Rått API-svar
- Token-användning och kostnad
- Timing
- Eventuella fel

---

*Senast uppdaterad: 2025-12-04*
