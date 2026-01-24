// Script för att konvertera postnummer-CSV till JSON
// Kör med: node scripts/process-postal-data.js

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../data/postnummer-raw.csv');
const outputFile = path.join(__dirname, '../data/postnummer.json');

// Läs CSV
const csv = fs.readFileSync(inputFile, 'utf-8');
const lines = csv.split('\n').filter(line => line.trim());

// Skippa header
const header = lines[0].split(',');
console.log('Header:', header);

const postalCodes = [];
const ortSet = new Set();
const kommunSet = new Set();

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length < 5) continue;

  const postnummer = parts[0].trim();
  const ort = parts[1].trim();
  const kommun = parts[2].trim();
  const kommunKod = parts[3].trim();
  const lan = parts[4].trim();

  // Normalisera kommun (UPPERCASE → Title Case)
  const kommunNormalized = kommun
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  postalCodes.push({
    postnummer,
    ort,
    kommun: kommunNormalized,
    kommunKod,
    lan
  });

  ortSet.add(ort);
  kommunSet.add(kommunNormalized);
}

// Skapa unika orter med deras kommun
const orterMap = new Map();
for (const pc of postalCodes) {
  const key = `${pc.ort}|${pc.kommun}`;
  if (!orterMap.has(key)) {
    orterMap.set(key, {
      ort: pc.ort,
      kommun: pc.kommun,
      kommunKod: pc.kommunKod,
      lan: pc.lan,
      examplePostnummer: pc.postnummer
    });
  }
}

const orter = Array.from(orterMap.values()).sort((a, b) =>
  a.ort.localeCompare(b.ort, 'sv')
);

// Skapa postnummer-lookup (postnummer → kommun)
const postnummerLookup = {};
for (const pc of postalCodes) {
  postnummerLookup[pc.postnummer] = {
    ort: pc.ort,
    kommun: pc.kommun,
    kommunKod: pc.kommunKod,
    lan: pc.lan
  };
}

// Skapa kommun-lista
const kommuner = Array.from(kommunSet).sort((a, b) =>
  a.localeCompare(b, 'sv')
);

const output = {
  // Lista med unika orter (för autocomplete)
  orter,
  // Postnummer → kommun lookup
  postnummerLookup,
  // Lista med alla kommuner
  kommuner,
  // Metadata
  meta: {
    totalPostnummer: postalCodes.length,
    totalOrter: orter.length,
    totalKommuner: kommuner.length,
    generatedAt: new Date().toISOString()
  }
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(`\nKlart!`);
console.log(`- ${postalCodes.length} postnummer`);
console.log(`- ${orter.length} unika orter`);
console.log(`- ${kommuner.length} kommuner`);
console.log(`\nSparad till: ${outputFile}`);
