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
| `i18n.js` | textes en 8 langues : français, anglais, espagnol, italien, portugais, allemand, russe, arabe (+ tutoriel) |
| `config.js` | vide dans le dépôt, rempli au déploiement depuis les secrets GitHub |
| `firestore.rules` | règles de sécurité à coller dans Firebase |
| `scripts/write-config.mjs`, `.github/workflows/` | déploiement automatique et régénération du catalogue |
| `manifest.webmanifest`, `sw.js`, `icons/` | appli installable et catalogue hors ligne |
| `data/titles.json` | les 740 titres de la section 13 (généré) |
| `data/overrides.json`, `data/manual.json` | corrections manuelles du catalogue |
| `data/catalogue.json` | le catalogue lu par l'appli (généré) |
| `scripts/md-to-titles.mjs` | section 13 de `kino-contexte.md` → `data/titles.json` |
| `scripts/build-catalogue.mjs` | `data/titles.json` + TMDB → `data/catalogue.json` |
| `kino-contexte.md` | le cahier des charges (source de la liste des titres) |

## Mise en ligne (tout est gratuit)

Le site est publié automatiquement par GitHub Actions à chaque modification de la branche `main`.
**Aucune clé n'est écrite dans le dépôt** : `config.js` est rempli au moment du déploiement à partir de deux secrets GitHub.

### 1. Firebase (groupes et synchronisation)
1. [console.firebase.google.com](https://console.firebase.google.com) → créer un projet (sans Google Analytics).
2. **Authentication** → **Mode de connexion** → activer **Anonyme**.
3. **Firestore Database** → créer la base (mode production, région `europe-west`, sans sauvegardes : elles sont payantes et l'appli a son propre export JSON).
4. Une fois la base créée : onglet **Règles** → remplacer tout le texte par le contenu du fichier [`firestore.rules`](firestore.rules) → **Publier**.
5. ⚙️ **Paramètres du projet** → **Vos applications** → icône Web `</>` → nom « kino » (sans Firebase Hosting) → copier le bloc `const firebaseConfig = { … };`.
6. **Authentication** → **Paramètres** → **Domaines autorisés** → ajouter `dimogdor.github.io`.

### 2. Secrets GitHub
Dépôt → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** :
- `FIREBASE_CONFIG` : colle le bloc `firebaseConfig` copié à l'étape 1.5, tel quel ;
- `TMDB_KEY` : la « Clé d'API » TMDB (Paramètres → API sur themoviedb.org).

### 3. GitHub Pages
Dépôt → **Settings** → **Pages** → Source : **GitHub Actions**.
Puis onglet **Actions** → « Déployer le site » → **Run workflow**. Une ou deux minutes plus tard : `https://dimogdor.github.io/Kino/`.

### 4. Catalogue
`data/catalogue.json` est déjà généré avec TMDB. Pour le régénérer (après avoir ajouté des titres à la section 13 de `kino-contexte.md`) :
onglet **Actions** → « Régénérer le catalogue » → **Run workflow** (le site se redéploie tout seul ensuite).
Les titres introuvables sont listés dans `data/unresolved.txt` : ajoute leur identifiant TMDB dans `data/overrides.json`
(`{ "film|Titre|2014": { "tmdbId": 603, "tmdbType": "movie" } }`) ou saisis-les dans `data/manual.json`.

### 5. C'est parti
Ouvre le site sur ton téléphone → choisis la langue → **Créer un groupe** → onglet **Groupe** → **Inviter**.
Menu du navigateur → **Ajouter à l'écran d'accueil** pour l'installer comme une appli.

## Sécurité

- **Clés** : absentes du dépôt (secrets GitHub). Attention : tout ce que le navigateur utilise reste lisible par un visiteur du site.
  C'est normal pour la configuration Firebase (elle identifie le projet, elle ne donne aucun droit) ; la protection vient des règles Firestore.
  Pour aller plus loin : [console.cloud.google.com](https://console.cloud.google.com) → **API et services** → **Identifiants** → clé « Browser key » →
  **Restrictions relatives aux applications** : *Sites Web* → `https://dimogdor.github.io/*` (et `http://localhost:*/*` pour tester).
- **Règles Firestore** (`firestore.rules`) : lecture d'un groupe seulement si l'on connaît son identifiant (le lien d'invitation), impossible de lister
  les groupes ni de supprimer un groupe, tailles et formats vérifiés. **Ne partage le lien d'invitation qu'avec ton groupe** : c'est la clé d'entrée.
- **Page** : politique de sécurité du contenu (CSP) qui n'autorise que les scripts du site et de Firebase, textes échappés avant affichage,
  chemins d'images vérifiés, sauvegardes JSON contrôlées avant import.
- **TMDB** : clé en lecture seule ; en cas d'abus, régénère-la sur themoviedb.org et mets à jour le secret `TMDB_KEY`.

## Utilisation au quotidien

- **Premier lancement** : choix de la langue (celle du téléphone est proposée), puis un tutoriel de 9 écrans qui explique le groupe, le catalogue et les 3 jeux. On peut le revoir à tout moment : « 💡 Comment ça marche ? » dans Ce soir, ou onglet Groupe → « Revoir le tutoriel ».

- **Ajouter un film vu sur Instagram** : Catalogue → bouton **+** → tape le titre → touche le bon résultat. Il est ajouté au groupe et mis en ❤️ envie.
- **Rejoindre depuis un nouveau téléphone** : ouvre le lien d'invitation → « C'est moi : [prénom] ».
- **Soirée** : Ce soir → Lancer une soirée → participants, mode, filtres → Lancer. Les autres voient « Soirée en cours — Rejoindre » en ouvrant l'appli (pas de notification : prévenez-vous par message).
- **Joker** : 1 par personne et par mois, remis à zéro le 1er du mois.
- **Sauvegarde** : onglet Groupe → Exporter (fichier JSON) / Importer.

## Ajouter des titres à la liste de base

1. Ajoute les lignes dans la section 13 de `kino-contexte.md` (et mets à jour les totaux de 13.2).
2. `node scripts/md-to-titles.mjs` (vérifie que les totaux correspondent à 13.2).
3. Onglet **Actions** → « Régénérer le catalogue » → **Run workflow** (ou en local : `TMDB_KEY=ta-clé node scripts/build-catalogue.mjs`).

## Tester sur ton ordinateur

Les modules JavaScript ne marchent pas en ouvrant `index.html` directement : il faut un petit serveur, par exemple
`python3 -m http.server 8000` puis [http://localhost:8000](http://localhost:8000) (`localhost` est autorisé par défaut dans Firebase).
Sans clés dans `config.js`, l'appli fonctionne en mode « catalogue seul ».

## Mentions

This product uses the TMDB API but is not endorsed or certified by TMDB.
Données « Où le voir » fournies par JustWatch (via TMDB), à titre indicatif.
