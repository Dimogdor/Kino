// Kino — interface : navigation, écrans et actions (HTML/JS purs, sans framework).
import { t, lang, setLang, LANGS } from './i18n.js';
import * as M from './modes.js';
import { firebaseConfig, tmdbKey } from './config.js';

const IMG = 'https://image.tmdb.org/t/p/';
const TMDB_LANG = { fr: 'fr-FR', en: 'en-US', ru: 'ru-RU' };
const EMOJIS = ['😀', '😎', '🤓', '🥰', '😈', '👻', '🤖', '👽', '🐱', '🐶', '🦊', '🐼', '🐸', '🦄', '🐙', '🌵', '🌸', '🍕', '🍿', '🎸', '⚽', '🚀', '🌙', '🔥'];
const WATCH_COUNTRIES = ['FR', 'BE', 'CH', 'LU', 'CA', 'GB', 'US', 'DE', 'ES', 'IT', 'RU', 'MA'];
const MODE_ICON = { swipe: '👆', duel: '⚔️', roulette: '🎡' };
const TABS = { tonight: '🎬', catalogue: '📚', history: '🕘', group: '👥' };
const OLD_COUNTRIES = ['SU', 'XC', 'YU', 'XG', 'ZR'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = selector => document.querySelector(selector);
const store = {
  get: (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
};

// ---------- État ----------

const emptyCatFilters = () => ({ type: '', collection: '', moods: [], region: '', decade: '', maxRuntime: '', status: 'all' });

const S = {
  tab: 'tonight',
  scroll: {},
  base: [], // catalogue de base (data/catalogue.json)
  loaded: false,
  db: null, // module db.js une fois connecté
  dbState: firebaseConfig.apiKey ? 'connecting' : 'off',
  uid: null,
  groups: store.get('kino.groups', []), // [{ groupId, memberId, name }]
  gid: null,
  mid: null,
  group: null,
  members: [],
  added: [], // titres ajoutés par le groupe
  sessions: [], // soirées actives
  history: [],
  votes: {},
  votesFor: null,
  stopGroup: null,
  stopVotes: null,
  cat: { chip: 'all', q: '', sort: 'random', f: emptyCatFilters() },
  launch: null, // formulaire « Lancer une soirée »
  openSession: null, // soirée affichée à l'écran
  sheet: null, // feuille ouverte : fiche, filtres, ajout, création, lien
  join: null, // écran « Rejoindre un groupe »
  spun: {}, // animations de Roulette déjà jouées sur cet appareil
  providers: {}, // cache « Où le voir »
  running: new Set(), // transactions en cours (évite les doublons)
  statsOpen: false,
  online: navigator.onLine,
  busy: false,
  pending: false,
  pendingJoin: null,
};

// ---------- Titres ----------

let byId = new Map();
const rank = new Map();
const searchKeys = new Map();

function allTitles() {
  const base = new Set(S.base.map(x => x.id));
  return [...S.base, ...S.added.filter(x => !base.has(x.id))];
}
const reindex = () => (byId = new Map(allTitles().map(x => [x.id, x])));
const title = id => byId.get(id) || { id, title: {}, originalTitle: '?', moods: [], countries: [], genres: [] };
const nameOf = x => x.title?.[lang] || x.title?.en || x.originalTitle || '';
const overviewOf = x => x.overview?.[lang] || x.overview?.en || '';
const moodsOf = x => S.group?.moods?.[x.id] || x.moods || [];
const rankOf = id => (rank.has(id) ? rank.get(id) : rank.set(id, Math.random()).get(id)); // nouveau mélange à chaque ouverture
function searchKey(x) {
  if (!searchKeys.has(x.id)) searchKeys.set(x.id, M.normalize([x.title?.fr, x.title?.en, x.title?.ru, x.originalTitle].join(' ')));
  return searchKeys.get(x.id);
}

// ---------- Groupe ----------

const me = () => S.members.find(m => m.id === S.mid);
const member = id => S.members.find(m => m.id === id);
const who = id => (member(id) ? `${member(id).emoji} ${esc(member(id).name)}` : '—');
const ordered = () => [...S.members].sort((a, b) => a.order - b.order);
const hiddenSet = () => new Set(S.group?.hidden || []);
const groupWants = () => new Set(S.members.flatMap(m => m.wants || []));
const mySeen = () => new Set(me()?.seen || []);
const ms = ts => ts?.toMillis?.() ?? 0;
const activeSession = () => [...S.sessions].sort((a, b) => ms(b.createdAt) - ms(a.createdAt))[0] || null;
const lastChooser = () => [...S.history].sort((a, b) => ms(b.date) - ms(a.date))[0]?.chooserId || null;
const wantCount = s => M.wantCounter(S.members, s.participants);
const inGroup = () => !!(S.db && S.gid && me());

// ---------- Mise en forme ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = x => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(x);
const dateText = ts => (ts ? new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(ts.toDate ? ts.toDate() : new Date(ts)) : '');
const hue = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const flag = code => (/^[A-Z]{2}$/.test(code) && !OLD_COUNTRIES.includes(code) ? String.fromCodePoint(...[...code].map(c => 0x1f1a5 + c.charCodeAt(0))) : '');
const decadeText = d => t('fmt.decade', { d });
const country = () => store.get('kino.country', 'FR');

function runtimeText(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return t('fmt.m', { m });
  return m ? t('fmt.hm', { h, m: String(m).padStart(2, '0') }) : t('fmt.h', { h });
}

function countryName(code) {
  const old = t('countries')[code];
  if (old) return old;
  try { return new Intl.DisplayNames([lang], { type: 'region' }).of(code); } catch { return code; }
}

const meta = x =>
  [x.year, x.type === 'serie' ? t('fiche.seasons', { n: x.seasons || '?' }) : runtimeText(x.runtime), x.type === 'serie' ? t('badge.serie') : '']
    .filter(Boolean).join(' · ');

function poster(x, size = 'w342') {
  return x.poster
    ? `<img src="${IMG}${size}${x.poster}" loading="lazy" alt="">`
    : `<div class="gen" style="--h:${hue(x.id)}"><span>${esc(nameOf(x))}</span></div>`;
}

function badges(x) {
  const out = [];
  if (x.type === 'serie') out.push(`<span class="badge">${t('badge.serie')}</span>`);
  if (x.short) out.push(`<span class="badge">${t('badge.short')}</span>`);
  if (M.isSoon(x)) out.push(`<span class="badge soon">${t('badge.soon')}</span>`);
  const icons = (S.members.some(m => (m.wants || []).includes(x.id)) ? '❤️' : '') + ((me()?.seen || []).includes(x.id) ? '👁' : '');
  if (icons) out.push(`<span class="badge icons">${icons}</span>`);
  return out.join('');
}

const card = (x, act = 'open') => `<button class="card" data-act="${act}" data-id="${esc(x.id)}">
  <span class="poster">${poster(x)}<span class="badges">${badges(x)}</span></span>
  <span class="card-title">${esc(nameOf(x))}</span><span class="card-year">${x.year || ''}</span></button>`;

const chip = (label, on, act, value) => `<button type="button" class="chip ${on ? 'on' : ''}" data-act="${act}" data-v="${esc(value)}" aria-pressed="${on}">${label}</button>`;
const moodLabel = m => `${M.MOOD_EMOJI[m]} ${t('moods.' + m)}`;
const moodChips = x => moodsOf(x).map(m => `<span class="chip static">${moodLabel(m)}</span>`).join('');

const emojiPicker = current => `<div class="emoji-pick">${EMOJIS.map(e =>
  `<label><input type="radio" name="emoji" value="${e}" ${e === current ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>`;

const options = (list, value, label) => list.map(v => `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(label(v))}</option>`).join('');

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- Rendu ----------

const typing = () => {
  const a = document.activeElement;
  return a?.tagName === 'TEXTAREA' || (a?.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'file', 'button', 'submit'].includes(a.type));
};

// Redessine tout l'écran ; attend la fin d'une saisie, d'un glissement ou d'une animation
function render() {
  if (S.busy || typing()) {
    S.pending = true;
    return;
  }
  S.pending = false;
  const sheetTop = $('.sheet')?.scrollTop || 0;
  document.documentElement.lang = lang;
  $('#top').innerHTML = topBar();
  $('#banners').innerHTML = banners();
  $('#main').innerHTML = VIEWS[S.tab]();
  $('#nav').innerHTML = navBar();
  $('#sheet').innerHTML = S.sheet ? SHEETS[S.sheet.type]() : '';
  if (sheetTop && $('.sheet')) $('.sheet').scrollTop = sheetTop;
  document.body.classList.toggle('locked', !!S.sheet);
  if ($('.spin-strip')) animateSpin();
}

function topBar() {
  const select = S.groups.length && S.db
    ? `<select class="group-select" data-change="switch-group" aria-label="${t('group.select')}">${options(S.groups.map(g => g.groupId), S.gid, id => S.groups.find(g => g.groupId === id).name || '…')}</select>`
    : '';
  return `<span class="brand">🎬 Kino</span>${select}`;
}

function banners() {
  let html = S.online ? '' : `<div class="banner offline">${t('offline')}</div>`;
  const s = S.db && activeSession();
  if (s && S.tab !== 'tonight') html += `<button class="banner live" data-act="open-session">${t('session.live')} — ${t('session.join')}</button>`;
  return html;
}

const toRate = () => S.history.filter(e => e.participants.includes(S.mid) && e.status === 'vu' && !e.ratings?.[S.mid]);

const navBar = () => Object.entries(TABS).map(([id, icon]) => `<button class="tab ${S.tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}">
  <span class="ico">${icon}${id === 'history' && toRate().length ? '<i class="dot"></i>' : ''}</span>${t('tab.' + id)}</button>`).join('');

const sheetWrap = inner => `<div class="backdrop" data-act="close-sheet"></div>
  <section class="sheet" role="dialog" aria-modal="true"><button class="close" data-act="close-sheet" aria-label="${t('close')}">✕</button>${inner}</section>`;

function openSheet(sheet) {
  if (!S.sheet) history.pushState({ sheet: true }, '');
  S.sheet = sheet;
  render();
  if ($('.sheet')) $('.sheet').scrollTop = 0;
}

function closeSheet() {
  if (!S.sheet) return;
  S.sheet = null;
  if (history.state?.sheet) history.back();
  render();
}

const openTitle = id => openSheet({ type: 'title', id });

// ---------- Onglet « Ce soir » ----------

function tonightView() {
  if (S.dbState !== 'ready') return setupView();
  if (S.join) return joinView();
  if (!S.gid) return welcomeView();
  if (!S.group) return `<p class="center muted">${t('loading')}</p>`;
  const s = activeSession();
  if (s && S.openSession === s.id) return sessionView(s);
  if (S.launch) return launchView();
  const chooser = member(M.nextChooser(S.members, S.members.map(m => m.id), lastChooser()));
  const last = [...S.history].sort((a, b) => ms(b.date) - ms(a.date))[0];
  const today = last && M.todayISO(new Date(ms(last.date))) === M.todayISO();
  return `${s ? liveCard(s) : ''}
    ${today ? `<button class="last-pick" data-act="open" data-id="${esc(last.titleId)}">✅ ${t('tonight.picked')} <b>${esc(nameOf(title(last.titleId)))}</b></button>` : ''}
    <section class="hero">
      <div class="logo">🍿</div>
      ${chooser ? `<p class="turn">${t('turn', { name: `${chooser.emoji} ${esc(chooser.name)}` })}</p>` : ''}
      <button class="btn primary big" data-act="launch-open">${t('launch.open')}</button>
    </section>`;
}

const liveCard = s => `<div class="live-card">
  <p>🔴 <b>${t('session.live')}</b><br><span class="muted">${MODE_ICON[s.mode]} ${t('mode.' + s.mode)} · ${t('session.by', { name: who(s.createdBy) })}</span></p>
  <button class="btn primary" data-act="open-session">${t(s.participants.includes(S.mid) ? 'session.join' : 'session.watch')}</button></div>`;

function setupView() {
  const message = { off: t('setup.firebase'), connecting: t('setup.connecting'), error: t('setup.error') }[S.dbState];
  return `<section class="welcome"><div class="logo">🎬</div><h1>Kino</h1><p>${t('welcome.tagline')}</p>
    <p class="muted">${message}</p><button class="btn" data-act="tab" data-tab="catalogue">${t('setup.browse')}</button></section>`;
}

const welcomeView = () => `<section class="welcome"><div class="logo">🎬</div><h1>Kino</h1><p>${t('welcome.tagline')}</p>
  <button class="btn primary big" data-act="create-open">${t('welcome.create')}</button>
  <button class="btn big" data-act="link-open">${t('welcome.haveLink')}</button></section>`;

function joinView() {
  const J = S.join;
  if (J.loading) return `<p class="center muted">${t('loading')}</p>`;
  if (J.invalid) return `<section class="welcome"><p>${t('join.invalid')}</p><button class="btn" data-act="join-cancel">${t('back')}</button></section>`;
  return `<section class="welcome"><h2>${t('join.title', { name: esc(J.name) })}</h2>
    ${J.members.map(m => `<button class="btn big" data-act="join-as" data-id="${esc(m.id)}">${t('join.itsMe', { name: `${m.emoji} ${esc(m.name)}` })}</button>`).join('')}
    <form class="form" data-submit="join-new"><h3>${t('join.new')}</h3>
      <label>${t('form.yourName')}<input name="name" required maxlength="20" autocomplete="given-name"></label>
      ${emojiPicker(EMOJIS[J.members.length % EMOJIS.length])}
      <button class="btn primary">${t('join.submit')}</button></form>
    <button class="link" data-act="join-cancel">${t('cancel')}</button></section>`;
}

// ---------- Lancer une soirée ----------

function openLaunch() {
  S.launch = { participants: ordered().map(m => m.id), mode: 'swipe', deckSize: 20, bracketSize: 8, f: M.defaultFilters(), fold: {} };
  render();
}

const poolFor = (f, participants) => M.buildPool(allTitles(), f, {
  members: S.members,
  participants,
  hidden: hiddenSet(),
  watched: new Set(S.history.map(e => e.titleId)),
  moodsOf,
  today: M.todayISO(),
});

const launchSize = L => (L.mode === 'duel' ? L.bracketSize : L.deckSize);
const decades = () => [...new Set(allTitles().filter(x => x.year).map(x => M.decadeOf(x.year)))].sort((a, b) => a - b);

function fold(key, label, selected, body) {
  const open = S.launch.fold[key];
  return `<button type="button" class="fold" data-act="launch-fold" data-v="${key}" aria-expanded="${!!open}">${label} <span class="muted">${selected.length ? selected.length : t('all')}</span> ${open ? '▴' : '▾'}</button>
    ${open ? `<div class="chips wrap">${body}</div>` : ''}`;
}

function launchView() {
  const L = S.launch;
  const f = L.f;
  const pool = poolFor(f, L.participants);
  const need = M.minPoolSize(L.mode, launchSize(L));
  const chooser = member(M.nextChooser(S.members, L.participants, lastChooser()));
  const toggle = (key, label) => `<label class="switch"><input type="checkbox" data-change="launch-toggle" name="${key}" ${f[key] ? 'checked' : ''}><span>${label}</span></label>`;
  const size = (key, list) => `<div class="chips">${list.map(n => chip(t(key === 'deckSize' ? 'launch.cards' : 'launch.titles', { n }), L[key] === n, 'launch-size', `${key}:${n}`)).join('')}</div>`;
  return `<section class="form launch">
    ${chooser ? `<p class="turn">${t('turn', { name: `${chooser.emoji} ${esc(chooser.name)}` })}</p>` : ''}
    <h3>1. ${t('launch.participants')}</h3>
    <div class="chips wrap">${ordered().map(m => chip(`${m.emoji} ${esc(m.name)}`, L.participants.includes(m.id), 'launch-participant', m.id)).join('')}</div>
    <h3>2. ${t('launch.mode')}</h3>
    <div class="modes">${['swipe', 'duel', 'roulette'].map(mode => `<button type="button" class="mode-card ${L.mode === mode ? 'on' : ''}" data-act="launch-mode" data-v="${mode}">
      <b>${MODE_ICON[mode]} ${t('mode.' + mode)}</b><span>${t('mode.' + mode + 'Help')}</span></button>`).join('')}</div>
    ${L.mode === 'swipe' ? size('deckSize', [10, 20, 30]) : L.mode === 'duel' ? size('bracketSize', [4, 8, 16]) : ''}
    <h3>3. ${t('launch.filters')}</h3>
    <div class="chips wrap">${['film', 'serie', 'court'].map(k => chip(t('types.' + k), f.types.includes(k), 'launch-type', k)).join('')}</div>
    <p class="label">${t('filters.moods')} <span class="muted">${f.moods.length ? '' : t('all')}</span></p>
    <div class="chips wrap">${M.MOODS.map(m => chip(moodLabel(m), f.moods.includes(m), 'launch-mood', m)).join('')}</div>
    <p class="label">${t('filters.maxRuntime')} : <output id="runtime-out">${f.maxRuntime ? runtimeText(f.maxRuntime) : t('any')}</output></p>
    <label class="switch"><input type="checkbox" data-change="launch-any" ${f.maxRuntime ? '' : 'checked'}><span>${t('any')}</span></label>
    <input type="range" min="60" max="240" step="15" value="${f.maxRuntime || 120}" data-input="launch-runtime" data-change="launch-runtime" ${f.maxRuntime ? '' : 'disabled'} aria-label="${t('filters.maxRuntime')}">
    ${fold('collections', t('filters.collections'), f.collections, M.COLLECTIONS.map(c => chip(t('collections.' + c), f.collections.includes(c), 'launch-list', `collections:${c}`)).join(''))}
    ${fold('regions', t('filters.regions'), f.regions, M.REGIONS.map(r => chip(t('regions.' + r), f.regions.includes(r), 'launch-list', `regions:${r}`)).join(''))}
    ${fold('decades', t('filters.decades'), f.decades, decades().map(d => chip(decadeText(d), f.decades.includes(d), 'launch-list', `decades:${d}`)).join(''))}
    ${toggle('includeSeen', t('launch.includeSeen'))}
    ${toggle('includeWatched', t('launch.includeWatched'))}
    ${toggle('onlyWants', t('launch.onlyWants'))}
    <p class="count ${pool.length < need ? 'warn' : ''}">${pool.length < need ? t('launch.notEnough', { n: pool.length }) : t('launch.count', { n: pool.length })}</p>
    <div class="row"><button class="btn" data-act="launch-cancel">${t('cancel')}</button>
      <button class="btn primary" data-act="launch-go" ${pool.length < need || !L.participants.length ? 'disabled' : ''}>${t('launch.go')}</button></div>
  </section>`;
}

async function launch() {
  const L = S.launch;
  const pool = poolFor(L.f, L.participants);
  if (pool.length < M.minPoolSize(L.mode, launchSize(L))) return toast(t('launch.notEnough', { n: pool.length }));
  const active = S.sessions.map(s => s.id);
  if (active.length && !confirm(t('launch.replace'))) return;
  const wanted = M.wantedBy(S.members, L.participants);
  const data = {
    mode: L.mode, status: 'vote', createdBy: S.mid, participants: L.participants,
    chooserId: M.nextChooser(S.members, L.participants, lastChooser()),
    filters: L.f, deckSize: L.deckSize, bracketSize: L.bracketSize,
    pool, bracket: [], round: 0, ranking: [], matches: [], liked: [], yes: {},
    result: null, runnerUp: null, rejected: [], jokers: [], rerollUsed: false, spin: 0,
  };
  if (L.mode === 'swipe') data.pool = M.drawSelection(pool, L.deckSize, wanted);
  if (L.mode === 'duel') {
    data.pool = M.drawSelection(pool, L.bracketSize, wanted);
    data.bracket = M.makeBracket(data.pool);
  }
  if (L.mode === 'roulette') Object.assign(data, { status: 'result', result: M.rouletteDraw(pool, [], wantCount(data)), spin: 1 });
  S.openSession = await S.db.startSession(S.gid, data, active);
  S.launch = null;
  render();
}

// ---------- Soirée en cours ----------

function sessionView(s) {
  const body = s.status === 'vote' ? (s.mode === 'swipe' ? swipeView(s) : duelView(s)) : resultView(s);
  return `<div class="session-head"><button class="link" data-act="close-session">‹ ${t('back')}</button>
      <span>${MODE_ICON[s.mode]} ${t('mode.' + s.mode)}</span></div>
    <p class="muted small center">${t('session.chooser', { name: who(s.chooserId) })}</p>
    ${body}
    ${s.createdBy === S.mid ? `<button class="link danger center-block" data-act="session-cancel">${t('session.cancel')}</button>` : ''}`;
}

const isParticipant = s => s.participants.includes(S.mid);
const nextCard = s => s.pool.find(id => !(id in (S.votes[S.mid]?.swipe || {})));

function swipeView(s) {
  const v = S.votes[S.mid] || {};
  const count = Object.keys(v.swipe || {}).length;
  const done = s.participants.filter(m => S.votes[m]?.swipeDone).length;
  const next = nextCard(s);
  let body;
  if (!isParticipant(s)) body = `<p class="center muted">${t('session.spectator')}</p>`;
  else if (next && !v.swipeDone) {
    const x = title(next);
    body = `<div class="swipe-zone"><div class="swipe-card" data-id="${esc(next)}">${poster(x, 'w780')}
        <div class="swipe-info"><b>${esc(nameOf(x))}</b><span>${meta(x)}</span></div>
        <div class="stamp yes">♥</div><div class="stamp no">✕</div></div></div>
      <div class="swipe-buttons">
        <button class="round no" data-act="swipe" data-v="0" aria-label="${t('swipe.no')}">✕</button>
        <button class="round info" data-act="open" data-id="${esc(next)}" aria-label="${t('swipe.info')}">i</button>
        <button class="round yes" data-act="swipe" data-v="1" aria-label="${t('swipe.yes')}">♥</button></div>`;
  } else body = `<p class="center big-text">🎉 ${t('swipe.finished')}</p>`;
  return `<p class="progress">${isParticipant(s) ? t('swipe.progress', { n: Math.min(count, s.pool.length), total: s.pool.length }) + ' · ' : ''}${t('swipe.done', { n: done, total: s.participants.length })}</p>
    ${body}
    ${s.createdBy === S.mid ? `<button class="btn center-block" data-act="swipe-force">${t('swipe.force')}</button>` : ''}`;
}

const roundName = n => t({ 1: 'duel.final', 2: 'duel.semi', 4: 'duel.quarter', 8: 'duel.eighth' }[n] || 'duel.round');

function duelView(s) {
  const r = s.round;
  const duels = s.bracket[r].duels;
  const mine = S.votes[S.mid]?.duel?.[r] || {};
  const voted = s.participants.filter(m => M.hasVotedRound(S.votes[m], r, duels.length)).length;
  const pick = (i, id) => `<div class="duel-pick ${mine[i] === id ? 'on' : ''}">
    <button class="duel-vote" data-act="duel-vote" data-i="${i}" data-id="${esc(id)}" ${isParticipant(s) ? '' : 'disabled'}>${poster(title(id))}<span>${esc(nameOf(title(id)))}</span></button>
    <button class="mini-info" data-act="open" data-id="${esc(id)}" aria-label="${t('swipe.info')}">i</button></div>`;
  return `<p class="progress">${roundName(duels.length)} · ${t('duel.voted', { n: voted, total: s.participants.length })}</p>
    ${duels.map((d, i) => `<div class="duel">${pick(i, d.a)}<span class="vs">VS</span>${pick(i, d.b)}</div>`).join('')}
    ${s.createdBy === S.mid ? `<button class="btn center-block" data-act="duel-force">${t('duel.force')}</button>` : ''}`;
}

const needsSpin = s => !reducedMotion && s.spin > 0 && s.result && S.spun[s.id] !== s.spin;

function resultView(s) {
  if (needsSpin(s)) {
    const pool = s.pool.filter(id => id === s.result || !(s.rejected || []).includes(id));
    const strip = M.rouletteStrip(pool, s.result, `${s.id}:${s.spin}`);
    return `<div class="spin" data-session="${esc(s.id)}" data-spin="${s.spin}"><div class="spin-strip">${strip.map(id => `<div class="spin-item">${poster(title(id))}</div>`).join('')}</div></div>`;
  }
  if (!s.result) return s.mode === 'swipe' ? swipeChoiceView(s) : `<p class="center">${t('result.none')}</p>`;
  const x = title(s.result);
  const canJoker = isParticipant(s) && M.hasJoker(me());
  const canReroll = s.mode === 'roulette' && s.chooserId === S.mid && !s.rerollUsed;
  const jokers = (s.jokers || []).map(j => `${member(j.memberId)?.emoji || '🃏'} ${esc(nameOf(title(j.titleId)))}`).join(', ');
  return `<section class="result">
    <p class="eyebrow">${t('result.tonight')}</p>
    <button class="result-poster" data-act="open" data-id="${esc(x.id)}">${poster(x, 'w780')}</button>
    <h2>${esc(nameOf(x))}</h2>
    <p class="muted">${meta(x)}</p>
    <div class="chips wrap center">${moodChips(x)}</div>
    ${isParticipant(s) ? `<button class="btn primary big" data-act="validate">${t('result.watch')}</button>` : ''}
    ${canReroll ? `<button class="btn" data-act="reroll">🎲 ${t('result.reroll')}</button>` : ''}
    ${canJoker ? `<button class="btn joker" data-act="joker">🃏 ${t('result.joker')}</button>` : ''}
    ${jokers ? `<p class="muted small">${t('result.rejected')} ${jokers}</p>` : ''}
  </section>`;
}

function swipeChoiceView(s) {
  const rejected = s.rejected || [];
  const matches = s.matches.filter(id => !rejected.includes(id));
  if (matches.length > 1) {
    const mine = M.deciderOf(s) === S.mid;
    return `<h2 class="center">💘 ${t('swipe.matches', { n: matches.length })}</h2>
      <p class="muted center">${mine ? t('swipe.youDecide') : t('swipe.decides', { name: who(M.deciderOf(s)) })}</p>
      <div class="grid">${matches.map(id => card(title(id), mine ? 'pick' : 'open')).join('')}</div>
      ${mine ? `<div class="row"><button class="btn" data-act="tiebreak">⚔️ ${t('swipe.duel')}</button><button class="btn" data-act="pick-random">🎲 ${t('swipe.random')}</button></div>` : ''}`;
  }
  const liked = s.liked.filter(id => !rejected.includes(id));
  const ranking = s.ranking.filter(id => !rejected.includes(id)).slice(0, 10);
  return `<h2 class="center">${t('swipe.noMatch')}</h2>
    <ol class="ranking">${ranking.map(id => `<li><button class="link" data-act="open" data-id="${esc(id)}">${esc(nameOf(title(id)))}</button><b>${s.yes[id] || 0} ♥</b></li>`).join('')}</ol>
    ${isParticipant(s) ? `<div class="row">${liked.length ? `<button class="btn" data-act="liked-roulette">🎡 ${t('swipe.roulette', { n: liked.length })}</button>` : ''}
      <button class="btn primary" data-act="new-deck">${t('swipe.newDeck')}</button></div>` : ''}`;
}

// Animation de Roulette : la bande défile ~3 s et s'arrête sur le résultat enregistré
function animateSpin() {
  const box = $('.spin');
  const strip = box.firstElementChild;
  const items = strip.children;
  const step = items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
  S.busy = true;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    strip.style.transform = `translateX(${-step * (items.length - 1)}px)`;
  }));
  setTimeout(() => {
    S.spun[box.dataset.session] = +box.dataset.spin;
    S.busy = false;
    render();
  }, 3300);
}

// Fermetures de vote : chaque appareil participant essaie, la transaction garantit qu'une seule passe
async function runOnce(key, fn) {
  if (S.running.has(key)) return;
  S.running.add(key);
  try { await fn(); } catch { toast(t('error.generic')); } finally { S.running.delete(key); }
}

const closeSwipe = s => runOnce(`${s.id}:swipe`, () => S.db.transact(S.gid, s.id, (cur, votes) => {
  if (cur.status !== 'vote' || cur.mode !== 'swipe') return null;
  const o = M.swipeOutcome(cur.pool, votes, cur.participants, wantCount(cur));
  return { status: 'result', ranking: o.ranking, matches: o.matches, liked: o.liked, yes: o.yes, result: o.result };
}));

const closeDuelRound = s => runOnce(`${s.id}:duel:${s.round}`, () => S.db.transact(S.gid, s.id, (cur, votes) => {
  if (cur.status !== 'vote' || cur.mode !== 'duel' || cur.round !== s.round) return null;
  const o = M.closeRound(cur.bracket, cur.round, votes, cur.participants, wantCount(cur));
  return o.done ? { bracket: o.bracket, status: 'result', result: o.result, runnerUp: o.runnerUp } : { bracket: o.bracket, round: o.round };
}));

function checkProgress() {
  const s = activeSession();
  if (!s || s.status !== 'vote' || !isParticipant(s) || S.votesFor !== s.id) return;
  if (s.mode === 'swipe' && s.participants.every(m => S.votes[m]?.swipeDone)) closeSwipe(s);
  if (s.mode === 'duel' && s.participants.every(m => M.hasVotedRound(S.votes[m], s.round, s.bracket[s.round].duels.length))) closeDuelRound(s);
}

async function swipe(yes) {
  const s = activeSession();
  const id = s && nextCard(s);
  if (!id) return;
  const v = S.votes[S.mid] || {};
  const swipes = { ...(v.swipe || {}), [id]: yes };
  const done = s.pool.every(x => x in swipes);
  S.votes = { ...S.votes, [S.mid]: { ...v, swipe: swipes, swipeDone: done } };
  render();
  await S.db.vote(S.gid, s.id, S.mid, done ? { swipe: { [id]: yes }, swipeDone: true } : { swipe: { [id]: yes } });
}

async function duelVote(i, id) {
  const s = activeSession();
  const r = s.round;
  const v = S.votes[S.mid] || {};
  S.votes = { ...S.votes, [S.mid]: { ...v, duel: { ...(v.duel || {}), [r]: { ...(v.duel?.[r] || {}), [i]: id } } } };
  render();
  await S.db.vote(S.gid, s.id, S.mid, { duel: { [r]: { [i]: id } } });
}

// Glisser la carte du Swipe : 100 px vers la droite = oui, vers la gauche = non, simple appui = fiche
function startDrag(el, e) {
  const x0 = e.clientX;
  let dx = 0;
  S.busy = true;
  el.classList.add('dragging');
  el.setPointerCapture(e.pointerId);
  const move = ev => {
    dx = ev.clientX - x0;
    el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
    el.classList.toggle('yes', dx > 40);
    el.classList.toggle('no', dx < -40);
  };
  const end = () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', end);
    el.removeEventListener('pointercancel', end);
    S.busy = false;
    el.classList.remove('dragging');
    if (Math.abs(dx) >= 100) {
      el.style.transform = `translateX(${Math.sign(dx) * 150}%) rotate(${Math.sign(dx) * 20}deg)`;
      setTimeout(() => safely(() => swipe(dx > 0)), reducedMotion ? 0 : 180);
    } else if (Math.abs(dx) < 6) {
      openTitle(el.dataset.id);
    } else {
      el.style.transform = '';
      el.classList.remove('yes', 'no');
      if (S.pending) render();
    }
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

// ---------- Onglet Catalogue ----------

const CHIPS = {
  all: () => true,
  trouvailles: x => x.collection === 'trouvailles',
  classiques: x => x.collection === 'classiques',
  monde: x => x.collection === 'monde',
  niches: x => x.collection === 'niches',
  courts: x => x.short,
  culture: x => x.collection === 'culture',
  series: x => x.type === 'serie',
  ajouts: x => x.collection === 'ajouts',
  soon: (x, c) => M.isSoon(x, c.today),
  wants: (x, c) => c.wants.has(x.id),
};

const SORTS = {
  random: (a, b) => rankOf(a.id) - rankOf(b.id),
  year: (a, b) => (b.year || 0) - (a.year || 0),
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  recent: (a, b) => ms(b.addedAt) - ms(a.addedAt) || (b.year || 0) - (a.year || 0),
};

function catalogueList() {
  const { chip: c, q, f, sort } = S.cat;
  const ctx = { wants: groupWants(), hidden: hiddenSet(), seen: mySeen(), today: M.todayISO() };
  const query = M.normalize(q.trim());
  return allTitles()
    .filter(x =>
      (f.status === 'hidden') === ctx.hidden.has(x.id) &&
      (f.status !== 'unseen' || !ctx.seen.has(x.id)) &&
      (f.status !== 'seen' || ctx.seen.has(x.id)) &&
      CHIPS[c](x, ctx) &&
      (!f.type || M.kindOf(x) === f.type) &&
      (!f.collection || x.collection === f.collection) &&
      (!f.moods.length || moodsOf(x).some(m => f.moods.includes(m))) &&
      (!f.region || x.region === f.region) &&
      (!f.decade || M.decadeOf(x.year) === +f.decade) &&
      (!f.maxRuntime || !x.runtime || x.runtime <= +f.maxRuntime) &&
      (!query || searchKey(x).includes(query)))
    .sort(SORTS[sort]);
}

const filterCount = () => Object.entries(S.cat.f).filter(([k, v]) => (k === 'status' ? v !== 'all' : v.length)).length;

function catalogueView() {
  const chips = Object.keys(CHIPS).filter(c => inGroup() || !['ajouts', 'wants'].includes(c));
  const n = filterCount();
  return `<div class="cat-bar">
      <div class="chips scroll">${chips.map(c => chip(t('chips.' + c), S.cat.chip === c, 'cat-chip', c)).join('')}</div>
      <div class="cat-tools">
        <input type="search" class="search" placeholder="${t('cat.search')}" value="${esc(S.cat.q)}" data-input="cat-search" aria-label="${t('cat.search')}">
        <button class="icon-btn ${n ? 'on' : ''}" data-act="filters-open" aria-label="${t('cat.filters')}">⚙️${n ? `<i>${n}</i>` : ''}</button>
        <button class="icon-btn" data-act="dice" aria-label="${t('cat.dice')}">🎲</button>
      </div></div>
    <div class="grid" id="grid">${gridHtml()}</div>
    ${inGroup() ? `<button class="fab" data-act="add-open" aria-label="${t('add.title')}">+</button>` : ''}`;
}

function gridHtml() {
  if (!S.loaded) return '<div class="card skeleton"><span class="poster"></span></div>'.repeat(12);
  const list = catalogueList();
  if (!list.length) return `<div class="empty">${t('cat.empty')}<button class="btn" data-act="cat-reset">${t('cat.reset')}</button></div>`;
  return `<p class="count">${t('cat.count', { n: list.length })}</p>${list.map(x => card(x)).join('')}`;
}

function filtersSheet() {
  const f = S.cat.f;
  const select = (name, list, label, value = f[name]) => `<label>${t('filters.' + name)}
    <select data-change="cat-filter" name="${name}"><option value="">${t('allOption')}</option>${options(list, value, label)}</select></label>`;
  return sheetWrap(`<h2>${t('cat.filters')}</h2>
    <div class="form">
      ${select('type', ['film', 'serie', 'court'], k => t('types.' + k))}
      ${select('collection', M.COLLECTIONS, c => t('collections.' + c))}
      <p class="label">${t('filters.moods')}</p>
      <div class="chips wrap">${M.MOODS.map(m => chip(moodLabel(m), f.moods.includes(m), 'cat-mood', m)).join('')}</div>
      ${select('region', M.REGIONS, r => t('regions.' + r))}
      ${select('decade', decades(), decadeText)}
      ${select('maxRuntime', [60, 90, 120, 150, 180], runtimeText)}
      <label>${t('filters.status')}<select data-change="cat-filter" name="status">${options(['all', 'unseen', 'seen', 'hidden'], f.status, s => t('status.' + s))}</select></label>
      <label>${t('cat.sort')}<select data-change="cat-sort">${options(Object.keys(SORTS), S.cat.sort, s => t('sort.' + s))}</select></label>
      <div class="row"><button class="btn" data-act="cat-reset">${t('cat.reset')}</button>
        <button class="btn primary" data-act="close-sheet">${t('cat.show', { n: catalogueList().length })}</button></div>
    </div>`);
}

// ---------- Fiche d'un titre ----------

function titleSheet() {
  const x = title(S.sheet.id);
  const m = me();
  const wanted = (m?.wants || []).includes(x.id);
  const seen = (m?.seen || []).includes(x.id);
  const hidden = hiddenSet().has(x.id);
  const length = x.type === 'serie'
    ? [t('fiche.seasons', { n: x.seasons || '?' }), x.runtime ? t('fiche.episode', { d: runtimeText(x.runtime) }) : ''].filter(Boolean).join(' · ')
    : runtimeText(x.runtime);
  const facts = [x.originalTitle && x.originalTitle !== nameOf(x) ? `<i>${esc(x.originalTitle)}</i>` : '', x.year, length, x.rating ? `★ ${num(x.rating)} TMDB` : '']
    .filter(Boolean).join(' · ');
  const countries = (x.countries || []).map(c => `${flag(c)} ${esc(countryName(c))}`).join(', ');
  const genres = (x.genres || []).map(g => t('genres')[g]).filter(Boolean).join(', ');
  const faces = list => list.map(p => `<span title="${esc(p.name)}">${p.emoji}</span>`).join(' ') || '—';
  return sheetWrap(`<div class="fiche-poster">${poster(x, 'w780')}</div>
    <h2>${esc(nameOf(x))}</h2>
    <p class="muted">${facts}</p>
    <div class="chips wrap">${badges(x)}</div>
    ${countries ? `<p>${countries}${x.region ? ` · <span class="muted">${t('regions.' + x.region)}</span>` : ''}</p>` : ''}
    ${genres ? `<p class="muted small">${esc(genres)}</p>` : ''}
    <div class="chips wrap">${moodChips(x)}${inGroup() ? `<button class="chip ghost" data-act="moods-edit">✏️ ${t('fiche.editMoods')}</button>` : ''}</div>
    ${S.sheet.moods ? moodEditor() : ''}
    ${overviewOf(x) ? `<p class="overview">${esc(overviewOf(x))}</p>` : ''}
    ${inGroup() ? `<p class="people">❤️ ${faces(S.members.filter(p => (p.wants || []).includes(x.id)))} &nbsp; 👁 ${faces(S.members.filter(p => (p.seen || []).includes(x.id)))}</p>
      <div class="actions">
        <button class="btn ${wanted ? 'on' : ''}" data-act="toggle-want" aria-pressed="${wanted}">❤️ ${t('fiche.want')}</button>
        <button class="btn ${seen ? 'on' : ''}" data-act="toggle-seen" aria-pressed="${seen}">👁 ${t('fiche.seen')}</button>
        <button class="btn" data-act="toggle-hidden">🙈 ${t(hidden ? 'fiche.unhide' : 'fiche.hide')}</button>
      </div>` : ''}
    ${providersView(x)}`);
}

const moodEditor = () => `<div class="mood-editor"><p class="label">${t('fiche.moodsHelp')}</p>
  <div class="chips wrap">${M.MOODS.map(m => chip(moodLabel(m), S.sheet.moods.includes(m), 'moods-toggle', m)).join('')}</div>
  <div class="row"><button class="btn small" data-act="moods-reset">${t('fiche.moodsAuto')}</button><button class="btn small primary" data-act="moods-save">${t('save')}</button></div></div>`;

// « Où le voir » (V2) : logos des plateformes, sans aucun lien. Données JustWatch via TMDB.
function providersView(x) {
  if (!tmdbKey || !x.tmdbId) return '';
  const key = `${x.tmdbType}/${x.tmdbId}/${country()}`;
  const data = S.providers[key];
  if (data === undefined) loadProviders(x, key);
  if (!data || data === 'loading') return `<section class="providers"><h3>${t('providers.title', { country: esc(countryName(country())) })}</h3><p class="muted small">${t('loading')}</p></section>`;
  const unique = list => [...new Map(list.map(p => [p.provider_id, p])).values()];
  const row = (label, list) => (list.length ? `<p class="label">${label}</p><div class="logos">${list.map(p =>
    `<span class="logo-item"><img src="${IMG}w92${p.logo_path}" alt="" loading="lazy"><small>${esc(p.provider_name)}</small></span>`).join('')}</div>` : '');
  const stream = unique([...(data.flatrate || []), ...(data.free || []), ...(data.ads || [])]);
  const buy = unique([...(data.rent || []), ...(data.buy || [])]);
  return `<section class="providers"><h3>${t('providers.title', { country: esc(countryName(country())) })}</h3>
    ${stream.length || buy.length ? row(t('providers.stream'), stream) + row(t('providers.buy'), buy) : `<p class="muted small">${t('providers.none')}</p>`}
    <p class="muted tiny">${t('providers.credit')}</p></section>`;
}

async function loadProviders(x, key) {
  S.providers[key] = 'loading';
  try {
    const data = await tmdbGet(`/${x.tmdbType}/${x.tmdbId}/watch/providers`);
    S.providers[key] = data.results?.[key.split('/')[2]] || {};
  } catch {
    S.providers[key] = {};
  }
  render();
}

// ---------- Ajouter un titre ----------

async function tmdbGet(path, params = {}) {
  const res = await fetch(`https://api.themoviedb.org/3${path}?${new URLSearchParams({ api_key: tmdbKey, ...params })}`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

function addSheet() {
  const A = S.sheet;
  return sheetWrap(`<h2>${t('add.title')}</h2>
    ${tmdbKey ? `<input type="search" class="search" data-input="tmdb-search" placeholder="${t('add.search')}" value="${esc(A.q || '')}" aria-label="${t('add.search')}">
      <div id="tmdb-results">${tmdbResults()}</div>` : `<p class="muted">${t('add.noKey')}</p>`}
    <form class="form" data-submit="add-manual"><h3>${t('add.manual')}</h3>
      <p class="muted small">${t('add.manualHelp')}</p>
      <label>${t('add.name')}<input name="title" required maxlength="80"></label>
      <label>${t('add.year')}<input name="year" type="number" required min="1880" max="2100" value="${new Date().getFullYear()}"></label>
      <label>${t('add.type')}<select name="type">${options(['film', 'serie'], 'film', k => t('types.' + k))}</select></label>
      <label class="switch"><input type="checkbox" name="short"><span>${t('types.court')}</span></label>
      <button class="btn primary">${t('add.submit')}</button></form>`);
}

function tmdbResults() {
  const A = S.sheet;
  if (A.searching) return `<p class="muted small">${t('loading')}</p>`;
  if (!A.results) return '';
  if (!A.results.length) return `<p class="muted small">${t('add.noResult')}</p>`;
  return `<ul class="results">${A.results.map(r => {
    const id = (r.media_type === 'movie' ? 'm' : 't') + r.id;
    const date = r.release_date || r.first_air_date || '';
    return `<li><button class="result-item" data-act="add-tmdb" data-kind="${r.media_type}" data-tmdb="${r.id}">
      ${r.poster_path ? `<img src="${IMG}w92${r.poster_path}" alt="" loading="lazy">` : '<span class="noimg">🎬</span>'}
      <span><b>${esc(r.title || r.name)}</b><br><small class="muted">${date.slice(0, 4)} · ${t(r.media_type === 'movie' ? 'types.film' : 'types.serie')}${byId.has(id) ? ' · ✓ ' + t('add.already') : ''}</small></span>
    </button></li>`;
  }).join('')}</ul>`;
}

let searchTimer;
function searchTmdb(q) {
  S.sheet.q = q;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    if (!q.trim()) S.sheet.results = null;
    else {
      try {
        const data = await tmdbGet('/search/multi', { query: q, language: TMDB_LANG[lang], include_adult: 'false' });
        if (S.sheet?.type !== 'add' || S.sheet.q !== q) return;
        S.sheet.results = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 20);
      } catch {
        toast(t('error.network'));
      }
    }
    if ($('#tmdb-results')) $('#tmdb-results').innerHTML = tmdbResults();
  }, 350);
}

