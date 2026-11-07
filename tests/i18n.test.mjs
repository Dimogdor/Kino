// Toutes les langues doivent avoir exactement les mêmes textes que l'anglais (mêmes clés, mêmes {variables}).
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage ??= { getItem: () => null, setItem() {} };
const { dict, LANGS, t, setLang } = await import('../i18n.js');

const OPEN = new Set(['genres', 'countries', 'langs']); // tables de correspondance, comparées à part
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) =>
  v && typeof v === 'object' && !Array.isArray(v) && !OPEN.has(k) ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]);
const vars = v => (typeof v === 'string' ? (v.match(/\{\w+\}/g) || []).sort().join() : '');
const en = new Map(flat(dict.en));

for (const l of LANGS) {
  test(`langue ${l} complète`, () => {
    const mine = new Map(flat(dict[l]));
    assert.deepEqual([...mine.keys()].sort(), [...en.keys()].sort());
    for (const [k, v] of en) assert.equal(vars(mine.get(k)), vars(v), `${l} : ${k}`);
    assert.equal(dict[l].tuto.steps.length, dict.en.tuto.steps.length);
    assert.deepEqual(Object.keys(dict[l].genres).sort(), Object.keys(dict.en.genres).sort());
  });
}

test('une clé inconnue ne peut pas injecter de HTML', () => {
  setLang('fr');
  assert.equal(t('mode.<img src=x onerror=alert(1)>'), 'mode.imgsrcxonerroralert1');
});
