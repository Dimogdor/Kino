// Tests de la logique pure (réserve, Swipe, Duel, Roulette, Joker, tour de rôle). Lancement : node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../modes.js';

const members = [
  { id: 'a', order: 0, wants: ['m1', 'm2'], seen: ['m3'] },
  { id: 'b', order: 1, wants: ['m2'], seen: [] },
  { id: 'c', order: 2, wants: ['m9'], seen: ['m4'] },
];
const T = (id, o = {}) => ({ id, type: 'film', short: false, collection: 'trouvailles', releaseDate: '2000-01-01', runtime: 100, region: 'france', year: 2000, moods: ['rire'], ...o });
const titles = [T('m1'), T('m2', { type: 'serie', runtime: 45 }), T('m3'), T('m4'), T('m5', { short: true, runtime: 10 }), T('m6', { releaseDate: '2026-10-09' }), T('m7', { releaseDate: null }), T('m8', { runtime: 200, moods: ['frisson'] }), T('m9', { year: 1975, region: 'asie-est' })];
const ctx = { members, participants: ['a', 'b'], hidden: new Set(['m9']), watched: new Set(), moodsOf: t => t.moods, today: '2026-09-25' };
const pool = f => M.buildPool(titles, { ...M.defaultFilters(), ...f }, ctx);
const wc = M.wantCounter(members, ['a', 'b', 'c']);

test('bientôt : date future ou absente', () => {
  assert.equal(M.isSoon(T('x', { releaseDate: '2026-10-09' }), '2026-09-25'), true);
  assert.equal(M.isSoon(T('x', { releaseDate: null })), true);
  assert.equal(M.isSoon(T('x'), '2026-09-25'), false);
});

test('réserve : filtres de soirée', () => {
  assert.deepEqual(pool({}), ['m1', 'm4', 'm8']); // films seuls, sans vus, masqués, bientôt ni courts
  assert.deepEqual(pool({ types: ['court'] }), ['m5']);
  assert.deepEqual(M.buildPool([...titles, T('m10', { runtime: null })], { ...M.defaultFilters(), maxRuntime: 120 }, ctx), ['m1', 'm4', 'm10']);
  assert.deepEqual(pool({ includeSeen: true }), ['m1', 'm3', 'm4', 'm8']);
  assert.deepEqual(pool({ types: ['film', 'serie'], onlyWants: true }), ['m1', 'm2']);
  assert.deepEqual(pool({ moods: ['frisson'] }), ['m8']);
  assert.deepEqual(M.buildPool(titles, M.defaultFilters(), { ...ctx, watched: new Set(['m1']) }), ['m4', 'm8']);
  assert.deepEqual(M.buildPool(titles, { ...M.defaultFilters(), decades: [1970] }, { ...ctx, hidden: new Set() }), ['m9']);
});

test('paquet : envies en premier, au plus la moitié, sans doublon', () => {
  const ids = Array.from({ length: 40 }, (_, i) => 'p' + i);
  const wanted = new Set(ids.slice(0, 30));
  for (let k = 0; k < 50; k++) {
    const deck = M.drawSelection(ids, 10, wanted);
    assert.equal(new Set(deck).size, 10);
    assert.ok(deck.filter(id => wanted.has(id)).length >= 5);
  }
  for (let k = 0; k < 20; k++) assert.ok(M.drawSelection(ids, 10, new Set(['p35'])).includes('p35'));
});

test('Swipe : match, classement et titres aimés par la moitié', () => {
  const one = M.swipeOutcome(['m1', 'm2', 'm4'], { a: { swipe: { m1: true, m2: true, m4: false } }, b: { swipe: { m1: false, m2: true, m4: true } } }, ['a', 'b', 'c'], wc);
  assert.deepEqual([one.matches, one.result, one.ranking], [['m2'], 'm2', ['m2', 'm1', 'm4']]);
  const none = M.swipeOutcome(['m1', 'm2', 'm4'], { a: { swipe: { m1: true } }, b: { swipe: { m1: false } }, c: { swipe: { m2: true } } }, ['a', 'b', 'c'], wc);
  assert.deepEqual([none.matches, none.result, none.liked, none.ranking], [[], null, [], ['m2', 'm1', 'm4']]);
});

test('départage en Duel : 4 ou 8 titres', () => {
  assert.deepEqual(M.tieBreakTitles(['m1', 'm2'], ['m1', 'm2', 'x', 'y', 'z'], wc), ['m2', 'm1', 'x', 'y']);
  const many = Array.from({ length: 10 }, (_, i) => 'q' + i);
  assert.equal(M.tieBreakTitles(many, many, () => 0).length, 8);
  assert.equal(M.tieBreakTitles(many.slice(0, 5), many, () => 0).length, 8);
});