async function addFromTmdb(kind, tmdbId) {
  const id = (kind === 'movie' ? 'm' : 't') + tmdbId;
  if (byId.has(id)) {
    toast(t('add.exists'));
    return openTitle(id);
  }
  const details = {};
  for (const l of LANGS) details[l] = await tmdbGet(`/${kind}/${tmdbId}`, { language: TMDB_LANG[l] });
  await saveNewTitle(M.tmdbEntry(kind, details.fr, details.en, details.ru));
}

async function saveNewTitle(entry) {
  if (byId.has(entry.id)) {
    toast(t('add.exists'));
    return openTitle(entry.id);
  }
  await S.db.addTitle(S.gid, S.mid, entry);
  toast(t('add.added'));
  openTitle(entry.id);
}

// ---------- Onglet Historique ----------

const needsMyRating = e => e.participants.includes(S.mid) && e.status === 'vu' && !e.ratings?.[S.mid];

function historyView() {
  if (!inGroup()) return `<p class="empty">${t('history.noGroup')}</p>`;
  const list = [...S.history].sort((a, b) => needsMyRating(b) - needsMyRating(a) || ms(b.date) - ms(a.date));
  if (!list.length) return `<div class="empty">${t('history.empty')}<button class="btn primary" data-act="tab" data-tab="tonight">${t('launch.open')}</button></div>`;
  return statsView() + list.map(entryView).join('');
}

