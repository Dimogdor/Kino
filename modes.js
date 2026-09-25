// Logique pure de Kino : règles du catalogue, réserve, Swipe, Duel, Roulette, Joker, tour de rôle, statistiques.
// Aucune dépendance au navigateur ni à Firebase : chaque fonction se teste seule.

export const MOODS = ['rire', 'frisson', 'tension', 'emotion', 'amour', 'evasion', 'action', 'apprendre', 'animation', 'famille'];
export const MOOD_EMOJI = { rire: '😂', frisson: '😱', tension: '🔪', emotion: '😢', amour: '💘', evasion: '🚀', action: '💥', apprendre: '🧠', animation: '🎨', famille: '🧸' };
export const COLLECTIONS = ['trouvailles', 'classiques', 'monde', 'niches', 'courts', 'culture', 'series', 'ajouts'];

// Humeurs calculées depuis les genres TMDB (section 7.6)
const GENRE_MOODS = {
  film: { 35: ['rire'], 27: ['frisson'], 53: ['tension'], 80: ['tension'], 9648: ['tension'], 18: ['emotion'], 10749: ['amour'], 878: ['evasion'], 14: ['evasion'], 12: ['evasion'], 28: ['action'], 10752: ['action'], 37: ['action'], 99: ['apprendre'], 36: ['apprendre'], 16: ['animation'], 10751: ['famille'] },
  serie: { 35: ['rire'], 80: ['tension'], 9648: ['tension'], 18: ['emotion'], 10766: ['amour'], 10765: ['evasion'], 10759: ['evasion', 'action'], 10768: ['action'], 37: ['action'], 99: ['apprendre'], 16: ['animation'], 10751: ['famille'], 10762: ['famille'] },
};

// Régions d'après le premier pays d'origine (section 7.6)
const REGION_CODES = {
  france: 'FR',
  'europe-ouest': 'GB IE DE AT CH BE NL LU IT ES PT GR MT CY XG',
  'europe-nord': 'SE NO DK FI IS',
  'europe-est': 'SU RU UA BY MD PL CZ SK XC HU RO BG YU RS HR SI BA ME MK AL XK EE LV LT GE AM AZ KZ UZ KG TJ TM',
  'amerique-nord': 'US CA',
  'amerique-latine': 'MX GT HN SV NI CR PA CU DO HT PR JM CO VE EC PE BO CL AR UY PY BR',
  'monde-arabe': 'MA DZ TN LY EG MR SD LB SY PS JO IQ SA AE QA KW BH OM YE',
  'moyen-orient': 'IR TR IL AF',
  afrique: 'SN ML BF NE CI GH NG CM CD CG GA TD ET KE UG TZ RW BI SO ZA ZM ZW MZ AO NA BW LS MG BJ TG GN GW SL LR GM CV ER DJ MW SS CF GQ ST KM MU SC SZ EH ZR',
  'asie-sud': 'IN PK BD LK NP BT MV',
  'asie-est': 'JP KR KP CN HK TW MO MN',
  'asie-sud-est': 'TH VN KH LA MM MY SG ID PH BN TL',
  oceanie: 'AU NZ PG FJ',
};
export const REGIONS = [...Object.keys(REGION_CODES), 'autres'];
export const regionOf = code => REGIONS.find(r => REGION_CODES[r]?.split(' ').includes(code)) || 'autres';

// ---------- Règles de calcul du catalogue ----------

export const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
export const normalize = s => stripAccents(String(s || '')).toLowerCase();
export const slug = s => normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const decadeOf = year => Math.floor(year / 10) * 10;
export const kindOf = t => (t.short ? 'court' : t.type); // « film », « serie » ou « court »

const pad = n => String(n).padStart(2, '0');
export const todayISO = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const isSoon = (t, today = todayISO()) => !t.releaseDate || t.releaseDate > today;

// Complète une entrée : humeurs (genres + ajouts), région, court (40 min ou moins)
export function completeEntry(e) {
  const table = GENRE_MOODS[e.type] || GENRE_MOODS.film;
  const moods = new Set([...(e.moods || []), ...(e.genres || []).flatMap(g => table[g] || [])]);
  return {
    ...e,
    moods: MOODS.filter(m => moods.has(m)),
    region: regionOf((e.countries || [])[0]),
    short: !!e.short || (e.type === 'film' && e.runtime > 0 && e.runtime <= 40),
  };
}

// Entrée de catalogue à partir des détails TMDB en français, anglais et russe
export function tmdbEntry(kind, fr, en, ru) {
  const name = d => (kind === 'movie' ? d.title : d.name);
  const date = (kind === 'movie' ? en.release_date : en.first_air_date) || null;
  const runtime = (kind === 'movie' ? en.runtime : en.episode_run_time?.[0] || en.last_episode_to_air?.runtime) || (kind === 'tv' ? 45 : null);
  return completeEntry({
    id: `${kind === 'movie' ? 'm' : 't'}${en.id}`,
    tmdbId: en.id,
    tmdbType: kind,
    type: kind === 'movie' ? 'film' : 'serie',
    short: false,
    collection: 'ajouts',
    section: '',
    title: { fr: name(fr), en: name(en), ru: name(ru) },
    originalTitle: kind === 'movie' ? en.original_title : en.original_name,
    year: date ? +date.slice(0, 4) : null,
    releaseDate: date,
    runtime,
    seasons: kind === 'tv' ? en.number_of_seasons || null : null,
    countries: en.origin_country?.length ? en.origin_country : (en.production_countries || []).map(c => c.iso_3166_1),
    genres: (en.genres || []).map(g => g.id),
    moods: [],
    overview: { fr: fr.overview || '', en: en.overview || '', ru: ru.overview || '' },
    poster: fr.poster_path || en.poster_path || null,
    rating: en.vote_average ? Math.round(en.vote_average * 10) / 10 : null,
    tags: [],
  });
}

