// Écrit config.js au moment du déploiement à partir des secrets GitHub (les clés ne sont jamais dans le dépôt).
// FIREBASE_CONFIG : le bloc firebaseConfig copié tel quel depuis la console Firebase. TMDB_KEY : la clé d'API TMDB.
import { writeFileSync } from 'node:fs';

const FIELDS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const raw = process.env.FIREBASE_CONFIG || '';
const pick = field => raw.match(new RegExp(`["']?${field}["']?\\s*:\\s*["']([^"']+)["']`))?.[1] || '';
const firebaseConfig = Object.fromEntries(FIELDS.map(f => [f, pick(f)]));
const tmdbKey = (process.env.TMDB_KEY || '').trim();

if (!/^[\w-]*$/.test(tmdbKey) || Object.values(firebaseConfig).some(v => !/^[\w.:-]*$/.test(v))) {
  console.error('Secret illisible : vérifie FIREBASE_CONFIG et TMDB_KEY.');
  process.exit(1);
}
writeFileSync('config.js', `// Généré au déploiement depuis les secrets GitHub.
export const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
export const tmdbKey = ${JSON.stringify(tmdbKey)};
`);
console.log(`config.js : Firebase ${firebaseConfig.apiKey ? 'configuré' : 'absent (mode catalogue seul)'}, TMDB ${tmdbKey ? 'configuré' : 'absent'}`);