function entryView(e) {
  const x = title(e.titleId);
  const avg = M.entryAverage(e);
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const lines = e.participants.map(m => `<li>${who(m)} <span class="stars">${e.ratings?.[m] ? stars(e.ratings[m]) : `<span class="muted">${t('history.notRated')}</span>`}</span>
    ${e.comments?.[m] ? `<q>${esc(e.comments[m])}</q>` : ''}</li>`).join('');
  const mine = e.participants.includes(S.mid) ? `<div class="rate"><span>${t('history.yourRating')}</span>${[1, 2, 3, 4, 5].map(n =>
    `<button class="star ${n <= (e.ratings?.[S.mid] || 0) ? 'on' : ''}" data-act="rate" data-id="${esc(e.id)}" data-n="${n}" aria-label="${n}/5">★</button>`).join('')}</div>
    <form class="comment" data-submit="comment" data-id="${esc(e.id)}"><input name="c" maxlength="140" value="${esc(e.comments?.[S.mid] || '')}" placeholder="${t('history.comment')}" aria-label="${t('history.comment')}"><button class="btn small">OK</button></form>` : '';
  return `<article class="entry ${needsMyRating(e) ? 'todo' : ''}">
    <button class="thumb" data-act="open" data-id="${esc(x.id)}">${poster(x, 'w154')}</button>
    <div class="entry-body">
      <h3>${esc(nameOf(x))}</h3>
      <p class="muted small">${dateText(e.date)} · ${MODE_ICON[e.mode] || ''} ${t('mode.' + e.mode)} · ${t('history.chosenBy', { name: who(e.chooserId) })}</p>
      ${e.status === 'en-cours' ? `<p><span class="badge">${t('history.ongoing')}</span> <button class="link" data-act="series-done" data-id="${esc(e.id)}">${t('history.seriesDone')}</button></p>` : ''}
      <ul class="ratings">${lines}</ul>
      ${avg !== null ? `<p class="avg">${t('history.average')} ★ ${num(avg)}</p>` : ''}
      ${mine}
      <button class="link danger" data-act="entry-delete" data-id="${esc(e.id)}">${t('history.delete')}</button>
    </div></article>`;
}

