// Intégrité des données : liste de la section 13 et catalogue généré.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { COLLECTIONS, REGIONS, MOODS } from '../modes.js';

const read = f => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const titles = read('data/titles.json');
const catalogue = read('data/catalogue.json');

test('section 13 : 740 titres, clés uniques', () => {
  assert.equal(titles.length, 740);
  assert.equal(new Set(titles.map(x => x.key)).size, 740);
});

test('catalogue : 740 titres complets et cohérents', () => {
  assert.equal(catalogue.length, 740);
  assert.equal(new Set(catalogue.map(x => x.id)).size, 740);
  for (const x of catalogue) {
    assert.match(x.id, /^(m\d+|t\d+|x-[a-z0-9-]+)$/, x.id);
    assert.ok(['film', 'serie'].includes(x.type), x.id);
    assert.ok(COLLECTIONS.includes(x.collection), x.id);
    assert.ok(REGIONS.includes(x.region), x.id);
    assert.ok(x.moods.every(m => MOODS.includes(m)), x.id);
    assert.ok(x.title.en || x.originalTitle, x.id);
    assert.ok(Number.isInteger(x.year), x.id);
    assert.ok(!x.poster || /^\/[\w.-]+$/.test(x.poster), x.id);
  }
});

test('résumés : un fichier par langue, seulement pour des titres du catalogue', () => {
  const ids = new Set(catalogue.map(x => x.id));
  const files = readdirSync(new URL('../data/resumes/', import.meta.url));
  assert.equal(files.length, 8);
  for (const f of files) {
    const texts = read(`data/resumes/${f}`);
    assert.ok(Object.keys(texts).every(id => ids.has(id)), f);
    assert.ok(Object.values(texts).every(v => typeof v === 'string' && v.length), f);
  }
});

// Garde-fou contre les mauvaises correspondances TMDB (ex. « Dogma » confondu avec « Festen ») :
// chaque ligne de la section 13 doit retrouver un titre au nom proche, sauf ces titres sortis sous un autre nom.
const RENAMED = new Set(['film|Heel|2025', 'film|Les 400 Coups|1959', 'film|Dimensions du dialogue|1982', 'serie|Apocalypse, la 2e Guerre mondiale|2009']);
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

test('chaque titre de la liste correspond au bon film', () => {
  const wrong = titles.filter(t => !RENAMED.has(t.key)).filter(t => {
    const names = [t.title, ...(t.vo ? t.vo.split(' / ') : [])].map(norm);
    return !catalogue.some(c => c.collection === t.collection && c.section === t.section && c.year === t.year &&
      [...Object.values(c.title), c.originalTitle].map(norm).some(x => x && names.some(y => x.includes(y) || y.includes(x))));
  });
  assert.deepEqual(wrong.map(t => t.key), []);
});
