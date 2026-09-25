// Firebase : initialisation, lecture/écriture et écoute en temps réel des données d'un groupe.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {
  getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, where,
  writeBatch, runTransaction, arrayUnion, arrayRemove, serverTimestamp, deleteField, FieldPath, Timestamp,
} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './config.js';

let fs;
let auth;

// Connexion anonyme et invisible ; renvoie l'uid de l'appareil
export async function connect() {
  if (!fs) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    fs = getFirestore(app);
  }
  const { user } = await signInAnonymously(auth);
  return user.uid;
}

const groupRef = gid => doc(fs, 'groups', gid);
const col = (gid, name) => collection(fs, 'groups', gid, name);
const ref = (gid, name, id) => doc(fs, 'groups', gid, name, id);
const voteRef = (gid, sid, mid) => doc(fs, 'groups', gid, 'sessions', sid, 'votes', mid);
const withId = (d, opts) => ({ id: d.id, ...d.data(opts) });

// ---------- Groupes et membres ----------

export async function createGroup(name, me, uid) {
  const g = await addDoc(collection(fs, 'groups'), { name, createdAt: serverTimestamp(), hidden: [] });
  const memberId = await addMember(g.id, me, uid, 0);
  return { groupId: g.id, memberId };
}

export async function addMember(gid, { name, emoji }, uid, order) {
  const m = await addDoc(col(gid, 'members'), { name, emoji, order, uid, jokerMonth: null, wants: [], seen: [] });
  return m.id;
}

// Nom et membres d'un groupe (écran « Rejoindre »), ou null si le lien est faux
export async function loadGroup(gid) {
  const g = await getDoc(groupRef(gid));
  if (!g.exists()) return null;
  const members = (await getDocs(col(gid, 'members'))).docs.map(d => withId(d));
  return { name: g.data().name, members: members.sort((a, b) => a.order - b.order) };
}

export const renameGroup = (gid, name) => updateDoc(groupRef(gid), { name });
export const updateMember = (gid, mid, data) => updateDoc(ref(gid, 'members', mid), data);
export const removeMember = (gid, mid) => deleteDoc(ref(gid, 'members', mid));

export function reorderMembers(gid, ids) {
  const batch = writeBatch(fs);
  ids.forEach((id, order) => batch.update(ref(gid, 'members', id), { order }));
  return batch.commit();
}

// Envies et déjà vus (personnels), masqués (pour le groupe)
export const toggleMine = (gid, mid, field, titleId, on) =>
  updateDoc(ref(gid, 'members', mid), { [field]: on ? arrayUnion(titleId) : arrayRemove(titleId) });
export const toggleHidden = (gid, titleId, on) => updateDoc(groupRef(gid), { hidden: on ? arrayUnion(titleId) : arrayRemove(titleId) });

// Humeurs corrigées pour le groupe (null = revenir au calcul automatique)
export const setMoods = (gid, titleId, moods) => updateDoc(groupRef(gid), new FieldPath('moods', titleId), moods || deleteField());

// Titre ajouté par le groupe, mis en envie pour la personne qui l'ajoute
export function addTitle(gid, mid, entry) {
  const batch = writeBatch(fs);
  batch.set(ref(gid, 'titles', entry.id), { ...entry, collection: 'ajouts', addedBy: mid, addedAt: serverTimestamp() });
  batch.update(ref(gid, 'members', mid), { wants: arrayUnion(entry.id) });
  return batch.commit();
}

// ---------- Temps réel ----------

export function listenGroup(gid, on) {
  const opts = { serverTimestamps: 'estimate' };
  const list = snap => snap.docs.map(d => withId(d, opts));
  const active = query(col(gid, 'sessions'), where('status', 'in', ['vote', 'result']));
  const stops = [
    onSnapshot(groupRef(gid), s => on.group(s.exists() ? s.data(opts) : null), on.error),
    onSnapshot(col(gid, 'members'), s => on.members(list(s), s.metadata.fromCache), on.error),
    onSnapshot(col(gid, 'titles'), s => on.titles(list(s)), on.error),
    onSnapshot(active, s => on.sessions(list(s)), on.error),
    onSnapshot(col(gid, 'history'), s => on.history(list(s)), on.error),
  ];
  return () => stops.forEach(stop => stop());
}

export function listenVotes(gid, sid, on) {
  return onSnapshot(collection(fs, 'groups', gid, 'sessions', sid, 'votes'), s =>
    on(Object.fromEntries(s.docs.map(d => [d.id, d.data()]))));
}

// ---------- Soirées ----------

// Crée la soirée et annule les soirées encore actives (une seule à la fois)
export async function startSession(gid, data, cancelIds) {
  const batch = writeBatch(fs);
  cancelIds.forEach(id => batch.update(ref(gid, 'sessions', id), { status: 'cancelled' }));
  const s = doc(col(gid, 'sessions'));
  batch.set(s, { ...data, createdAt: serverTimestamp() });
  await batch.commit();
  return s.id;
}