// Statistiques du groupe (V2)
function statsView() {
  const st = M.groupStats(S.history, id => byId.get(id), moodsOf, S.members);
  return `<details class="stats" ${S.statsOpen ? 'open' : ''}><summary data-act="stats-toggle">📊 ${t('stats.title')}</summary>
    <p>${t('stats.watched')} <b>${st.watched}</b></p>
    <p>${t('stats.average')} <b>${st.average !== null ? '★ ' + num(st.average) : '—'}</b></p>
    ${st.moods.length ? `<p>${t('stats.moods')} ${st.moods.map(([m, n]) => `${moodLabel(m)} (${n})`).join(' · ')}</p>` : ''}
    ${st.regions.length ? `<p>${t('stats.regions')} ${st.regions.map(([r, n]) => `${t('regions.' + r)} (${n})`).join(' · ')}</p>` : ''}
    ${st.choosers.length ? `<p>${t('stats.choosers')}</p><ol>${st.choosers.map(c => `<li>${who(c.id)} — ★ ${num(c.average)} <span class="muted">(${c.count})</span></li>`).join('')}</ol>` : ''}
  </details>`;
}

// ---------- Onglet Groupe ----------

function groupView() {
  const settings = `<section><h3>${t('settings.title')}</h3>
    <label>${t('settings.lang')}<select data-change="lang">${options(LANGS, lang, l => t('langs.' + l))}</select></label>
    ${tmdbKey ? `<label>${t('settings.country')}<select data-change="country">${options(WATCH_COUNTRIES, country(), c => `${flag(c)} ${countryName(c)}`)}</select></label>` : ''}
  </section>`;
  const about = `<section class="about"><h3>${t('about.title')}</h3>
    <p>${t('about.text')}</p>
    <p class="tmdb"><b>TMDB</b> — This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    <p class="muted small">${t('about.justwatch')}</p></section>`;
  if (!S.db || !S.gid) return (S.dbState === 'ready' ? welcomeView() : '') + settings + about;
  const m = me();
  if (!m || !S.group) return `<p class="center muted">${t('loading')}</p>`;
  const list = ordered();
  return `<section><h2>${esc(S.group.name)}</h2>
      <ul class="members">${list.map((x, i) => `<li>
        <span class="emoji">${x.emoji}</span>
        <span class="name">${esc(x.name)}${x.id === S.mid ? ` <small class="muted">(${t('group.you')})</small>` : ''}<br>
          <small class="${M.hasJoker(x) ? 'ok' : 'muted'}">🃏 ${t(M.hasJoker(x) ? 'group.jokerYes' : 'group.jokerNo')}</small></span>
        <button class="icon" data-act="member-move" data-id="${esc(x.id)}" data-v="-1" ${i ? '' : 'disabled'} aria-label="${t('group.up')}">↑</button>
        <button class="icon" data-act="member-move" data-id="${esc(x.id)}" data-v="1" ${i < list.length - 1 ? '' : 'disabled'} aria-label="${t('group.down')}">↓</button>
        ${x.id !== S.mid ? `<button class="icon danger" data-act="member-remove" data-id="${esc(x.id)}" aria-label="${t('group.remove')}">✕</button>` : ''}
      </li>`).join('')}</ul>
      <p class="muted small">${t('group.orderHelp')}</p>
      <button class="btn primary" data-act="invite">📨 ${t('group.invite')}</button>
    </section>
    <section><h3>${t('group.settings')}</h3>
      <form class="form" data-submit="rename-group"><label>${t('group.name')}<input name="name" value="${esc(S.group.name)}" required maxlength="40"></label>
      <button class="btn small">${t('save')}</button></form></section>
    <section><h3>${t('group.profile')}</h3>
      <form class="form" data-submit="profile"><label>${t('form.yourName')}<input name="name" value="${esc(m.name)}" required maxlength="20"></label>
      ${emojiPicker(m.emoji)}<button class="btn small">${t('save')}</button></form></section>
    ${settings}
    <section><h3>${t('backup.title')}</h3><p class="muted small">${t('backup.help')}</p>
      <div class="row"><button class="btn" data-act="export">⬇️ ${t('backup.export')}</button>
      <label class="btn">⬆️ ${t('backup.import')}<input type="file" accept="application/json,.json" data-change="import" hidden></label></div></section>
    <section><h3>${t('group.mine')}</h3>
      <ul class="my-groups">${S.groups.map(g => `<li>${g.groupId === S.gid ? '✅' : `<button class="link" data-act="switch-group" data-id="${esc(g.groupId)}">↪</button>`} ${esc(g.name || '…')}</li>`).join('')}</ul>
      <div class="row"><button class="btn" data-act="create-open">➕ ${t('welcome.create')}</button><button class="btn" data-act="link-open">🔗 ${t('welcome.haveLink')}</button></div>
      <button class="link danger" data-act="leave-group">${t('group.leave')}</button></section>
    ${about}`;
}

