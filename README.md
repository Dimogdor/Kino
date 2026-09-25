# 🎬 Kino

Choisir quoi regarder à plusieurs, chacun sur son téléphone : **Swipe**, **Duel**, **Roulette**, Joker, tour de rôle, envies, déjà vu, notes et historique.
Pas de streaming, pas de liens. Site statique gratuit (GitHub Pages) + Firebase (offre gratuite Spark) + TMDB (gratuit).

## Contenu du dépôt

| Fichier | Rôle |
|---|---|
| `index.html`, `style.css` | la page unique et son thème sombre |
| `app.js` | interface : écrans, navigation, actions |
| `db.js` | Firebase : groupes, membres, soirées, votes, historique (temps réel) |
| `modes.js` | logique pure : réserve, Swipe, Duel, Roulette, Joker, tour de rôle, statistiques |
| `i18n.js` | textes en anglais, français et russe |
| `config.js` | **tes clés** Firebase et TMDB (à remplir) |
| `manifest.webmanifest`, `sw.js`, `icons/` | appli installable et catalogue hors ligne |
| `data/titles.json` | les 740 titres de la section 13 (généré) |
| `data/overrides.json`, `data/manual.json` | corrections manuelles du catalogue |
| `data/catalogue.json` | le catalogue lu par l'appli (généré) |
| `scripts/md-to-titles.mjs` | section 13 de `kino-contexte.md` → `data/titles.json` |
| `scripts/build-catalogue.mjs` | `data/titles.json` + TMDB → `data/catalogue.json` |
| `kino-contexte.md` | le cahier des charges (source de la liste des titres) |

> ℹ️ Le `data/catalogue.json` fourni est **provisoire** : les 740 titres sont là, mais sans affiches, résumés ni notes TMDB.
> L'étape 4 le remplace par le vrai catalogue. Fais-la **avant** de commencer à utiliser les groupes : les identifiants des titres changent (envies et déjà vus notés sur le catalogue provisoire seraient perdus).

## Mise en ligne pas à pas (tout est gratuit)

