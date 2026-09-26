// Laissé vide dans le dépôt : GitHub Actions le remplit au déploiement avec les secrets
// FIREBASE_CONFIG et TMDB_KEY (voir README). Vide = mode « catalogue seul ».

// Firebase → Paramètres du projet → Vos applications → Application Web → firebaseConfig
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// themoviedb.org → Paramètres → API → « Clé d'API » (v3). Sert à l'ajout de titres et à « Où le voir ».
export const tmdbKey = '';