const createSheet = () => sheetWrap(`<h2>${t('welcome.create')}</h2>
  <form class="form" data-submit="create-group">
    <label>${t('create.groupName')}<input name="group" required maxlength="40" placeholder="${t('create.placeholder')}"></label>
    <label>${t('form.yourName')}<input name="name" required maxlength="20" autocomplete="given-name"></label>
    ${emojiPicker(EMOJIS[0])}
    <button class="btn primary big">${t('create.submit')}</button></form>`);

const linkSheet = () => sheetWrap(`<h2>${t('welcome.haveLink')}</h2>
  <form class="form" data-submit="open-link">
    <label>${t('link.label')}<input name="link" required placeholder="https://…/#join=…"></label>
    <button class="btn primary big">${t('link.submit')}</button></form>`);

const VIEWS = { tonight: tonightView, catalogue: catalogueView, history: historyView, group: groupView };
const SHEETS = { title: titleSheet, filters: filtersSheet, add: addSheet, create: createSheet, link: linkSheet };

// ---------- Groupes : sélection, création, invitation ----------

const saveGroups = () => store.set('kino.groups', S.groups);

function selectGroup(gid) {
  S.stopGroup?.();
  S.stopVotes?.();
  Object.assign(S, {
    gid, mid: S.groups.find(g => g.groupId === gid)?.memberId || null,
    group: null, members: [], added: [], sessions: [], history: [], votes: {}, votesFor: null,
    stopGroup: null, stopVotes: null, openSession: null, launch: null,
  });
  store.set('kino.currentGroup', gid);
  reindex();
  if (gid) {
    S.stopGroup = S.db.listenGroup(gid, {
      group: g => {
        S.group = g;
        const saved = S.groups.find(x => x.groupId === gid);
        if (g && saved && saved.name !== g.name) {
          saved.name = g.name;
          saveGroups();
        }
        render();
      },
      members: (list, fromCache) => {
        S.members = list;
        if (!fromCache && !me()) return removedFromGroup();
        checkProgress();
        render();
      },
      titles: list => {
        S.added = list;
        reindex();
        render();
      },
      sessions: list => {
        S.sessions = list;
        watchVotes();
        checkProgress();
        render();
      },
      history: list => {
        S.history = list;
        render();
      },
      error: () => toast(t('error.network')),
    });
  }
  render();
}