// Entrée saisie à la main (hors TMDB) : sortie fixée au 1er janvier de l'année
export function manualEntry({ title, year, type, short }) {
  return completeEntry({
    id: `x-${slug(title)}-${year}`,
    type,
    short,
    collection: 'ajouts',
    section: '',
    title: { fr: title, en: title, ru: title },
    originalTitle: title,
    year,
    releaseDate: `${year}-01-01`,
    runtime: null,
    seasons: null,
    countries: [],
    genres: [],
    moods: [],
    overview: { fr: '', en: '', ru: '' },
    poster: null,
    rating: null,
    tags: [],
  });
}

// ---------- Hasard ----------

export function shuffle(list, rand = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function weightedPick(ids, weightOf, rand = Math.random) {
  const total = ids.reduce((sum, id) => sum + weightOf(id), 0);
  let x = rand() * total;
  for (const id of ids) {
    x -= weightOf(id);
    if (x < 0) return id;
  }
  return ids[ids.length - 1] ?? null;
}

// Générateur pseudo-aléatoire reproductible : même graine = même suite sur tous les téléphones
export function seededRandom(seed) {
  let h = 1779033703;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 3432918353);
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ---------- Réserve ----------

// Filtres de soirée par défaut (listes vides = tout)
export const defaultFilters = () => ({
  types: ['film'],
  collections: [],
  moods: [],
  maxRuntime: null,
  regions: [],
  decades: [],
  includeSeen: false,
  includeWatched: false,
  onlyWants: false,
});

export const wantedBy = (members, ids) => new Set(members.filter(m => ids.includes(m.id)).flatMap(m => m.wants || []));
export const wantCounter = (members, ids) => id => members.filter(m => ids.includes(m.id) && (m.wants || []).includes(id)).length;

// Titres éligibles à une soirée ; ctx = { members, participants, hidden:Set, watched:Set, moodsOf, today }
export function buildPool(titles, f, ctx) {
  const people = ctx.members.filter(m => ctx.participants.includes(m.id));
  const seen = new Set(people.flatMap(m => m.seen || []));
  const wants = new Set(people.flatMap(m => m.wants || []));
  return titles
    .filter(t =>
      !isSoon(t, ctx.today) &&
      !ctx.hidden.has(t.id) &&
      f.types.includes(kindOf(t)) &&
      (!f.collections.length || f.collections.includes(t.collection)) &&
      (!f.moods.length || ctx.moodsOf(t).some(m => f.moods.includes(m))) &&
      (!f.maxRuntime || !t.runtime || t.runtime <= f.maxRuntime) &&
      (!f.regions.length || f.regions.includes(t.region)) &&
      (!f.decades.length || f.decades.includes(decadeOf(t.year))) &&
      (f.includeSeen || !seen.has(t.id)) &&
      (f.includeWatched || !ctx.watched.has(t.id)) &&
      (!f.onlyWants || wants.has(t.id)))
    .map(t => t.id);
}

export const minPoolSize = (mode, size) => (mode === 'roulette' ? 2 : size);

// Paquet ou tableau : envies d'abord (au plus la moitié), le reste au hasard, puis mélange
export function drawSelection(pool, size, wanted, rand = Math.random) {
  const favourites = shuffle(pool.filter(id => wanted.has(id)), rand).slice(0, Math.floor(size / 2));
  const others = shuffle(pool.filter(id => !favourites.includes(id)), rand).slice(0, size - favourites.length);
  return shuffle([...favourites, ...others], rand);
}

// ---------- Swipe ----------

// Participants qui ont voté au moins une fois (les absents ne bloquent pas un résultat forcé)
const swipeVoters = (votes, participants) => participants.filter(m => Object.keys(votes[m]?.swipe || {}).length);

export function swipeOutcome(deck, votes, participants, wantCount) {
  const voters = swipeVoters(votes, participants);
  const yes = Object.fromEntries(deck.map(id => [id, voters.filter(m => votes[m].swipe[id] === true).length]));
  const ranking = [...deck].sort((a, b) => yes[b] - yes[a] || wantCount(b) - wantCount(a) || deck.indexOf(a) - deck.indexOf(b));
  const matches = voters.length ? ranking.filter(id => yes[id] === voters.length) : [];
  const liked = ranking.filter(id => yes[id] > 0 && yes[id] * 2 >= voters.length);
  return { ranking, matches, liked, yes, result: matches.length === 1 ? matches[0] : null };
}

// Plusieurs matchs → Duel de 4 (4 matchs ou moins) ou 8 ; au-delà de 8, ceux qui ont le plus d'envies ; complété par les plus « oui »
export function tieBreakTitles(matches, ranking, wantCount) {
  const size = matches.length <= 4 ? 4 : 8;
  const picks = [...matches].sort((a, b) => wantCount(b) - wantCount(a)).slice(0, size);
  for (const id of ranking) if (picks.length < size && !picks.includes(id)) picks.push(id);
  return picks;
}

// ---------- Duel ----------

export function makeBracket(ids) {
  const duels = [];
  for (let i = 0; i < ids.length; i += 2) duels.push({ a: ids[i], b: ids[i + 1], winner: null });
  return [{ duels }];
}

export const hasVotedRound = (vote, round, count) => Object.keys(vote?.duel?.[round] || {}).length >= count;

// Ferme un tour : majorité, puis plus d'envies, puis tirage au sort (enregistré dans le tableau)
export function closeRound(bracket, round, votes, participants, wantCount, rand = Math.random) {
  const duels = bracket[round].duels.map((d, i) => {
    const picks = participants.map(m => votes[m]?.duel?.[round]?.[i]);
    const diff = picks.filter(p => p === d.a).length - picks.filter(p => p === d.b).length || wantCount(d.a) - wantCount(d.b);
    const winner = diff > 0 ? d.a : diff < 0 ? d.b : rand() < 0.5 ? d.a : d.b;
    return { ...d, winner };
  });
  const next = [...bracket.slice(0, round), { duels }];
  if (duels.length === 1) {
    const final = duels[0];
    return { bracket: next, done: true, result: final.winner, runnerUp: final.winner === final.a ? final.b : final.a };
  }
  return { bracket: [...next, ...makeBracket(duels.map(d => d.winner))], done: false, round: round + 1 };
}

// ---------- Roulette ----------

// Tirage pondéré : 3 pour un titre en envie chez au moins un participant, 1 sinon
export function rouletteDraw(pool, exclude, wantCount, rand = Math.random) {
  const ids = pool.filter(id => !exclude.includes(id));
  return ids.length ? weightedPick(ids, id => (wantCount(id) > 0 ? 3 : 1), rand) : null;
}

// Bande d'affiches de l'animation, identique sur tous les téléphones, terminée par le résultat
export function rouletteStrip(pool, result, seed, length = 30) {
  const rand = seededRandom(seed);
  return [...Array.from({ length: length - 1 }, () => pool[Math.floor(rand() * pool.length)]), result];
}

// ---------- Joker ----------

export const hasJoker = (member, month = monthKey()) => !!member && member.jokerMonth !== month;

// Champs à écrire dans la soirée quand un Joker rejette le résultat
export function jokerPatch(s, memberId, wantCount, now = Date.now(), rand = Math.random) {
  const rejected = [...(s.rejected || []), s.result];
  const jokers = [...(s.jokers || []), { memberId, titleId: s.result, at: now }];
  if (s.mode === 'swipe') return { rejected, jokers, result: s.ranking.find(id => !rejected.includes(id)) ?? null };
  if (s.mode === 'duel' && s.runnerUp && !rejected.includes(s.runnerUp)) return { rejected, jokers, result: s.runnerUp };
  return { rejected, jokers, result: rouletteDraw(s.pool, rejected, wantCount, rand), spin: (s.spin || 0) + 1 };
}

// ---------- Tour de rôle ----------

// Premier participant qui suit, dans l'ordre, la personne qui a choisi la dernière fois
export function nextChooser(members, participants, lastChooserId) {
  const ordered = [...members].sort((a, b) => a.order - b.order);
  const start = ordered.findIndex(m => m.id === lastChooserId);
  for (let k = 1; k <= ordered.length; k++) {
    const m = ordered[(start + k + ordered.length) % ordered.length];
    if (participants.includes(m.id)) return m.id;
  }
  return null;
}

// Qui tranche quand le Swipe donne plusieurs matchs
export const deciderOf = s => (s.participants.includes(s.chooserId) ? s.chooserId : s.createdBy);

// ---------- Historique et statistiques ----------

export const average = list => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);
export const entryAverage = e => average(Object.values(e.ratings || {}));

const topCounts = (keys, limit = 3) => {
  const counts = {};
  keys.forEach(k => (counts[k] = (counts[k] || 0) + 1));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
};

export function groupStats(history, titleOf, moodsOf, members) {
  const titled = history.map(e => titleOf(e.titleId)).filter(Boolean);
  const choosers = members
    .map(m => {
      const avgs = history.filter(e => e.chooserId === m.id).map(entryAverage).filter(x => x !== null);
      return { id: m.id, average: average(avgs), count: avgs.length };
    })
    .filter(c => c.count)
    .sort((a, b) => b.average - a.average);
  return {
    watched: history.length,
    average: average(history.flatMap(e => Object.values(e.ratings || {}))),
    moods: topCounts(titled.flatMap(moodsOf)),
    regions: topCounts(titled.map(t => t.region)),
    choosers,
  };
}