export const updateSession = (gid, sid, data) => updateDoc(ref(gid, 'sessions', sid), data);
export const vote = (gid, sid, mid, data) => setDoc(voteRef(gid, sid, mid), data, { merge: true });

// Nouveau paquet : on remplace la soirée et on efface les votes
export function resetVotes(gid, sid, participants, data) {
  const batch = writeBatch(fs);
  batch.update(ref(gid, 'sessions', sid), data);
  participants.forEach(m => batch.delete(voteRef(gid, sid, m)));
  return batch.commit();
}

// Transaction : change(soirée, votes) renvoie les champs à écrire, ou null si un autre appareil l'a déjà fait
export function transact(gid, sid, change) {
  return runTransaction(fs, async tx => {
    const sRef = ref(gid, 'sessions', sid);
    const s = { id: sid, ...(await tx.get(sRef)).data() };
    const votes = {};
    for (const m of s.participants) {
      const v = await tx.get(voteRef(gid, sid, m));
      if (v.exists()) votes[m] = v.data();
    }
    const patch = change(s, votes);
    if (patch) tx.update(sRef, patch);
    return patch;
  });
}

// Joker : refusé si déjà utilisé ce mois-ci ou si le résultat a changé entre-temps
export function playJoker(gid, sid, mid, month, expectedResult, change) {
  return runTransaction(fs, async tx => {
    const sRef = ref(gid, 'sessions', sid);
    const mRef = ref(gid, 'members', mid);
    const s = { id: sid, ...(await tx.get(sRef)).data() };
    const m = (await tx.get(mRef)).data();
    if (m.jokerMonth === month || s.status !== 'result' || s.result !== expectedResult) return false;
    tx.update(sRef, change(s));
    tx.update(mRef, { jokerMonth: month });
    return true;
  });
}

// « On regarde ça ! » : soirée terminée, entrée d'historique, déjà vu pour les participants
export function validate(gid, sid, entry, memberIds) {
  return runTransaction(fs, async tx => {
    const sRef = ref(gid, 'sessions', sid);
    const s = (await tx.get(sRef)).data();
    if (s.status !== 'result' || s.result !== entry.titleId) return false;
    tx.update(sRef, { status: 'done' });
    tx.set(doc(col(gid, 'history')), { ...entry, date: serverTimestamp() });
    memberIds.forEach(m => tx.update(ref(gid, 'members', m), { seen: arrayUnion(entry.titleId) }));
    return true;
  });
}

// ---------- Historique ----------

export const rate = (gid, eid, mid, stars) => updateDoc(ref(gid, 'history', eid), new FieldPath('ratings', mid), stars);
export const comment = (gid, eid, mid, text) => updateDoc(ref(gid, 'history', eid), new FieldPath('comments', mid), text);
export const finishSeries = (gid, eid) => updateDoc(ref(gid, 'history', eid), { status: 'vu' });

// Suppression (on n'a finalement pas regardé) : le « déjà vu » ajouté automatiquement est retiré
export function deleteEntry(gid, entry, memberIds) {
  const batch = writeBatch(fs);
  batch.delete(ref(gid, 'history', entry.id));
  memberIds.forEach(m => batch.update(ref(gid, 'members', m), { seen: arrayRemove(entry.titleId) }));
  return batch.commit();
}

// ---------- Sauvegarde JSON ----------

// Les dates Firestore deviennent { "$date": millisecondes } dans le fichier
const toPlain = v =>
  v instanceof Timestamp ? { $date: v.toMillis() }
  : Array.isArray(v) ? v.map(toPlain)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toPlain(x)]))
  : v;
const fromPlain = v =>
  Array.isArray(v) ? v.map(fromPlain)
  : v && typeof v === 'object' ? ('$date' in v ? Timestamp.fromMillis(v.$date) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fromPlain(x)])))
  : v;

const NAMES = ['members', 'titles', 'history'];

export async function exportGroup(gid) {
  const data = { kino: 1, exportedAt: new Date().toISOString(), group: (await getDoc(groupRef(gid))).data() };
  for (const name of NAMES) data[name] = (await getDocs(col(gid, name))).docs.map(d => withId(d));
  return toPlain(data);
}

// Restaure un fichier dans le groupe courant (les documents du fichier remplacent ceux qui ont le même identifiant)
export async function importGroup(gid, data) {
  const writes = [[groupRef(gid), data.group], ...NAMES.flatMap(name => (data[name] || []).map(({ id, ...rest }) => [ref(gid, name, id), rest]))];
  for (let i = 0; i < writes.length; i += 400) {
    const batch = writeBatch(fs);
    writes.slice(i, i + 400).forEach(([r, d]) => batch.set(r, fromPlain(d)));
    await batch.commit();
  }
}