function watchVotes() {
  const s = activeSession();
  if ((s?.id || null) === S.votesFor) return;
  S.stopVotes?.();
  S.votes = {};
  S.votesFor = s?.id || null;
  S.stopVotes = s ? S.db.listenVotes(S.gid, s.id, v => {
    S.votes = v;
    checkProgress();
    render();
  }) : null;
}

function removedFromGroup() {
  toast(t('group.removed'));
  S.groups = S.groups.filter(g => g.groupId !== S.gid);
  saveGroups();
  selectGroup(S.groups[0]?.groupId || null);
}

async function startJoin(gid) {
  if (S.groups.some(g => g.groupId === gid)) {
    S.tab = 'tonight';
    return selectGroup(gid);
  }
  S.join = { gid, loading: true };
  S.tab = 'tonight';
  render();
  const info = await S.db.loadGroup(gid).catch(() => null);
  S.join = info ? { gid, ...info } : { gid, invalid: true };
  render();
}

function finishJoin(memberId) {
  const { gid, name } = S.join;
  S.groups.push({ groupId: gid, memberId, name });
  saveGroups();
  S.join = null;
  selectGroup(gid);
}

async function invite() {
  const url = `${location.origin}${location.pathname}#join=${S.gid}`;
  if (navigator.share) {
    try {
      return await navigator.share({ title: 'Kino', text: t('group.inviteText', { name: S.group.name }), url });
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast(t('group.copied'));
  } catch {
    prompt(t('group.copyThis'), url);
  }
}

function readJoinHash() {
  const m = location.hash.match(/join=([\w-]+)/);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  if (S.dbState === 'ready') startJoin(m[1]);
  else S.pendingJoin = m[1];
}

async function exportData() {
  const data = await S.db.exportGroup(S.gid);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = `kino-${M.slug(S.group.name) || 'groupe'}-${M.todayISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importData(file) {
  const data = JSON.parse(await file.text());
  if (data.kino !== 1 || !data.group) return toast(t('backup.invalid'));
  if (!confirm(t('backup.confirm', { name: S.group.name }))) return;
  await S.db.importGroup(S.gid, data);
  toast(t('backup.done'));
}

// ---------- Actions ----------

const sessionNow = () => activeSession();
const setLaunchFilter = patch => {
  Object.assign(S.launch.f, patch);
  render();
};
const toggleIn = (list, v) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v]);

const ACTIONS = {
  tab: el => {
    S.scroll[S.tab] = scrollY;
    const same = S.tab === el.dataset.tab;
    S.tab = el.dataset.tab;
    render();
    scrollTo(0, same ? 0 : S.scroll[S.tab] || 0);
  },
  open: el => openTitle(el.dataset.id),
  'close-sheet': closeSheet,

  // Catalogue
  'cat-chip': el => {
    S.cat.chip = el.dataset.v;
    render();
  },
  'filters-open': () => openSheet({ type: 'filters' }),
  'cat-mood': el => {
    S.cat.f.moods = toggleIn(S.cat.f.moods, el.dataset.v);
    render();
  },
  'cat-reset': () => {
    S.cat = { ...S.cat, chip: 'all', q: '', f: emptyCatFilters() };
    render();
  },
  dice: () => {
    const list = catalogueList();
    if (list.length) openTitle(list[Math.floor(Math.random() * list.length)].id);
  },
  'add-open': () => openSheet({ type: 'add' }),
  'add-tmdb': el => addFromTmdb(el.dataset.kind, +el.dataset.tmdb),

  // Fiche
  'toggle-want': () => S.db.toggleMine(S.gid, S.mid, 'wants', S.sheet.id, !(me().wants || []).includes(S.sheet.id)),
  'toggle-seen': () => S.db.toggleMine(S.gid, S.mid, 'seen', S.sheet.id, !(me().seen || []).includes(S.sheet.id)),
  'toggle-hidden': () => S.db.toggleHidden(S.gid, S.sheet.id, !hiddenSet().has(S.sheet.id)),
  'moods-edit': () => {
    S.sheet.moods = S.sheet.moods ? null : [...moodsOf(title(S.sheet.id))];
    render();
  },
  'moods-toggle': el => {
    S.sheet.moods = toggleIn(S.sheet.moods, el.dataset.v);
    render();
  },
  'moods-save': async () => {
    await S.db.setMoods(S.gid, S.sheet.id, M.MOODS.filter(m => S.sheet.moods.includes(m)));
    S.sheet.moods = null;
    render();
  },
  'moods-reset': async () => {
    await S.db.setMoods(S.gid, S.sheet.id, null);
    S.sheet.moods = null;
    render();
  },

  // Lancement d'une soirée
  'launch-open': openLaunch,
  'launch-cancel': () => {
    S.launch = null;
    render();
  },
  'launch-participant': el => {
    S.launch.participants = ordered().map(m => m.id).filter(id => (id === el.dataset.v) !== S.launch.participants.includes(id));
    render();
  },
  'launch-mode': el => {
    S.launch.mode = el.dataset.v;
    render();
  },
  'launch-size': el => {
    const [key, n] = el.dataset.v.split(':');
    S.launch[key] = +n;
    render();
  },
  'launch-type': el => setLaunchFilter({ types: toggleIn(S.launch.f.types, el.dataset.v) }),
  'launch-mood': el => setLaunchFilter({ moods: toggleIn(S.launch.f.moods, el.dataset.v) }),
  'launch-list': el => {
    const [key, raw] = el.dataset.v.split(':');
    setLaunchFilter({ [key]: toggleIn(S.launch.f[key], key === 'decades' ? +raw : raw) });
  },
  'launch-fold': el => {
    S.launch.fold[el.dataset.v] = !S.launch.fold[el.dataset.v];
    render();
  },
  'launch-go': launch,

  // Soirée
  'open-session': () => {
    S.openSession = sessionNow()?.id || null;
    S.tab = 'tonight';
    render();
    scrollTo(0, 0);
  },
  'close-session': () => {
    S.openSession = null;
    render();
  },
  'session-cancel': async () => {
    if (confirm(t('session.cancelConfirm'))) await S.db.updateSession(S.gid, sessionNow().id, { status: 'cancelled' });
  },
  swipe: el => swipe(el.dataset.v === '1'),
  'swipe-force': () => closeSwipe(sessionNow()),
  'duel-vote': el => duelVote(+el.dataset.i, el.dataset.id),
  'duel-force': () => closeDuelRound(sessionNow()),
  pick: async el => {
    if (confirm(t('swipe.pickConfirm', { name: nameOf(title(el.dataset.id)) }))) await S.db.updateSession(S.gid, sessionNow().id, { result: el.dataset.id });
  },
  'pick-random': async () => {
    const s = sessionNow();
    const matches = s.matches.filter(id => !(s.rejected || []).includes(id));
    await S.db.updateSession(S.gid, s.id, { result: matches[Math.floor(Math.random() * matches.length)] });
  },
  tiebreak: async () => {
    const s = sessionNow();
    const matches = s.matches.filter(id => !(s.rejected || []).includes(id));
    const ids = M.shuffle(M.tieBreakTitles(matches, s.ranking, wantCount(s)));
    await S.db.updateSession(S.gid, s.id, { mode: 'duel', status: 'vote', pool: ids, bracketSize: ids.length, bracket: M.makeBracket(ids), round: 0, result: null, runnerUp: null });
  },
  'liked-roulette': async () => {
    const s = sessionNow();
    const liked = s.liked.filter(id => !(s.rejected || []).includes(id));
    await S.db.updateSession(S.gid, s.id, { mode: 'roulette', pool: liked, result: M.rouletteDraw(liked, [], wantCount(s)), spin: (s.spin || 0) + 1 });
  },
  'new-deck': async () => {
    const s = sessionNow();
    const pool = poolFor(s.filters, s.participants);
    const fresh = pool.filter(id => !s.pool.includes(id));
    const reserve = fresh.length >= s.deckSize ? fresh : pool;
    if (reserve.length < 2) return toast(t('launch.notEnough', { n: reserve.length }));
    const deck = M.drawSelection(reserve, Math.min(s.deckSize, reserve.length), M.wantedBy(S.members, s.participants));
    await S.db.resetVotes(S.gid, s.id, s.participants, { mode: 'swipe', status: 'vote', pool: deck, ranking: [], matches: [], liked: [], yes: {}, result: null });
  },
  reroll: async () => {
    const s = sessionNow();
    const result = M.rouletteDraw(s.pool, [...(s.rejected || []), s.result], wantCount(s));
    if (!result) return toast(t('result.none'));
    await S.db.updateSession(S.gid, s.id, { result, rerollUsed: true, spin: (s.spin || 0) + 1 });
  },
  joker: async () => {
    const s = sessionNow();
    if (!confirm(t('result.jokerConfirm'))) return;
    const ok = await S.db.playJoker(S.gid, s.id, S.mid, M.monthKey(), s.result, cur => M.jokerPatch(cur, S.mid, wantCount(cur)));
    toast(t(ok ? 'result.jokerPlayed' : 'result.changed'));
  },
  validate: async () => {
    const s = sessionNow();
    const x = title(s.result);
    const entry = {
      titleId: s.result, sessionId: s.id, mode: s.mode, chooserId: s.chooserId, participants: s.participants,
      status: x.type === 'serie' ? 'en-cours' : 'vu', ratings: {}, comments: {},
    };
    const ok = await S.db.validate(S.gid, s.id, entry, s.participants.filter(member));
    toast(t(ok ? 'result.enjoy' : 'result.changed'));
  },

  // Historique
  rate: el => S.db.rate(S.gid, el.dataset.id, S.mid, +el.dataset.n),
  'series-done': el => S.db.finishSeries(S.gid, el.dataset.id),
  'entry-delete': async el => {
    const e = S.history.find(x => x.id === el.dataset.id);
    if (confirm(t('history.deleteConfirm'))) await S.db.deleteEntry(S.gid, e, e.participants.filter(member));
  },
  'stats-toggle': (el, ev) => {
    ev.preventDefault();
    S.statsOpen = !S.statsOpen;
    render();
  },

  // Groupe
  invite,
  'member-move': el => {
    const ids = ordered().map(m => m.id);
    const i = ids.indexOf(el.dataset.id);
    const j = i + +el.dataset.v;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    return S.db.reorderMembers(S.gid, ids);
  },
  'member-remove': async el => {
    if (confirm(t('group.removeConfirm', { name: member(el.dataset.id).name }))) await S.db.removeMember(S.gid, el.dataset.id);
  },
  'switch-group': el => selectGroup(el.dataset.id),
  'leave-group': () => {
    if (!confirm(t('group.leaveConfirm', { name: S.group.name }))) return;
    S.groups = S.groups.filter(g => g.groupId !== S.gid);
    saveGroups();
    selectGroup(S.groups[0]?.groupId || null);
  },
  'create-open': () => openSheet({ type: 'create' }),
  'link-open': () => openSheet({ type: 'link' }),
  'join-as': async el => {
    await S.db.updateMember(S.join.gid, el.dataset.id, { uid: S.uid });
    finishJoin(el.dataset.id);
  },
  'join-cancel': () => {
    S.join = null;
    render();
  },
  export: exportData,
};

const CHANGES = {
  'switch-group': el => selectGroup(el.value),
  'cat-filter': el => {
    S.cat.f[el.name] = el.value || (el.name === 'status' ? 'all' : '');
    render();
  },
  'cat-sort': el => {
    S.cat.sort = el.value;
    render();
  },
  lang: el => {
    setLang(el.value);
    render();
  },
  country: el => {
    store.set('kino.country', el.value);
    render();
  },
  import: el => el.files[0] && importData(el.files[0]),
  'launch-toggle': el => setLaunchFilter({ [el.name]: el.checked }),
  'launch-any': el => setLaunchFilter({ maxRuntime: el.checked ? null : 120 }),
  'launch-runtime': el => setLaunchFilter({ maxRuntime: +el.value }),
};

const INPUTS = {
  'cat-search': el => {
    S.cat.q = el.value;
    $('#grid').innerHTML = gridHtml();
  },
  'tmdb-search': el => searchTmdb(el.value),
  'launch-runtime': el => {
    S.launch.f.maxRuntime = +el.value;
    $('#runtime-out').textContent = runtimeText(+el.value);
  },
};

const SUBMITS = {
  'create-group': async d => {
    const { groupId, memberId } = await S.db.createGroup(d.group.trim(), { name: d.name.trim(), emoji: d.emoji || EMOJIS[0] }, S.uid);
    S.groups.push({ groupId, memberId, name: d.group.trim() });
    saveGroups();
    closeSheet();
    S.tab = 'tonight';
    selectGroup(groupId);
  },
  'open-link': d => {
    const gid = (d.link.match(/join=([\w-]+)/) || [, d.link.trim()])[1];
    closeSheet();
    startJoin(gid);
  },
  'join-new': async d => {
    const order = Math.max(-1, ...S.join.members.map(m => m.order)) + 1;
    finishJoin(await S.db.addMember(S.join.gid, { name: d.name.trim(), emoji: d.emoji || EMOJIS[0] }, S.uid, order));
  },
  'rename-group': async d => {
    await S.db.renameGroup(S.gid, d.name.trim());
    toast(t('saved'));
  },
  profile: async d => {
    await S.db.updateMember(S.gid, S.mid, { name: d.name.trim(), emoji: d.emoji || me().emoji });
    toast(t('saved'));
  },
  comment: async (d, form) => {
    await S.db.comment(S.gid, form.dataset.id, S.mid, d.c.trim().slice(0, 140));
    form.querySelector('input').blur();
    toast(t('saved'));
  },
  'add-manual': d => saveNewTitle(M.manualEntry({ title: d.title.trim(), year: +d.year, type: d.type, short: !!d.short })),
};

// Toute erreur (réseau, Firebase, TMDB) finit en message court plutôt qu'en écran bloqué
const safely = fn => Promise.resolve().then(fn).catch(() => toast(t('error.generic')));

function wireEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (el && !el.disabled) safely(() => ACTIONS[el.dataset.act](el, e));
  });
  document.addEventListener('change', e => {
    const el = e.target.closest('[data-change]');
    if (el) safely(() => CHANGES[el.dataset.change](el));
  });
  document.addEventListener('input', e => {
    const el = e.target.closest('[data-input]');
    if (el) INPUTS[el.dataset.input](el);
  });
  document.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    safely(() => SUBMITS[form.dataset.submit](Object.fromEntries(new FormData(form)), form));
  });
  document.addEventListener('pointerdown', e => {
    const el = e.target.closest('.swipe-card');
    if (el && e.button === 0) startDrag(el, e);
  });
  document.addEventListener('focusout', () => setTimeout(() => S.pending && render()));
  addEventListener('popstate', () => {
    if (!S.sheet) return;
    S.sheet = null;
    render();
  });
  addEventListener('hashchange', readJoinHash);
  addEventListener('online', () => {
    S.online = true;
    if (S.dbState === 'error') connectDb();
    render();
  });
  addEventListener('offline', () => {
    S.online = false;
    render();
  });
}

// ---------- Démarrage ----------

async function loadCatalogue() {
  try {
    const res = await fetch('data/catalogue.json');
    if (!res.ok) throw new Error(res.status);
    S.base = await res.json();
    S.loaded = true;
    reindex();
    render();
  } catch {
    setTimeout(loadCatalogue, 5000); // nouvelle tentative automatique
  }
}

// Firebase est chargé à part : sans configuration ou sans réseau, le catalogue reste consultable
async function connectDb() {
  S.dbState = 'connecting';
  render();
  try {
    const db = await import('./db.js');
    S.uid = await db.connect();
    S.db = db;
    S.dbState = 'ready';
    const saved = store.get('kino.currentGroup', null);
    selectGroup(S.groups.some(g => g.groupId === saved) ? saved : S.groups[0]?.groupId || null);
    if (S.pendingJoin) startJoin(S.pendingJoin);
    S.pendingJoin = null;
  } catch {
    S.dbState = 'error';
    render();
    setTimeout(() => S.dbState === 'error' && connectDb(), 10000);
  }
}

wireEvents();
readJoinHash();
render();
loadCatalogue();
if (S.dbState !== 'off') connectDb();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