### 1. GitHub
1. Crée un compte sur [github.com](https://github.com).
2. Crée un dépôt **public** nommé `kino` (bouton **New repository**).

### 2. Firebase (groupes et synchronisation)
1. Va sur [console.firebase.google.com](https://console.firebase.google.com) → **Créer un projet** (désactive Google Analytics).
2. Menu **Authentication** → **Commencer** → onglet **Mode de connexion** → active **Anonyme**.
3. Menu **Firestore Database** → **Créer une base de données** → mode **production** → région `europe-west`.
4. Onglet **Règles** → remplace tout par ceci → **Publier** :
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /groups/{groupId}/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. ⚙️ **Paramètres du projet** → en bas, **Ajouter une application** → icône **Web** `</>` → donne un nom → copie les valeurs de l'objet `firebaseConfig` dans `config.js` :
   ```js
   export const firebaseConfig = {
     apiKey: 'AIza…',
     authDomain: 'ton-projet.firebaseapp.com',
     projectId: 'ton-projet',
     storageBucket: 'ton-projet.appspot.com',
     messagingSenderId: '123…',
     appId: '1:123…:web:abc…',
   };
   ```
6. **Authentication** → **Paramètres** → **Domaines autorisés** → **Ajouter un domaine** → `<pseudo>.github.io` (ton pseudo GitHub).

### 3. TMDB (affiches, recherche de titres, « Où le voir »)
1. Crée un compte sur [themoviedb.org](https://www.themoviedb.org).
2. Avatar → **Paramètres** → **API** → demande une clé (usage personnel).
3. Copie la **« Clé d'API »** (la courte, pas le long « jeton d'accès ») dans `config.js` :
   ```js
   export const tmdbKey = 'ta-clé';
   ```
   Cette clé est visible dans le code du site : c'est acceptable pour une clé en lecture seule. En cas d'abus, régénère-la sur TMDB.

### 4. Générer le vrai catalogue
1. Installe [Node.js](https://nodejs.org) (version 18 ou plus, bouton « LTS »).
2. Ouvre un terminal dans le dossier `kino`, puis lance :
   - macOS / Linux : `TMDB_KEY=ta-clé node scripts/build-catalogue.mjs`
   - Windows (PowerShell) : `$env:TMDB_KEY="ta-clé"; node scripts/build-catalogue.mjs`
3. Le script cherche chaque titre sur TMDB (quelques minutes) et affiche un bilan.
   - Les lignes « ? réalisateur non confirmé » sont à vérifier d'un coup d'œil (le lien TMDB est affiché). Si le titre choisi est faux, corrige-le avec `overrides.json`.
   - Les titres introuvables sont listés dans `data/unresolved.txt`. Pour chacun, au choix :
     - **il existe sur TMDB** : cherche-le sur themoviedb.org, note le numéro dans l'adresse (`/movie/603` → `603`, `/tv/1396` → `1396`) et ajoute dans `data/overrides.json` :
       ```json
       { "film|Titre exact|2014": { "tmdbId": 603, "tmdbType": "movie" } }
       ```
       (la clé est la ligne de `unresolved.txt` ; `tmdbType` vaut `movie` ou `tv`)
     - **il n'existe pas sur TMDB** : ajoute-le dans `data/manual.json` en copiant le modèle de MIMIC (même format que le catalogue, identifiant `x-titre-en-minuscules-année`).
4. Relance le script jusqu'à **zéro non résolu**.

### 5. Envoyer les fichiers
Glisse-dépose tout le dossier sur la page du dépôt (**Add file → Upload files**), ou utilise `git push`.

### 6. GitHub Pages
Dépôt → **Settings** → **Pages** → Source **Deploy from a branch** → branche `main`, dossier `/ (root)` → **Save**.
Après une ou deux minutes, le site est en ligne à `https://<pseudo>.github.io/kino/`.

### 7. C'est parti
1. Ouvre le site sur ton téléphone → **Créer un groupe** (« Couple », puis « Potes »).
2. Onglet **Groupe** → **Inviter** → envoie le lien à ta copine / tes amis.
3. Pour installer l'appli : menu du navigateur → **Ajouter à l'écran d'accueil**. Le catalogue s'affiche ensuite même hors ligne.

## Utilisation au quotidien

- **Ajouter un film vu sur Instagram** : Catalogue → bouton **+** → tape le titre → touche le bon résultat. Il est ajouté au groupe et mis en ❤️ envie.
- **Rejoindre depuis un nouveau téléphone** : ouvre le lien d'invitation → « C'est moi : [prénom] ».
- **Soirée** : Ce soir → Lancer une soirée → participants, mode, filtres → Lancer. Les autres voient « Soirée en cours — Rejoindre » en ouvrant l'appli (pas de notification : prévenez-vous par message).
- **Joker** : 1 par personne et par mois, remis à zéro le 1er du mois.
- **Sauvegarde** : onglet Groupe → Exporter (fichier JSON) / Importer.

## Ajouter des titres à la liste de base

1. Ajoute les lignes dans la section 13 de `kino-contexte.md` (et mets à jour les totaux de 13.2).
2. `node scripts/md-to-titles.mjs` (vérifie que les totaux correspondent à 13.2).
3. `TMDB_KEY=ta-clé node scripts/build-catalogue.mjs`, puis envoie les fichiers modifiés.

## Tester sur ton ordinateur

Les modules JavaScript ne marchent pas en ouvrant `index.html` directement : il faut un petit serveur, par exemple
`python3 -m http.server 8000` puis [http://localhost:8000](http://localhost:8000) (`localhost` est autorisé par défaut dans Firebase).
Sans clés dans `config.js`, l'appli fonctionne en mode « catalogue seul ».

## Mentions

This product uses the TMDB API but is not endorsed or certified by TMDB.
Données « Où le voir » fournies par JustWatch (via TMDB), à titre indicatif.
