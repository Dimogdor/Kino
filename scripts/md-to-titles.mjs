// Convertit la section 13 de kino-contexte.md en data/titles.json et vérifie les totaux de 13.2.
// Lancement : node scripts/md-to-titles.mjs [chemin/vers/kino-contexte.md]
import { readFileSync, writeFileSync } from 'node:fs';

const source = process.argv[2] || 'kino-contexte.md';
const lines = readFileSync(source, 'utf8').split('\n').map(l => l.trim());

// Expression régulière de la section 13.1 : titre, année de début, année de fin, notes
const LINE = /^- (.+) \((\d{4})(?:–(\d{4})?)?\)(?: — (.*))?$/;
// Titre de sous-section : « #### Nom · `collection` · `type` — nombre »
const HEADING = /^#### (.+?) · `(\w+)` · `(film|série)` — (\d+)$/;
// Ligne du récapitulatif 13.2 : | Nom | `clé` | films | dont courts | séries | total |
const RECAP = /^\| .+ \| `(\w+)` \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|$/;

const titles = [];
const headings = [];
const recap = {};
let current = null;
let inCatalogue = false;

for (const line of lines) {
  if (line.startsWith('## ')) inCatalogue = line.startsWith('## 13.');
  if (!inCatalogue) continue;
  const r = line.match(RECAP);
  if (r) recap[r[1]] = { films: +r[2], courts: +r[3], series: +r[4], total: +r[5] };
  const h = line.match(HEADING);
  if (h) {
    current = { section: h[1], collection: h[2], type: h[3] === 'série' ? 'serie' : 'film', expected: +h[4], found: 0 };
    headings.push(current);
    continue;
  }
  if (!current || !line.startsWith('- ')) continue;
  const m = line.match(LINE);
  if (!m) throw new Error(`Ligne illisible : ${line}`);
  current.found++;
  titles.push(parseTitle(line, m, current));
}

function parseTitle(line, [, title, start, , notes = ''], { type, collection, section }) {
  const parts = notes.split(' · ').map(p => p.trim());
  const after = prefix => parts.find(p => p.startsWith(prefix))?.slice(prefix.length).trim() || null;
  const tags = [...notes.matchAll(/`([^`]+)`/g)].map(x => x[1]);
  return {
    key: `${type}|${title}|${start}`,
    title,
    year: +start,
    yearText: line.slice(`- ${title} (`.length).split(')')[0],
    type,
    short: tags.includes('court'),
    collection,
    section,
    director: after('réal. '),
    vo: after('VO fr : ') || after('VO : '),
    tags: tags.filter(t => t !== 'court'),
    moodsPlus: [...notes.matchAll(/(?:^|\s)\+([a-z]+)/g)].map(x => x[1]),
    note: notes || null,
  };
}

// Vérifications : chaque sous-section, chaque collection et le total doivent correspondre à 13.2
const errors = headings.filter(h => h.found !== h.expected).map(h => `${h.section} : ${h.found} lus, ${h.expected} annoncés`);
const count = list => ({
  films: list.filter(t => t.type === 'film').length,
  courts: list.filter(t => t.type === 'film' && t.short).length,
  series: list.filter(t => t.type === 'serie').length,
  total: list.length,
});
for (const [key, expected] of Object.entries(recap)) {
  const got = count(titles.filter(t => t.collection === key));
  if (JSON.stringify(got) !== JSON.stringify(expected)) errors.push(`${key} : ${JSON.stringify(got)} au lieu de ${JSON.stringify(expected)}`);
}
const keys = new Set(titles.map(t => t.key));
if (keys.size !== titles.length) errors.push('clés en double');
const total = count(titles);
console.log(`${total.total} titres : ${total.films} films dont ${total.courts} courts, ${total.series} séries (${headings.length} sous-sections)`);
if (errors.length) {
  console.error('Écarts avec la section 13.2 :\n- ' + errors.join('\n- '));
  process.exit(1);
}
if (total.total !== 740) throw new Error(`Total attendu 740, obtenu ${total.total}`);

writeFileSync('data/titles.json', JSON.stringify(titles, null, 2) + '\n');
console.log('data/titles.json écrit, conforme au récapitulatif 13.2.');
