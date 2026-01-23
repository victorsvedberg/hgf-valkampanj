# Kuraterat innehåll från Friluftsfrämjandet

Denna mapp innehåller faktakontrollerat material från Friluftsfrämjandet som automatiskt kan infogas i AI-genererade lektionsplaner.

## 🎯 Syfte

När lärare genererar lektionsplaner kan systemet automatiskt föreslå relevanta resurser från Friluftsfrämjandet baserat på:
- Aktivitetstyp
- Årstid
- Ämnesområde
- Nyckelord i lektionen

Detta ger lärare både AI-genererad kreativ inspiration OCH pålitliga, faktakontrollerade resurser.

## 📝 Lägga till nytt innehåll

### Steg 1: Skapa en ny markdown-fil

Skapa en ny `.md`-fil i denna mapp med ett beskrivande filnamn (t.ex. `sakerhet-vid-vatten.md`)

### Steg 2: Lägg till frontmatter (metadata)

Överst i filen, lägg till metadata mellan `---`:

```markdown
---
title: "Säkerhet vid vatten"
summary: "Viktiga säkerhetsregler när ni är vid sjö eller hav med klassen."
url: "https://friluftsframjandet.se/sakerhet-vid-vatten"
icon: "🌊"
keywords: ["vatten", "sjö", "hav", "simning", "badning", "strand", "säkerhet"]
seasons: ["vår", "sommar", "höst"]
activities: ["vattenaktiviteter", "badning", "strand"]
insertAfter: "safety"
priority: 1
---

Innehållsbeskrivning här...
```

### Steg 3: Skriv innehållet

Under frontmatter, skriv en kort beskrivning (2-3 meningar) som förklarar vad resursen innehåller.

## 🏷️ Metadata-fält

| Fält | Beskrivning | Exempel |
|------|-------------|---------|
| `title` | Resursens titel | "Göra upp eld ute" |
| `summary` | Kort sammanfattning | "Praktiska tips om hur man gör upp eld säkert..." |
| `url` | Länk till fullständig resurs | "https://friluftsframjandet.se/..." |
| `icon` | Emoji-ikon | "🔥" |
| `keywords` | Nyckelord för matchning | ["eld", "grilla", "bål"] |
| `seasons` | Relevanta årstider | ["alla"] eller ["höst", "vinter"] |
| `activities` | Aktivitetstyper | ["matlagning", "överlevnad"] |
| `insertAfter` | Var resursen ska visas | "mainActivity", "safety", "materials", "curriculum" |
| `priority` | Prioritet 1-3 | 1 = viktigt, 2 = användbart, 3 = extra |

## 📍 Placering (insertAfter)

Bestäm var resursen ska dyka upp i lektionsplanen:

- `"mainActivity"` - Efter huvudaktiviteten (passar praktiska tips)
- `"safety"` - Efter säkerhetsdelen (passar säkerhetsrelaterade resurser)
- `"materials"` - Efter materiallistan (passar utrustningsguider)
- `"curriculum"` - Efter läroplansdelen (passar fördjupande material)
- `"end"` - Längst ner (passar allmän inspiration)

## 🎯 Prioritet

- **1** = Visa alltid om relevant (kritisk säkerhetsinformation)
- **2** = Visa om relevant (användbara tips)
- **3** = Visa om plats finns (extra inspiration)

## ✏️ Redigera innehåll

1. Öppna `.md`-filen
2. Ändra metadata eller innehåll
3. Spara
4. Systemet läser in ändringarna automatiskt vid nästa generering

## 🗑️ Ta bort innehåll

**Alternativ 1:** Radera filen helt
**Alternativ 2:** Sätt `priority: 0` för att inaktivera utan att radera

## 🔍 Hur matchning fungerar

Systemet letar efter matchningar baserat på:

1. **Nyckelord** - Finns keywords i lektionens aktivitetsbeskrivning?
2. **Årstid** - Matchar lektionens årstid?
3. **Aktivitetstyp** - Passar aktivitetstypen?
4. **Prioritet** - Högre prioritet visas först

Upp till 3 resurser kan visas per lektion.

## 🎨 Så här ser det ut

I den genererade lektionsplanen visas resursen så här:

```markdown
---

> ### 🔥 Resurs från Friluftsfrämjandet
>
> **Göra upp en bra eld ute**
>
> Ska ni göra upp eld? Här hittar du allt du behöver veta om att elda säkert med barn.
>
> [Läs hela guiden på Friluftsfrämjandet.se →](https://friluftsframjandet.se/...)
>
> *Kuraterat material – faktakontrollerat av Friluftsfrämjandet*

---
```

Detta renderas som en visuellt tydlig box som skiljer sig från AI-genererat innehåll.

## 💡 Tips

- Använd tydliga, beskrivande nyckelord
- Håll sammanfattningen kort och lockande
- Tänk på när resursen är mest användbar (årstid, aktivitet)
- Testa genom att generera en lektion och se om matchningen fungerar
- Uppdatera keywords om en resurs inte dyker upp när den borde

## 🚀 Kom igång

1. Kolla på exemplen: `gora-upp-eld.md`, `laga-mat-utomhus.md`
2. Kopiera en exempelfil
3. Ändra metadata och innehåll
4. Spara och testa!
