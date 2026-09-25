// Génère data/catalogue.json à partir de data/titles.json grâce à l'API TMDB.
// Lancement : TMDB_KEY=xxxx node scripts/build-catalogue.mjs   (Node 18 ou plus, aucune dépendance)
import { readFileSync, writeFileSync } from 'node:fs';

const KEY = process.env.TMDB_KEY;
if (!KEY) {
  console.error('Clé manquante. Lance : TMDB_KEY=xxxx node scripts/build-catalogue.mjs');
  process.exit(1);
}

const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
const titles = readJson('data/titles.json');
const overrides = readJson('data/overrides.json');
const manual = readJson('data/manual.json');

// Humeurs calculées depuis les genres TMDB (section 7.6)
const MOODS = {
  movie: { 35: ['rire'], 27: ['frisson'], 53: ['tension'], 80: ['tension'], 9648: ['tension'], 18: ['emotion'], 10749: ['amour'], 878: ['evasion'], 14: ['evasion'], 12: ['evasion'], 28: ['action'], 10752: ['action'], 37: ['action'], 99: ['apprendre'], 36: ['apprendre'], 16: ['animation'], 10751: ['famille'] },
  tv: { 35: ['rire'], 80: ['tension'], 9648: ['tension'], 18: ['emotion'], 10766: ['amour'], 10765: ['evasion'], 10759: ['evasion', 'action'], 10768: ['action'], 37: ['action'], 99: ['apprendre'], 16: ['animation'], 10751: ['famille'], 10762: ['famille'] },
};

// Régions d'après le premier pays d'origine (section 7.6)
const REGIONS = {
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
const regionOf = code => Object.keys(REGIONS).find(r => REGIONS[r].split(' ').includes(code)) || 'autres';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const letters = s => stripAccents(s).toLowerCase().replace(/[^a-z]/g, '');
const slug = s => stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const yearOf = item => +(item.release_date || item.first_air_date || '').slice(0, 4) || null;

// Appel TMDB avec pause de 30 ms, nouvel essai si la limite est atteinte, cache pour la durée du script
const cache = new Map();
function tmdb(path, params = {}) {
  const url = `https://api.themoviedb.org/3${path}?${new URLSearchParams({ api_key: KEY, ...params })}`;
  if (!cache.has(url)) cache.set(url, fetchJson(url));
  return cache.get(url);
}
async function fetchJson(url, attempt = 0) {
  await sleep(30);
  const res = await fetch(url);
  if (res.status === 429 && attempt < 5) return sleep(1000).then(() => fetchJson(url, attempt + 1));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`TMDB a répondu ${res.status} (${url.replace(KEY, '…')})`);
  return res.json();
}

const details = (kind, id, language = 'en-US') => tmdb(`/${kind}/${id}`, { language });
// Durée connue en minutes (film) ou d'un épisode (série), sinon null
const runtimeOf = (kind, d) =>
  (kind === 'movie' ? d.runtime : d.episode_run_time?.[0] || d.last_episode_to_air?.runtime) || null;

// Recherche : titre en fr puis en, titre VO, puis sans l'année ; on s'arrête au premier essai qui donne un candidat
async function findCandidates(t, kind) {
  const vo = t.vo ? t.vo.split(' / ').map(v => v.replace(/\s*\(.*?\)/g, '').trim()) : [];
  const attempts = [
    [t.title, 'fr-FR', true],
    [t.title, 'en-US', true],
    ...vo.map(v => [v, 'en-US', true]),
    ...[t.title, ...vo].map(q => [q, 'fr-FR', false]),
  ];
  for (const [query, language, withYear] of attempts) {
    const params = { query, language };
    if (withYear) params[kind === 'movie' ? 'year' : 'first_air_date_year'] = t.year;
    const data = await tmdb(`/search/${kind}`, params);
    const list = await keepValid(data?.results || [], t, kind);
    if (list.length) return list;
  }
  return [];
}

// Garde les candidats à ±1 an ; pour un court, rejette ceux de plus de 40 minutes
async function keepValid(results, t, kind) {
  const list = results.filter(r => Math.abs(yearOf(r) - t.year) <= 1);
  if (!t.short) return list;
  const kept = [];
  for (const r of list) {
    const d = await details(kind, r.id);
    if (!d || !(runtimeOf(kind, d) > 40)) kept.push(r);
  }
  return kept;
}

async function directorsOf(kind, id) {
  if (kind === 'movie') {
    const credits = await tmdb(`/movie/${id}/credits`);
    return (credits?.crew || []).filter(c => c.job === 'Director').map(c => c.name);
  }
  return ((await details('tv', id))?.created_by || []).map(c => c.name);
}

const sameDirector = (name, hint) => {
  const a = letters(name);
  const b = letters(hint);
  return a !== '' && (b.includes(a) || a.includes(b));
};