test('Duel : tours, égalités, vainqueur et dauphin', () => {
  const v = { a: { duel: { 0: { 0: 'm1', 1: 'm4' }, 1: { 0: 'm4' } } }, b: { duel: { 0: { 0: 'm1', 1: 'm3' }, 1: { 0: 'm4' } } } };
  let o = M.closeRound(M.makeBracket(['m1', 'm2', 'm3', 'm4']), 0, v, ['a', 'b'], wc, () => 0.9);
  assert.deepEqual([o.done, o.round, o.bracket[0].duels.map(d => d.winner)], [false, 1, ['m1', 'm4']]);
  o = M.closeRound(o.bracket, 1, v, ['a', 'b'], wc);
  assert.deepEqual([o.done, o.result, o.runnerUp], [true, 'm4', 'm1']);
  const tie = M.closeRound(M.makeBracket(['m3', 'm2']), 0, { a: { duel: { 0: { 0: 'm3' } } }, b: { duel: { 0: { 0: 'm2' } } } }, ['a', 'b'], wc, () => 0);
  assert.equal(tie.result, 'm2'); // égalité → le plus d'envies
  assert.ok(M.hasVotedRound(v.a, 0, 2));
  assert.ok(!M.hasVotedRound({}, 0, 2));
});

test('Roulette : poids 3/1 et bande identique sur tous les téléphones', () => {
  const counts = { m1: 0, x: 0 };
  for (let i = 0; i < 20000; i++) counts[M.rouletteDraw(['m1', 'x'], [], wc)]++;
  const ratio = counts.m1 / counts.x;
  assert.ok(ratio > 2.7 && ratio < 3.3, String(ratio));
  assert.equal(M.rouletteDraw(['m1'], ['m1'], wc), null);
  const a = M.rouletteStrip(['m1', 'm2', 'm3'], 'm2', 's1:1');
  assert.deepEqual(a, M.rouletteStrip(['m1', 'm2', 'm3'], 'm2', 's1:1'));
  assert.equal(a.at(-1), 'm2');
});

test('Joker : remplacement selon le mode, un par mois', () => {
  assert.deepEqual(M.jokerPatch({ mode: 'swipe', result: 'm2', ranking: ['m2', 'm1'], rejected: [], jokers: [] }, 'a', wc, 5),
    { rejected: ['m2'], jokers: [{ memberId: 'a', titleId: 'm2', at: 5 }], result: 'm1' });
  const duel = { mode: 'duel', result: 'm4', runnerUp: 'm1', pool: ['m1', 'm2', 'm3', 'm4'], rejected: [], jokers: [], spin: 0 };
  const p1 = M.jokerPatch(duel, 'a', wc);
  assert.equal(p1.result, 'm1');
  const p2 = M.jokerPatch({ ...duel, ...p1 }, 'b', wc);
  assert.ok(['m2', 'm3'].includes(p2.result));
  assert.equal(M.jokerPatch({ mode: 'roulette', result: 'm1', pool: ['m1', 'm2'], rejected: [], jokers: [], spin: 1 }, 'a', wc).result, 'm2');
  assert.equal(M.hasJoker({ jokerMonth: '2026-09' }, '2026-09'), false);
  assert.equal(M.hasJoker({ jokerMonth: '2026-08' }, '2026-09'), true);
});

test('tour de rôle', () => {
  assert.equal(M.nextChooser(members, ['a', 'b', 'c'], null), 'a');
  assert.equal(M.nextChooser(members, ['a', 'b', 'c'], 'a'), 'b');
  assert.equal(M.nextChooser(members, ['a', 'b', 'c'], 'c'), 'a');
  assert.equal(M.nextChooser(members, ['a', 'c'], 'a'), 'c');
  assert.equal(M.nextChooser(members, ['a'], 'a'), 'a');
  assert.equal(M.nextChooser(members, ['a', 'b'], 'inconnu'), 'a');
  assert.equal(M.deciderOf({ participants: ['a', 'b'], chooserId: 'c', createdBy: 'b' }), 'b');
});

test('entrées du catalogue : humeurs, région, court, 8 langues', () => {
  const e = M.completeEntry({ type: 'serie', genres: [10759, 18], moods: ['frisson'], countries: ['KR'], runtime: 30 });
  assert.deepEqual([e.moods, e.region, e.short], [['frisson', 'emotion', 'evasion', 'action'], 'asie-est', false]);
  assert.equal(M.completeEntry({ type: 'film', genres: [], countries: ['SU'], runtime: 40 }).short, true);
  assert.equal(M.manualEntry({ title: "L'Été à Brême", year: 2020, type: 'film', short: true }).id, 'x-l-ete-a-breme-2020');
  const tv = M.tmdbEntry('tv', { fr: { name: 'Dark FR', overview: 'fr' }, en: { id: 70523, name: 'Dark', original_name: 'Dark', first_air_date: '2017-12-01', episode_run_time: [], last_episode_to_air: { runtime: 60 }, number_of_seasons: 3, origin_country: ['DE'], genres: [{ id: 80 }], vote_average: 8.4, overview: 'en' } });
  assert.deepEqual([tv.id, tv.runtime, tv.region, tv.year, Object.keys(tv.title).length], ['t70523', 60, 'europe-ouest', 2017, 8]);
});

test('statistiques du groupe', () => {
  const hist = [{ titleId: 'm1', chooserId: 'a', ratings: { a: 4, b: 2 } }, { titleId: 'm8', chooserId: 'b', ratings: { a: 5 } }, { titleId: 'm4', chooserId: 'a', ratings: {} }];
  const st = M.groupStats(hist, id => titles.find(x => x.id === id), x => x.moods, members);
  assert.equal(st.watched, 3);
  assert.deepEqual(st.choosers.map(c => [c.id, c.average]), [['b', 5], ['a', 3]]);
});