// Choix du candidat : réalisateur confirmé parmi les 3 premiers, sinon le plus populaire
async function choose(list, t, kind) {
  if (t.director) {
    for (const c of list.slice(0, 3)) {
      if ((await directorsOf(kind, c.id)).some(n => sameDirector(n, t.director))) return { id: c.id };
    }
  }
  const best = list.reduce((a, b) => (b.popularity > a.popularity ? b : a));
  return { id: best.id, unconfirmed: !!t.director };
}

// Construit l'entrée du catalogue à partir des détails TMDB en trois langues
async function buildEntry(t, kind, id) {
  const fr = await details(kind, id, 'fr-FR');
  const en = await details(kind, id, 'en-US');
  const ru = await details(kind, id, 'ru-RU');
  if (!fr || !en || !ru) return null;
  const name = d => (kind === 'movie' ? d.title : d.name);
  return {
    id: `${kind === 'movie' ? 'm' : 't'}${id}`,
    tmdbId: id,
    tmdbType: kind,
    type: t.type,
    short: t.short,
    collection: t.collection,
    section: t.section,
    title: { fr: name(fr), en: name(en), ru: name(ru) },
    originalTitle: kind === 'movie' ? en.original_title : en.original_name,
    year: t.year,
    releaseDate: (kind === 'movie' ? en.release_date : en.first_air_date) || null,
    runtime: runtimeOf(kind, en) || (kind === 'tv' ? 45 : null),
    seasons: kind === 'tv' ? en.number_of_seasons || null : null,
    countries: en.origin_country?.length ? en.origin_country : (en.production_countries || []).map(c => c.iso_3166_1),
    genres: (en.genres || []).map(g => g.id),
    moods: t.moodsPlus,
    overview: { fr: fr.overview || '', en: en.overview || '', ru: ru.overview || '' },
    poster: fr.poster_path || en.poster_path || null,
    rating: en.vote_average ? Math.round(en.vote_average * 10) / 10 : null,
    tags: t.tags,
  };
}

// Calcule humeurs, région et « court » (section 7.6) ; sert aussi pour manual.json
function complete(e) {
  const table = MOODS[e.type === 'serie' ? 'tv' : 'movie'];
  const moods = new Set([...(e.moods || []), ...(e.genres || []).flatMap(g => table[g] || [])]);
  return {
    ...e,
    moods: [...moods],
    region: regionOf((e.countries || [])[0]),
    short: !!e.short || (e.type === 'film' && e.runtime > 0 && e.runtime <= 40),
  };
}

const catalogue = [];
const unresolved = [];
const usedBy = new Map();
const manualIds = new Set(manual.map(m => m.id));
let duplicates = 0;
let unconfirmed = 0;

for (const [i, t] of titles.entries()) {
  if (i % 25 === 0) console.log(`… ${i}/${titles.length}`);
  if (manualIds.has(`x-${slug(t.title)}-${t.year}`)) continue; // saisi à la main dans manual.json
  const kind = t.type === 'serie' ? 'tv' : 'movie';
  let found = overrides[t.key] ? { id: overrides[t.key].tmdbId, kind: overrides[t.key].tmdbType } : null;
  if (!found) {
    const list = await findCandidates(t, kind);
    if (list.length) found = { ...(await choose(list, t, kind)), kind };
  }
  const entry = found && (await buildEntry(t, found.kind, found.id));
  if (!entry) {
    unresolved.push(t.key);
    console.log(`✗ non résolu : ${t.key}`);
    continue;
  }
  if (usedBy.has(entry.id)) {
    duplicates++;
    console.log(`⚠ doublon : ${t.key} donne ${entry.id}, déjà pris par ${usedBy.get(entry.id)} (ignoré)`);
    continue;
  }
  if (found.unconfirmed) {
    unconfirmed++;
    console.log(`? réalisateur non confirmé : ${t.key} → « ${entry.title.fr} » (${entry.year}) https://www.themoviedb.org/${found.kind}/${found.id}`);
  }
  usedBy.set(entry.id, t.key);
  catalogue.push(complete(entry));
}

catalogue.push(...manual.map(complete));
catalogue.sort((a, b) => (a.title.fr || a.originalTitle).localeCompare(b.title.fr || b.originalTitle, 'fr'));

writeFileSync('data/catalogue.json', JSON.stringify(catalogue) + '\n');
writeFileSync('data/unresolved.txt', unresolved.map(k => k + '\n').join(''));

console.log(`
Bilan
  Résolus via TMDB        : ${catalogue.length - manual.length}
  Saisis à la main        : ${manual.length}
  Non résolus             : ${unresolved.length}${unresolved.length ? ' → voir data/unresolved.txt' : ''}
  Doublons ignorés        : ${duplicates}
  Réalisateur non confirmé : ${unconfirmed}
  Total dans catalogue.json : ${catalogue.length}`);
