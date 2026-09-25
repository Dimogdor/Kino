# KINO — Contexte complet, cahier des charges et catalogue (version finale)

> **À lire en entier avant de répondre.** Ce fichier est la seule source de vérité du projet.
> Tout ce qui est écrit ici est **décidé** : ne rouvre pas ces choix et ne pose pas de question dont la réponse est ici.
> Dernière mise à jour : 25 septembre 2026.

---

## 0. En bref

- **Kino** est une webapp mobile pour **choisir quoi regarder à plusieurs** (en couple ou entre amis), chacun sur son téléphone, souvent à distance.
- **Pas de streaming, pas de liens** : l'appli sert uniquement à choisir, à noter et à garder un historique.
- Trois modes de choix : **Swipe**, **Duel**, **Roulette**. Plus : **Joker**, **tour de rôle**, **envies**, **déjà vu**, **notes**, **historique**.
- Catalogue de départ : **740 titres** (620 films dont 55 courts métrages, et 120 séries), rangés en collections (section 13).
- Site statique hébergé **gratuitement sur GitHub Pages**, synchronisation en temps réel via **Firebase (offre gratuite Spark)**, affiches et infos via **TMDB** (gratuit).
- **HTML, CSS et JavaScript purs**, aucun framework, aucune étape de build.

---

## 1. Qui je suis et comment me répondre

- Réponds toujours **en français**.
- **YAGNI** : la solution la plus simple qui marche. Aucune dépendance, abstraction ou fonctionnalité non listée ici.
- Donne des **fichiers complets prêts à copier** et des instructions **pas à pas** (je ne suis pas forcément développeur expert).
- Si un détail technique imprévu surgit, **choisis l'option la plus simple** et signale ton choix en une ligne, sans me demander.

---

## 2. Ce que je veux (vision)

- Fini les 45 minutes à faire défiler Netflix : **en 5 minutes on sait quoi regarder**.
- Deux usages principaux : avec **ma copine** (groupe « Couple ») et avec **mes amis** (groupe « Potes »). Souvent chacun chez soi, sur son téléphone.
- Réunir au même endroit **tous les films repérés sur Instagram et YouTube** et pouvoir en ajouter facilement depuis le téléphone.
- Me construire une **vraie culture générale** : classiques du monde entier, cinéma non occidental, pépites niches, courts métrages, documentaires.
- Une appli **belle, rapide et agréable sur téléphone**, disponible en **anglais, français et russe**.

---

## 3. Décisions figées

| Sujet | Décision |
|---|---|
| Nom | **Kino** (« cinéma » en russe, compréhensible en FR/EN) |
| Plateforme | Webapp **mobile d'abord**, utilisable aussi sur ordinateur |
| Langues de l'interface | Anglais, français, russe — un simple dictionnaire de phrases dans `i18n.js`, pas de librairie |
| Langue par défaut | Celle du téléphone (`fr`, `ru`, sinon `en`), modifiable dans Réglages |
| Hébergement | **GitHub Pages** (gratuit, dépôt public) |
| Synchronisation | **Firebase** : Firestore + connexion anonyme (offre gratuite Spark, sans carte bancaire) |
| Données films | **TMDB** (gratuit, attribution obligatoire) |
| Code | HTML/CSS/JS purs, modules ES, **zéro framework, zéro build, zéro dépendance** hormis le SDK Firebase chargé par CDN |
| Comptes | **Aucun compte ni mot de passe** : un lien d'invitation par groupe |
| Modes de choix | **Swipe**, **Duel**, **Roulette**. **Pas de mode Veto** |
| Fonctions sociales | Tour de rôle, Joker (veto absolu 1 fois par mois et par personne), envies, déjà vu, notes après visionnage, historique |
| Étiquettes | Type (film / série), `court`, `bientôt`, humeur, durée, pays, région, décennie, collection |
| Interdits | Streaming, liens de visionnage, bandes-annonces, notifications push, serveur maison, services payants |

---

## 4. Fonctionnalités de la V1 (toutes obligatoires)

### 4.1 Groupes et membres

- Un **groupe** = une bande qui choisit ensemble (ex. « Couple », « Potes »). Chaque groupe a ses propres envies, déjà vus, titres masqués, titres ajoutés, jokers, soirées et historique. Le catalogue de base est commun à tous les groupes.
- **Créer un groupe** : nom du groupe + mon prénom + un emoji. Je deviens le membre n°1.
- **Inviter** : bouton « Inviter » → lien `https://<pseudo>.github.io/kino/#join=<groupId>`, envoyé via le menu de partage du téléphone (`navigator.share`, sinon copie dans le presse-papiers avec un message « Lien copié »).
- **Rejoindre** : en ouvrant le lien, on voit la liste des membres existants avec deux choix : « C'est moi : [prénom] » (pour retrouver son profil sur un nouvel appareil) ou « Je suis nouveau » (prénom + emoji).
- Un même appareil peut appartenir à **plusieurs groupes** : sélecteur de groupe en haut de l'écran.
- **Pas de compte** : connexion anonyme Firebase automatique et invisible. Le lien d'invitation fait office de clé : quiconque le possède peut entrer dans le groupe.
- **Réglages du groupe** : renommer le groupe, changer l'ordre des membres (utilisé par le tour de rôle), retirer un membre, modifier son propre prénom et emoji.

### 4.2 Catalogue

- Contenu affiché = catalogue de base (`data/catalogue.json`) + titres ajoutés par le groupe − titres masqués par le groupe.
- **Affichage** : grille d'affiches (3 colonnes sur téléphone, plus sur grand écran), chargement paresseux des images (`loading="lazy"`). Sous chaque affiche : titre et année. Badges sur l'affiche : `Série`, `Court`, `Bientôt`, ❤️ si au moins un membre en a envie, 👁 si je l'ai déjà vu.
- **Raccourcis (puces horizontales en haut)** : Tout · Nos trouvailles · Classiques · Cinéma du monde · Pépites niches · Courts métrages · Culture générale · Séries · Ajouts du groupe · Bientôt · Nos envies.
- **Recherche** texte instantanée sur le titre FR, EN, RU et le titre original, insensible à la casse et aux accents.
- **Filtres** (feuille qui s'ouvre depuis le bas) : type, collection, humeur, région, décennie, durée maximale, statut (tout / pas vu par moi / déjà vu par moi / masqués).
- **Tri** : au hasard (par défaut, nouveau mélange à chaque ouverture), année, note TMDB, ajout récent.

### 4.3 Fiche d'un titre

- Grande affiche, titre dans la langue de l'interface, titre original, année, durée (ou nombre de saisons et durée d'un épisode pour une série), pays avec drapeaux emoji, région, genres, humeurs, résumé, note TMDB, badges.
- Qui dans le groupe en a **envie** et qui l'a **déjà vu** (emojis des membres).
- Actions : ❤️ **Envie** (personnel) · 👁 **Déjà vu** (personnel) · 🙈 **Masquer pour le groupe** (ou « Réafficher »).
- Aucun lien, aucune bande-annonce.

### 4.4 Ajouter un titre (depuis le téléphone)

- Bouton **« + »** flottant sur l'écran Catalogue.
- **Recherche TMDB** (films et séries, dans la langue de l'interface) → liste de résultats avec affiche, titre, année et type → un appui ajoute le titre au groupe (collection `ajouts`) et le marque automatiquement en **envie** pour la personne qui l'ajoute.
- **Anti-doublon** : si le titre existe déjà (même identifiant TMDB dans le catalogue de base ou dans les ajouts du groupe), afficher « Déjà dans le catalogue » et ouvrir sa fiche.
- **Ajout manuel** pour ce qui n'existe pas sur TMDB (courts YouTube, etc.) : titre, année, type (film / série), case « court métrage ». Affiche remplacée par une carte générée (titre sur fond coloré).

### 4.5 Envies, déjà vu, masqués

- **Envie** (personnelle, visible par tout le groupe) : sert à prioriser les titres dans les modes de choix.
- **Déjà vu** (personnel) : ajouté à la main, ou automatiquement pour tous les participants quand un titre est validé en soirée. Par défaut, un titre déjà vu par au moins un participant est exclu des modes de choix.
- **Masqué** (pour tout le groupe) : le titre n'apparaît plus dans le catalogue ni dans les modes. On le retrouve avec le filtre « Masqués » pour le réafficher.

### 4.6 Soirée (session de choix)

- **Une seule soirée active par groupe.** En lancer une nouvelle alors qu'une autre est active demande confirmation, puis annule l'ancienne.
- N'importe quel membre peut **lancer une soirée** : il choisit les **participants** (tous cochés par défaut), le **mode** et les **filtres**.
- Les autres membres voient en temps réel un bandeau **« Soirée en cours — Rejoindre »** dès qu'ils ouvrent l'appli. Pas de notification push : on se prévient par message.
- L'écran de lancement affiche **« Ce soir, c'est à [prénom] de choisir »** (voir 4.11).
- **Filtres de soirée** :
  - Type : **Films** (par défaut) / Séries / Courts métrages. Sélection multiple possible.
  - Collections : toutes par défaut.
  - Humeurs : aucune = toutes ; plusieurs = au moins une en commun.
  - Durée maximale : curseur de 60 à 240 min par pas de 15, ou « Peu importe » (par défaut). Pour une série, on compare la durée d'un épisode.
  - Régions et décennies : toutes par défaut.
  - Interrupteurs : « Inclure les titres déjà vus par un participant » (**non** par défaut), « Inclure les titres déjà regardés ensemble » (**non** par défaut), « Seulement nos envies » (**non** par défaut).
- **Toujours exclus** des modes : titres `bientôt`, titres masqués.
- La **réserve** (pool) est calculée une seule fois par l'appareil qui lance la soirée, puis enregistrée dans la soirée : tout le monde voit exactement les mêmes titres dans le même ordre.
- Si la réserve est trop petite pour le mode choisi, afficher : « Pas assez de titres, élargis les filtres » avec le nombre trouvé.
- Le créateur peut **annuler** la soirée à tout moment.

### 4.7 Mode Swipe

- **Paquet** : 20 titres par défaut (réglable : 10, 20 ou 30), tirés de la réserve. Les titres qu'au moins un participant a mis en envie passent en premier (dans la limite de la moitié du paquet), le reste est tiré au hasard.
- Chaque participant fait défiler **tout le paquet** à son rythme : glisser à droite ou bouton ♥ = oui ; glisser à gauche ou bouton ✕ = non ; appui = ouvrir la fiche. Seuil de glissement : 100 px. Boutons toujours visibles pour l'accessibilité.
- Chacun voit sa progression et combien de participants ont terminé. Le résultat s'affiche quand **tous les participants ont terminé**, ou quand le créateur appuie sur « Voir le résultat maintenant ».
- **Match** = titre aimé par **tous** les participants.
  - **1 match** → c'est le résultat.
  - **Plusieurs matchs** → liste des matchs. La personne dont c'est le tour (ou, si elle ne participe pas, le créateur) choisit entre : « Je choisis » (appui sur un titre), « Départager en Duel » (nouveau Duel : 4 titres s'il y a 4 matchs ou moins, sinon 8 ; on complète avec les titres qui ont reçu le plus de « oui », et au-delà de 8 matchs on garde ceux qui ont le plus d'envies), « Au hasard ».
  - **0 match** → classement des titres par nombre de « oui ». Les titres aimés par au moins la moitié des participants sont proposés : « Roulette parmi eux » ou « Nouveau paquet ». Si aucun titre n'atteint la moitié, seul « Nouveau paquet » est proposé.

### 4.8 Mode Duel

- Tournoi à élimination directe avec **8 titres** par défaut (réglable : 4, 8 ou 16). Mêmes règles de tirage que le Swipe (envies en premier, dans la limite de la moitié).
- À chaque tour, **tous les duels du tour** s'affichent (deux affiches face à face). Chaque participant choisit un titre par duel.
- Le tour se ferme quand **tous les participants ont voté** (ou quand le créateur force la suite). Gagnant d'un duel = majorité. **Égalité** → le titre qui a le plus d'envies ; si égalité encore → tirage au sort effectué par l'appareil qui ferme le tour et enregistré.
- La fermeture d'un tour se fait par une **transaction Firestore** pour éviter que deux appareils la fassent en même temps.
- Le vainqueur de la finale est le résultat ; le finaliste perdant est gardé comme **« dauphin »** pour le Joker.

### 4.9 Mode Roulette

- Tirage au sort **pondéré** dans la réserve : un titre mis en envie par au moins un participant a un poids de 3, les autres un poids de 1.
- Animation de défilement d'affiches d'environ 3 secondes, identique pour tout le monde (le résultat est tiré par l'appareil qui lance puis enregistré ; l'animation se termine sur ce résultat).
- La personne dont c'est le tour dispose d'**une relance gratuite** par soirée (bouton « Relancer »).

### 4.10 Joker

- Chaque membre a **1 Joker par mois calendaire** (remis à zéro le 1er du mois, heure du téléphone).
- Quand un résultat est affiché, tout participant qui a encore son Joker peut appuyer sur **« Jouer mon Joker »** (confirmation demandée). Le résultat est rejeté, ajouté à la liste des rejetés de la soirée, et remplacé par :
  - Swipe : le match suivant, sinon le titre suivant du classement ;
  - Duel : le dauphin ; s'il est lui aussi rejeté, une Roulette parmi les titres du tableau non rejetés ;
  - Roulette : un nouveau tirage.
- Un même résultat peut subir plusieurs Jokers de personnes différentes. Le Joker est une arme absolue : impossible de le contester.
- Les réglages du groupe affichent qui a encore son Joker ce mois-ci.

### 4.11 Tour de rôle

- Les membres ont un **ordre** (réglable dans les réglages du groupe).
- La personne dont c'est le tour = le premier participant qui suit, dans l'ordre, la personne qui a choisi lors de la dernière entrée de l'historique. Sans historique : le premier participant dans l'ordre.
- Ses privilèges pendant la soirée : elle propose le mode et les filtres (n'importe qui peut quand même lancer), elle a **1 relance** en Roulette, elle **tranche** quand le Swipe donne plusieurs matchs.
- Son prénom est enregistré dans la soirée puis dans l'historique (`chooserId`).

### 4.12 Validation, historique et notes

- Sur l'écran du résultat, n'importe quel participant appuie sur **« On regarde ça ! »** : la soirée passe au statut terminé, une entrée d'historique est créée, et le titre est marqué **déjà vu** pour tous les participants.
- Pour une **série**, l'entrée a le statut « en cours » jusqu'à ce que quelqu'un appuie sur « Série terminée ».
- **Notes** : chaque participant donne de 1 à 5 étoiles et, s'il le veut, un commentaire de 140 caractères maximum. Tant qu'il n'a pas noté, une pastille s'affiche sur l'onglet Historique. Une entrée peut être supprimée (si finalement on n'a pas regardé).
- **Historique** : liste chronologique (le plus récent en haut) avec affiche, date, mode utilisé, qui a choisi, notes de chacun et moyenne. Les entrées à noter apparaissent en premier.

### 4.13 Langues

- Tous les textes de l'interface sont traduits en anglais, français et russe dans `i18n.js` (un objet `{ en: {…}, fr: {…}, ru: {…} }`).
- Titres et résumés : langue de l'interface, sinon anglais, sinon titre original.
- Dates et nombres formatés avec `Intl` selon la langue.

---

## 5. Options de la V2 (à faire seulement quand la V1 fonctionne, dans cet ordre)

1. **Appli installable (PWA)** : `manifest.webmanifest` + petit service worker qui met en cache l'interface et le catalogue. L'appli s'ajoute à l'écran d'accueil et le catalogue s'affiche même hors ligne.
2. **« Où le voir » en France** : logos des plateformes via l'API TMDB « watch providers » (données JustWatch, mention obligatoire). **Information seulement, sans aucun lien.** Pays réglable dans les réglages.
3. **Statistiques du groupe** : nombre de titres vus ensemble, moyenne des notes, humeurs et régions les plus regardées, qui choisit les titres les mieux notés.
4. **Sauvegarde** : export et import des données du groupe au format JSON.
5. **Humeurs modifiables** : corriger les humeurs d'un titre pour son groupe (enregistré dans Firestore, prioritaire sur le calcul automatique).
6. **« Au hasard » en solo** : bouton dé dans le catalogue qui ouvre une fiche au hasard parmi les résultats filtrés.

---

## 6. Hors périmètre (ne pas faire)

- Streaming, téléchargement, liens de visionnage, bandes-annonces, liens vers des sites.
- Notifications push, e-mails, comptes avec mot de passe.
- Mode Veto (remplacé par le Joker).
- Serveur maison, base de données payante, framework (React, Vue…), bundler, TypeScript, npm à l'exécution.
- Chat, commentaires en fil de discussion, réseau social.

---

## 7. Architecture technique

### 7.1 Fichiers du dépôt

```
kino/
├── index.html                  # une seule page, 4 onglets
├── style.css
├── app.js                      # interface, navigation, écrans
├── db.js                       # Firebase : initialisation, lecture/écriture, écoute temps réel
├── modes.js                    # logique pure : réserve, Swipe, Duel, Roulette, Joker, tour de rôle
├── i18n.js                     # textes EN / FR / RU
├── config.js                   # clés publiques Firebase + clé TMDB
├── data/
│   ├── titles.json             # liste source, générée depuis la section 13 de ce fichier
│   ├── overrides.json          # corrections manuelles : { "<clé>": { "tmdbId": 123, "tmdbType": "movie" } }
│   ├── manual.json             # titres hors TMDB, saisis à la main
│   └── catalogue.json          # généré par le script, lu par l'appli
├── scripts/
│   └── build-catalogue.mjs     # Node 18+, sans dépendance
└── README.md                   # mise en ligne pas à pas
```

Chemins **relatifs** partout (le site est servi sous `/kino/`).

### 7.2 Firebase

- **Chargement** : SDK modulaire Firebase depuis le CDN officiel `https://www.gstatic.com/firebasejs/<version>/firebase-app.js`, `firebase-auth.js`, `firebase-firestore.js`, avec une **version exacte épinglée** (la dernière stable au moment où le code est écrit).
- **Connexion** : `signInAnonymously` au démarrage. L'`uid` n'est jamais montré à l'utilisateur.
- **Stockage local** (`localStorage`) : `kino.lang` (langue), `kino.groups` = liste de `{ groupId, memberId }`, `kino.currentGroup`.
- **Temps réel** : `onSnapshot` sur le groupe, ses membres, la soirée active et ses votes.

**Modèle de données Firestore**

```
groups/{groupId}
  name: string
  createdAt: timestamp
  hidden: string[]                    # ids de titres masqués pour le groupe

groups/{groupId}/members/{memberId}
  name: string
  emoji: string
  order: number                       # ordre du tour de rôle (0, 1, 2…)
  uid: string                         # uid Firebase de l'appareil actuellement lié
  jokerMonth: string | null           # "2026-09" = Joker utilisé en septembre 2026
  wants: string[]                     # envies
  seen: string[]                      # déjà vus

groups/{groupId}/titles/{titleId}     # titres ajoutés par le groupe (même forme qu'un élément de catalogue.json)
  … + addedBy: memberId, addedAt: timestamp, collection: "ajouts"

groups/{groupId}/sessions/{sessionId}
  mode: "swipe" | "duel" | "roulette"
  status: "vote" | "result" | "done" | "cancelled"
  createdBy: memberId
  chooserId: memberId                 # personne dont c'est le tour
  participants: memberId[]
  filters: object                     # filtres utilisés (pour affichage)
  pool: string[]                      # titres du paquet / du tableau, dans l'ordre
  deckSize | bracketSize: number
  bracket: array                      # Duel : tours successifs, chaque duel = { a, b, winner }
  round: number                       # Duel : tour en cours
  ranking: string[]                   # Swipe : titres classés après le vote
  result: string | null               # titre retenu
  runnerUp: string | null             # Duel : dauphin
  rejected: string[]                  # titres rejetés par Joker
  jokers: { memberId, titleId, at }[]
  rerollUsed: boolean                 # Roulette : relance du tour de rôle utilisée
  createdAt: timestamp

groups/{groupId}/sessions/{sessionId}/votes/{memberId}
  swipe: { [titleId]: boolean }
  swipeDone: boolean
  duel: { [round]: { [duelIndex]: titleId } }

groups/{groupId}/history/{entryId}
  titleId: string
  sessionId: string | null
  date: timestamp
  mode: string
  chooserId: memberId
  participants: memberId[]
  status: "vu" | "en-cours"           # "en-cours" seulement pour les séries
  ratings: { [memberId]: 1..5 }
  comments: { [memberId]: string }    # 140 caractères max
```

Les listes `wants`, `seen` et `hidden` se modifient avec `arrayUnion` / `arrayRemove`.

**Règles de sécurité Firestore** (à coller telles quelles) :

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

L'identifiant de groupe est un identifiant automatique Firestore de 20 caractères, impossible à deviner : il sert de clé secrète. Offre gratuite largement suffisante (50 000 lectures et 20 000 écritures par jour).

### 7.3 TMDB

- Compte gratuit sur themoviedb.org → clé API (v3). Elle est placée dans `config.js` (appel de recherche depuis l'appli) et passée en variable d'environnement au script.
- La clé est visible dans le code du site : acceptable pour une clé en lecture seule et un usage privé. En cas d'abus, la régénérer.
- **Images** : `https://image.tmdb.org/t/p/w342<poster>` (grille), `w780` (fiche).
- **Attribution obligatoire** dans l'onglet Groupe, section « À propos » : logo ou nom TMDB + « This product uses the TMDB API but is not endorsed or certified by TMDB. »

### 7.4 Format de `catalogue.json`

Un tableau d'objets :

```json
{
  "id": "m603",
  "tmdbId": 603,
  "tmdbType": "movie",
  "type": "film",
  "short": false,
  "collection": "trouvailles",
  "section": "Films",
  "title": { "fr": "Matrix", "en": "The Matrix", "ru": "Матрица" },
  "originalTitle": "The Matrix",
  "year": 1999,
  "releaseDate": "1999-03-31",
  "runtime": 136,
  "seasons": null,
  "countries": ["US"],
  "region": "amerique-nord",
  "genres": [28, 878],
  "moods": ["action", "evasion"],
  "overview": { "fr": "…", "en": "…", "ru": "…" },
  "poster": "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  "rating": 8.2,
  "tags": ["web"]
}
```

- `id` : `m<tmdbId>` pour un film, `t<tmdbId>` pour une série, `x-<titre-en-minuscules-sans-accents>-<année>` pour un titre hors TMDB.
- `type` : `film` ou `serie`. `short` : `true` pour un court métrage (voir 7.6).
- `runtime` : durée en minutes (film) ou durée d'un épisode (série). `seasons` : nombre de saisons (série), sinon `null`.
- `collection` : `trouvailles`, `classiques`, `monde`, `niches`, `courts`, `culture`, `series` ou `ajouts`. `section` : sous-titre de la section 13 (ex. « Japon », « Horreur »).
- `tags` : étiquettes libres de la section 13 (`web`, `ia`).

### 7.5 Génération du catalogue (`scripts/build-catalogue.mjs`)

Lancement : `TMDB_KEY=xxxx node scripts/build-catalogue.mjs` (Node 18 ou plus, `fetch` natif, aucune dépendance).

1. **Lire `data/titles.json`**, produit une fois pour toutes à partir de la section 13. Chaque ligne de la section 13 donne un objet `{ key, title, year, yearText, type, short, collection, section, director, vo, tags, moodsPlus, note }` :
   - `key` = `<type>|<titre>|<année>` (identifiant stable pour `overrides.json`) ;
   - `director` = texte après « réal. » ; `vo` = texte après « VO : » ou « VO fr : » (titre alternatif pour la recherche) ;
   - `tags` = étiquettes entre accents graves ; `short` = présence de `` `court` `` ;
   - `moodsPlus` = humeurs précédées d'un `+` (ex. `+frisson`).
2. **Pour chaque titre** : si `overrides.json` contient sa `key` → utiliser l'identifiant TMDB donné. Sinon, chercher :
   - `/search/movie` (films et courts) ou `/search/tv` (séries), paramètre `query` = titre, `language=fr-FR`, avec `year` (films) ou `first_air_date_year` (séries) ;
   - si aucun résultat : même recherche avec `language=en-US` ; puis avec le titre VO ; puis sans l'année.
3. **Choisir le bon résultat** : ne garder que les candidats dont l'année est à ±1 de l'année attendue. Pour un titre `court`, rejeter les candidats de plus de 40 minutes. S'il y a un réalisateur indiqué, vérifier les 3 premiers candidats via `/movie/{id}/credits` (réalisateurs) ou `/tv/{id}` (`created_by`) : un candidat correspond si le nom normalisé d'un de ses réalisateurs est contenu dans le texte normalisé de l'indication, ou l'inverse (normalisé = minuscules, sans accents, lettres seulement). Si un candidat correspond, le prendre ; sinon prendre le plus populaire des candidats restants et écrire « réalisateur non confirmé » dans le journal (les translittérations russes ou japonaises diffèrent souvent : ce n'est pas une erreur en soi, juste une ligne à vérifier d'un coup d'œil).
4. **Aucun candidat** → ajouter la ligne à `data/unresolved.txt` et passer au suivant. Pour chaque ligne non résolue, soit ajouter le bon identifiant dans `overrides.json`, soit saisir le titre dans `manual.json` (même format que le catalogue, sans `tmdbId`). Puis relancer le script.
5. **Détails** : `/movie/{id}` ou `/tv/{id}` en `fr-FR`, `en-US` et `ru-RU` → titres, résumés, durée (`runtime`, ou `episode_run_time[0]`, ou à défaut 45 pour une série), `number_of_seasons`, genres, `origin_country` (sinon `production_countries`), affiche, `vote_average`, `release_date` / `first_air_date`.
6. **Doublons** : si deux lignes donnent le même identifiant, garder la première et l'écrire dans le journal.
7. Ajouter le contenu de `manual.json`, calculer `moods`, `region`, `short` (7.6), écrire `data/catalogue.json` trié par titre, afficher un bilan (résolus, non résolus, doublons).
8. Pause de 30 ms entre deux appels (limite TMDB). Le script peut être relancé autant de fois que nécessaire.

### 7.6 Règles de calcul

**`bientôt`** : calculé dans l'appli à chaque affichage. Un titre est `bientôt` si sa `releaseDate` est postérieure à aujourd'hui ou absente. Au 25 septembre 2026, cela concerne Other Mommy (9 octobre 2026), Crawlers (16 octobre), Breeder (16 octobre) et Wicker (23 octobre). Ils basculent tout seuls à leur sortie.

**`court`** : `true` si la ligne porte `` `court` `` ou si la durée TMDB d'un film est de 40 minutes ou moins. Les courts sont exclus des soirées sauf si le filtre de type « Courts métrages » est coché.

**Humeurs** : calculées depuis les genres TMDB, plus les ajouts `+humeur` de la section 13. Un titre peut avoir plusieurs humeurs.

| Humeur | Clé | Genres films (id TMDB) | Genres séries (id TMDB) |
|---|---|---|---|
| 😂 Rire | `rire` | Comédie 35 | Comédie 35 |
| 😱 Frisson | `frisson` | Horreur 27 | — (via `+frisson`) |
| 🔪 Tension | `tension` | Thriller 53, Crime 80, Mystère 9648 | Crime 80, Mystère 9648 |
| 😢 Émotion | `emotion` | Drame 18 | Drame 18 |
| 💘 Amour | `amour` | Romance 10749 | Feuilleton 10766 |
| 🚀 Évasion | `evasion` | Science-fiction 878, Fantastique 14, Aventure 12 | SF & Fantastique 10765, Action & Aventure 10759 |
| 💥 Action | `action` | Action 28, Guerre 10752, Western 37 | Action & Aventure 10759, Guerre & Politique 10768, Western 37 |
| 🧠 Apprendre | `apprendre` | Documentaire 99, Histoire 36 | Documentaire 99 |
| 🎨 Animation | `animation` | Animation 16 | Animation 16 |
| 🧸 Famille | `famille` | Familial 10751 | Familial 10751, Enfants 10762 |

**Régions** : d'après le **premier pays d'origine** TMDB (codes ISO, y compris les codes historiques TMDB).

| Région | Clé | Codes pays |
|---|---|---|
| France | `france` | FR |
| Europe de l'Ouest | `europe-ouest` | GB, IE, DE, AT, CH, BE, NL, LU, IT, ES, PT, GR, MT, CY, XG |
| Europe du Nord | `europe-nord` | SE, NO, DK, FI, IS |
| Europe de l'Est et ex-URSS | `europe-est` | SU, RU, UA, BY, MD, PL, CZ, SK, XC, HU, RO, BG, YU, RS, HR, SI, BA, ME, MK, AL, XK, EE, LV, LT, GE, AM, AZ, KZ, UZ, KG, TJ, TM |
| Amérique du Nord | `amerique-nord` | US, CA |
| Amérique latine | `amerique-latine` | MX, GT, HN, SV, NI, CR, PA, CU, DO, HT, PR, JM, CO, VE, EC, PE, BO, CL, AR, UY, PY, BR |
| Monde arabe | `monde-arabe` | MA, DZ, TN, LY, EG, MR, SD, LB, SY, PS, JO, IQ, SA, AE, QA, KW, BH, OM, YE |
| Iran, Turquie, Israël | `moyen-orient` | IR, TR, IL, AF |
| Afrique subsaharienne | `afrique` | tous les autres pays d'Afrique (SN, ML, BF, NE, CI, GH, NG, CM, CD, CG, GA, TD, ET, KE, UG, TZ, RW, BI, SO, ZA, ZM, ZW, MZ, AO, NA, BW, LS, MG, BJ, TG, GN, GW, SL, LR, GM, CV, ER, DJ, MW, SS, CF…) |
| Asie du Sud | `asie-sud` | IN, PK, BD, LK, NP, BT, MV |
| Asie de l'Est | `asie-est` | JP, KR, KP, CN, HK, TW, MO, MN |
| Asie du Sud-Est | `asie-sud-est` | TH, VN, KH, LA, MM, MY, SG, ID, PH, BN, TL |
| Océanie | `oceanie` | AU, NZ, PG, FJ |
| Autres | `autres` | tout code absent de ce tableau |

**Durée** : affichée en « 1 h 52 ». Le filtre « durée maximale » compare `runtime` (durée d'un épisode pour une série). Un titre sans durée connue passe tous les filtres de durée.

**Décennie** : `Math.floor(year / 10) * 10` (ex. « Années 1970 »).

---

## 8. Interface

- **Navigation** : barre du bas à 4 onglets : 🎬 **Ce soir** · 📚 **Catalogue** · 🕘 **Historique** · 👥 **Groupe**. Sélecteur de groupe en haut.
- **Ce soir** : bandeau de la soirée active (Rejoindre / Reprendre) ; sinon bouton « Lancer une soirée » → participants → mode (3 grandes cartes : Swipe, Duel, Roulette, avec une phrase d'explication) → filtres → lancer. Puis l'écran du mode, puis l'écran du **résultat** : grande affiche, titre, durée, humeurs, boutons « On regarde ça ! », « Jouer mon Joker » (si disponible), « Relancer » (Roulette, pour la personne dont c'est le tour).
- **Catalogue** : puces de raccourcis, barre de recherche, bouton Filtres, grille, bouton « + ».
- **Historique** : entrées à noter en haut, puis le reste.
- **Groupe** : membres (emoji, prénom, ordre, Joker disponible ou non), bouton Inviter, réglages du groupe, mon profil, langue, À propos (attribution TMDB), liste de mes groupes (changer, créer, quitter).
- **Premier lancement** sans groupe : écran d'accueil « Créer un groupe » / « J'ai un lien d'invitation ».
- **Style** : thème sombre « salle de cinéma ». Fond `#0f0f12`, surfaces `#1b1b22`, texte `#f2f2f2`, texte secondaire `#a0a0ab`, accent `#ff5a36`, accent secondaire `#ffd166`. Police système (`system-ui`). Coins arrondis 12 px, affiches au ratio 2:3. Zones tactiles d'au moins 44 px. Respect des zones sûres de l'écran (`env(safe-area-inset-*)`). Animations courtes (200 ms), désactivées si `prefers-reduced-motion`.
- **Affiche manquante** : carte générée avec le titre sur un fond dont la couleur dépend du titre.
- **États** : chargement (squelettes gris), liste vide (phrase + action), erreur réseau (bandeau « Hors connexion » et nouvelle tentative automatique).

---

## 9. Mise en ligne pas à pas (tout est gratuit)

1. **GitHub** : créer un compte, puis un dépôt **public** nommé `kino`.
2. **Firebase** (console.firebase.google.com) : créer un projet (Google Analytics désactivé) → **Authentication** → activer le fournisseur **Anonyme** → **Firestore Database** → créer la base en mode production, région `europe-west` → onglet **Règles** → coller les règles de la section 7.2 → **Paramètres du projet** → ajouter une **application Web** → copier l'objet `firebaseConfig` dans `config.js` → **Authentication > Paramètres > Domaines autorisés** → ajouter `<pseudo>.github.io`.
3. **TMDB** (themoviedb.org) : créer un compte → Paramètres → API → demander une clé (usage personnel) → la copier dans `config.js`.
4. **Catalogue** : installer Node 18 ou plus → `TMDB_KEY=xxxx node scripts/build-catalogue.mjs` → corriger les lignes de `data/unresolved.txt` (overrides ou manual) → relancer jusqu'à zéro non résolu.
5. **Envoyer les fichiers** dans le dépôt (glisser-déposer sur github.com ou `git push`).
6. **GitHub Pages** : Settings → Pages → Source « Deploy from a branch » → branche `main`, dossier `/ (root)` → Save. Le site est en ligne après une ou deux minutes à `https://<pseudo>.github.io/kino/`.
7. Ouvrir le site sur le téléphone → créer les groupes « Couple » et « Potes » → envoyer les liens d'invitation.

---

## 10. Instructions pour l'assistant qui code

**Ordre de livraison** (une étape par message, fichiers complets, puis comment tester) :

1. `data/titles.json` généré à partir de la section 13 avec un petit script de conversion (`scripts/md-to-titles.mjs`, expression régulière donnée en 13.1) : tous les titres, aucun oubli, aucun ajout. Vérifier que le nombre obtenu est égal au total de 13.2.
2. `scripts/build-catalogue.mjs`, `overrides.json` vide (`{}`) et `manual.json` pré-rempli avec MIMIC (absent de TMDB). Les autres titres non résolus y seront ajoutés après le premier lancement du script.
3. `index.html`, `style.css`, `i18n.js`, `app.js` : catalogue consultable (recherche, puces, filtres, tri, fiche) **sans Firebase** → déployable tout de suite sur GitHub Pages.
4. `db.js` + `config.js` : groupes, membres, invitation, envies, déjà vu, masqués.
5. `modes.js` + écrans : soirée, réserve et Roulette.
6. Swipe.
7. Duel.
8. Joker et tour de rôle.
9. Validation, historique et notes.
10. Ajout de titres (recherche TMDB et ajout manuel).
11. `README.md` : mise en ligne pas à pas (reprend la section 9).

Ensuite seulement : options de la section 5, dans l'ordre.

**Contraintes de code** : modules ES natifs, pas de framework ni de bundler ; fonctions courtes et nommées clairement ; logique de choix (réserve, tirages, classements, tours) regroupée dans `modes.js` sous forme de fonctions pures testables ; commentaires en français ; aucun `console.log` laissé en production.

**Définition de « terminé » pour la V1** :
- [ ] Le site s'ouvre sur GitHub Pages et le catalogue complet s'affiche avec les affiches.
- [ ] Deux téléphones dans le même groupe voient les mêmes envies, déjà vus et masqués en temps réel.
- [ ] Une soirée lancée sur un téléphone apparaît sur l'autre ; Swipe, Duel et Roulette donnent le même résultat sur les deux.
- [ ] Le Joker remplace le résultat et n'est plus disponible jusqu'au mois suivant.
- [ ] Le tour de rôle désigne la bonne personne après chaque validation.
- [ ] L'historique enregistre le titre, la date, qui a choisi et les notes.
- [ ] Un titre trouvé sur Instagram s'ajoute en moins de 30 secondes depuis le téléphone.
- [ ] L'interface fonctionne en anglais, français et russe.

---

## 11. Si j'envoie encore des captures d'écran

Règles d'extraction (les nouveaux titres s'ajoutent à la collection « Nos trouvailles ») :

1. Lire le titre dans la légende, le texte incrusté **et les commentaires** (souvent quelqu'un y donne le nom du film).
2. Séparer films et séries (corriger si le post se trompe).
3. Aucun doublon : vérifier dans la section 13 et signaler « déjà dans la liste ».
4. Si une capture contient une liste entière (top, classement…), tout ajouter sauf les doublons.
5. Signaler honnêtement ce qui est incertain plutôt que deviner.
6. Les films seulement cités dans un texte sont ajoutés en bonus.
7. Marquer `court` pour un court métrage ; `bientôt` se calcule tout seul.
8. Ignorer les captures sans film.

Format de réponse : Films → Courts → Séries → À vérifier → Déjà dans la liste → Bonus → total cumulé. Court et en français.

---

## 12. Anciens points en suspens : décisions prises

| Point | Décision |
|---|---|
| The Transfiguration / Transfigure | La vidéo venait du **court métrage Transfigure (2021)** de Dylan Clark (4 min, IMDb tt14083124), comme l'indique la correction épinglée par l'auteur du post. **Transfigure est ajouté** en `court`. Le long métrage The Transfiguration (2016) n'est pas ajouté. |
| « Mimic » | **MIMIC (2026)**, court métrage d'horreur de la chaîne YouTube The Noctuary (@thenoctuaryfiles), réalisé avec l'IA, en deux parties. **Ajouté** en une seule entrée `court` `web` `ia`. À ne pas confondre avec Jacques the Mimic (2023), aussi ajouté, ni avec le long métrage Mimic (1997), non ajouté. |
| Don't Swipe Left | Non identifié avec certitude. **Écarté.** |
| « Prison Rules » et « They're def cooked » | Non identifiés. **Écartés.** |
| Intruders | Court métrage de Santiago Menghini, **2014**, Canada, 9 min 34, en trois chapitres. Vérifié. |
| Sijjin (2023) | Version **indonésienne** de 2023 (remake du film turc Siccîn). |
| Off Campus | Série Prime Video sortie le **13 mai 2026** → notée (2026–). |
| Web-séries d'horreur (The Backrooms, Local 58, Gemini Home Entertainment, The Mandela Catalogue) | Classées en **séries** `court` `web` dans la collection Courts métrages. |
| Note « À regarder » avec cases cochées (Casino, Seven, Thelma & Louise, Reservoir Dogs, Black Swan, The Truman Show, The Departed) | Titres ajoutés au catalogue mais **pas** marqués « déjà vu » automatiquement : la personne concernée les cochera elle-même dans l'appli. |
| The Housemaid (2025) et La Servante (1960, titre anglais The Housemaid) | Deux films différents, **les deux sont gardés**. |
| Gomorra | Le film (2008) est dans Nos trouvailles, la série (2014–2021) dans Séries du monde. Les deux sont gardés. |
| The Office | Version US (2005–2013) dans Nos trouvailles, version UK (2001–2003) dans Séries du monde. Les deux sont gardées. |
| Titres | Titre original pour les œuvres anglophones, titre français pour les autres ; la mention « VO : » donne le titre original ou international utile à la recherche. |

Il ne reste **aucun point en suspens**.

---

## 13. Catalogue

### 13.1 Comment lire cette liste

- Une ligne = un titre : `- Titre (année) — notes`. Pour une série, l'année est une période (`2017–2020`, ou `2022–` si elle continue).
- Le **type** (film ou série) et la **collection** sont donnés par le titre de chaque section (`collection` · `type`).
- Notes possibles, séparées par « · » : pays (si non anglophone ou pour lever un doute), `réal. Nom` (réalisateur, sert à vérifier le bon résultat TMDB), `VO : titre` (titre original ou international pour la recherche), étiquettes entre accents graves (`court`, `web` = publié sur YouTube/Internet, `ia` = fait avec l'IA), `+humeur` (humeur ajoutée à celles calculées, ex. `+frisson`), précisions libres.
- Titres anglophones en version originale, autres titres en français.
- Expression régulière pour lire une ligne : `^- (.+) \((\d{4})(?:–(\d{4})?)?\)(?: — (.*))?$` → titre, année de début, année de fin éventuelle, notes.
- `bientôt` n'est pas écrit ici : il est calculé automatiquement (section 7.6).

### 13.2 Récapitulatif

| Collection | Clé | Films | dont courts | Séries | Total |
|---|---|---|---|---|---|
| Nos trouvailles | `trouvailles` | 223 | 7 | 61 | 284 |
| Grands classiques | `classiques` | 33 | 0 | 0 | 33 |
| Cinéma du monde | `monde` | 243 | 0 | 0 | 243 |
| Pépites niches et films cultes | `niches` | 25 | 0 | 0 | 25 |
| Courts métrages | `courts` | 47 | 47 | 4 | 51 |
| Culture générale | `culture` | 49 | 1 | 16 | 65 |
| Séries du monde et niches | `series` | 0 | 0 | 39 | 39 |
| **Total** | | **620** | **55** | **120** | **740** |

### 13.3 Nos trouvailles — 284 titres

#### Films · `trouvailles` · `film` — 216

- 12 Angry Men (1957)
- 2001: A Space Odyssey (1968)
- A Beautiful Mind (2001)
- A Bronx Tale (1993)
- A Clockwork Orange (1971)
- Aftersun (2022)
- Alone (2020) — réal. John Hyams
- Alpha (2025) — France · réal. Julia Ducournau
- Amadeus (1984)
- Anna (2019) — réal. Luc Besson
- Apocalypto (2006)
- Arrival (2016)
- Ayla: The Daughter of War (2017) — Turquie · VO : Ayla
- Babylon (2022) — réal. Damien Chazelle
- Baby Ruby (2022)
- Backrooms (2026) — réal. Kane Parsons
- Barbarian (2022) — réal. Zach Cregger
- Bedazzled (2000) — réal. Harold Ramis
- Big Stan (2007)
- Black Swan (2010)
- Blade Runner (1982)
- Blade Runner 2049 (2017)
- Bleed for This (2016)
- Blink Twice (2024)
- Boyz n the Hood (1991)
- Breeder (2026) — réal. Alex Goyette
- Bullet Train (2022)
- Casablanca (1942)
- Case 39 (2009)
- Casino (1995) — réal. Martin Scorsese
- Cast Away (2000)
- Changeling (2008) — réal. Clint Eastwood
- Charlie Bartlett (2007)
- Children of Men (2006)
- Chompy & the Girls (2021)
- Chouf (2016) — France · réal. Karim Dridi
- Cinderella Man (2005)
- Coach Carter (2005)
- Cobweb (2023) — réal. Samuel Bodin
- Crawlers (2026)
- Dances with Wolves (1990)
- Deep Impact (1998)
- Dogma (1999)
- Downsizing (2017)
- Do You Know Me? (2009) — Canada · téléfilm avec Rachelle Lefevre
- Dune: Part One (2021)
- Everybody Rides the Carousel (1976) — animation · réal. John et Faith Hubley
- Ex Machina (2014)
- Fall (2022) — réal. Scott Mann
- Fall 2: Deadpoint (2026)
- Fight Club (1999)
- Ford v Ferrari (2019)
- Forrest Gump (1994)
- Full of It (2007)
- Gattaca (1997)
- Gemma Bovery (2014) — France · réal. Anne Fontaine
- Ghajini (2008) — Inde
- Gladiator (2000)
- Going in Style (2017)
- Gomorra (2008) — Italie · réal. Matteo Garrone
- Good News (2025) — Corée du Sud · réal. Byun Sung-hyun
- Good Will Hunting (1997)
- Greta (2018) — réal. Neil Jordan
- Grimsby (2016) — VO : The Brothers Grimsby
- Hancock (2008)
- Headhunters (2011) — Norvège · VO : Hodejegerne
- Heart Eyes (2025)
- Heat (1995) — réal. Michael Mann
- Heel (2025) — réal. Jan Komasa
- Her (2013)
- Hereditary (2018)
- Holiday Heart (2000)
- Home Sweet Hell (2015)
- Hope Gap (2019)
- Host (2020) — réal. Rob Savage
- Hostile (2017) — réal. Mathieu Turi
- I Am Legend (2007)
- I Am Sam (2001)
- Inception (2010)
- Indiana Jones and the Last Crusade (1989)
- Insidious (2010) — réal. James Wan
- Interstellar (2014)
- Into the Wild (2007)
- Ip Man (2008) — Hong Kong
- Jamón Jamón (1992) — Espagne
- Jarhead (2005)
- Jaws (1975)
- Jerry Maguire (1996)
- Jiro Dreams of Sushi (2011) — documentaire
- John Q (2002)
- Julie (en 12 chapitres) (2021) — Norvège · VO : Verdens verste menneske
- King Kong (2005) — réal. Peter Jackson
- Knock Knock (2015) — réal. Eli Roth
- La Cité de Dieu (2002) — Brésil · VO : Cidade de Deus / City of God
- L'Affaire Bojarski (2021) — France · réal. Jean-Paul Salomé
- La vie est belle (1997) — Italie · réal. Roberto Benigni · VO : La vita è bella
- Lawrence of Arabia (1962)
- Leave the World Behind (2023)
- Le Chant des moineaux (2008) — Iran · VO : The Song of Sparrows
- Le Grand Voyage (2004) — France/Maroc · réal. Ismaël Ferroukhi
- Le Temps qu'il reste (2009) — Palestine · réal. Elia Suleiman · VO : The Time That Remains
- Le Voyage de Chihiro (2001) — Japon · VO : Spirited Away
- Liar Liar (1997)
- Life (1999) — réal. Ted Demme
- Life of Pi (2012)
- Limitless (2011)
- Mad Max: Fury Road (2015)
- Mamma Mia! (2008)
- Mask (1985) — réal. Peter Bogdanovich
- Master and Commander: The Far Side of the World (2003)
- Memento (2000)
- Moneyball (2011)
- Moon (2009) — réal. Duncan Jones
- Mr. & Mrs. Smith (2005)
- My Sister's Keeper (2009)
- Nightcrawler (2014)
- No Country for Old Men (2007)
- No Hard Feelings (2023)
- Old School (2003)
- One Flew Over the Cuckoo's Nest (1975)
- Oppenheimer (2023)
- Other Mommy (2026) — réal. Rob Savage
- Ouvre les yeux (1997) — Espagne · VO : Abre los ojos
- Paulie (1998)
- Peaceful Warrior (2006)
- Perfume: The Story of a Murderer (2006)
- Polaroid (2019) — réal. Lars Klevberg
- Ponette (1996) — France · réal. Jacques Doillon
- Precious (2009)
- Psycho (1960) — réal. Alfred Hitchcock
- Pulp Fiction (1994)
- Remember Me (2010)
- Requiem pour un massacre (1985) — URSS · VO : Come and See
- Reservoir Dogs (1992)
- Rêves (1990) — Japon · réal. Akira Kurosawa · VO : Dreams
- Revolutionary Road (2008)
- Rheingold (2022) — Allemagne · réal. Fatih Akin
- Rocky (1976)
- Rodéo (2022) — France · réal. Lola Quivoron
- Rush (2013) — réal. Ron Howard
- Saawan (2016) — Pakistan
- Saccharine (2026) — Australie · réal. Natalie Erika James
- Saving Private Ryan (1998)
- Scary Movie (2000)
- Scary Movie 6 (2026)
- Schindler's List (1993)
- Se7en (1995) — réal. David Fincher
- Secretary (2002)
- Shéhérazade (2018) — France · réal. Jean-Bernard Marlin
- Shutter (2004) — Thaïlande
- Sijjin (2023) — Indonésie · remake du film turc Siccîn
- Splice (2009) — réal. Vincenzo Natali
- Stand by Me (1986)
- Steve Jobs (2015) — réal. Danny Boyle
- Subservience (2024)
- Talk to Me (2022) — Australie · réal. Danny et Michael Philippou
- Taxi Driver (1976)
- The African Queen (1951)
- The Alpha Test (2020)
- The Aviator (2004)
- The Boogeyman (2023) — réal. Rob Savage
- The Bridge on the River Kwai (1957)
- The Calculator (2014) — Russie · VO : Vychislitel
- The Dark Knight (2008)
- The Departed (2006)
- The Edge (1997) — réal. Lee Tamahori
- The Edge of Seventeen (2016)
- The Fall (2006) — réal. Tarsem Singh
- The Founder (2016)
- The Godfather (1972)
- The Hot Chick (2002)
- The Housemaid (2025) — réal. Paul Feig
- The Invasion (2007) — réal. Oliver Hirschbiegel
- The Keeping Room (2014)
- Thelma & Louise (1991)
- The Lord of the Rings: The Fellowship of the Ring (2001)
- The Lord of the Rings: The Return of the King (2003)
- The Matrix (1999)
- The Mission (1986)
- The Mortuary Assistant (2026)
- The Others (2001) — réal. Alejandro Amenábar
- The Pursuit of Happyness (2006)
- There's Something Wrong with the Children (2023)
- The Revenant (2015)
- The Secret Life of Walter Mitty (2013)
- The Shawshank Redemption (1994)
- The Shining (1980)
- The Silence of the Lambs (1991)
- The Sixth Sense (1999)
- The Station Agent (2003)
- The Texas Chain Saw Massacre (1974)
- The Treasure of the Sierra Madre (1948)
- The Truman Show (1998)
- The Visitor (2007) — réal. Tom McCarthy
- The Wolf of Wall Street (2013)
- Tigre et Dragon (2000) — Chine/Taïwan · VO : Crouching Tiger, Hidden Dragon
- Till Death (2021)
- Titanic (1997)
- Trainspotting (1996)
- Triangle (2009) — réal. Christopher Smith
- Trois jours et une vie (2019) — France/Belgique
- Twinkle Twinkle Lucky Stars (1985) — Hong Kong
- Up (2009)
- Vacancy (2007)
- Vanilla Sky (2001)
- Vicky Cristina Barcelona (2008)
- Wall Street (1987)
- Welcome to the Rileys (2010)
- What Keeps You Alive (2018)
- When Evil Lurks (2023) — Argentine · VO : Cuando acecha la maldad
- Whiplash (2014)
- Wicker (2026)
- Will (2011) — réal. Ellen Perry
- Winnie-the-Pooh: Blood and Honey (2023)
- Womb (2010) — Hongrie/Allemagne · réal. Benedek Fliegauf
- Wrong Reasons (2023)

#### Courts métrages · `trouvailles` · `film` — 7

- 2AM: The Smiling Man (2013) — `court` · réal. Michael Evans
- A Hollow Tree (2023) — `court` · réal. Cathal Fitzpatrick · 23 min
- Intruders (2014) — `court` · Canada · réal. Santiago Menghini · 9 min
- Jacques the Mimic (2023) — `court` · 9 min
- Make Me a Sandwich (2020) — `court`
- MIMIC (2026) — `court` `web` `ia` · The Noctuary (@thenoctuaryfiles, YouTube) · parties 1 et 2 · +frisson
- Transfigure (2021) — `court` · réal. Dylan Clark · 4 min · IMDb tt14083124

#### Séries · `trouvailles` · `série` — 61

- American Horror Stories (2021–) — +frisson
- American Horror Story (2011–) — +frisson
- Band of Brothers (2001) — mini-série
- Beef (2023–)
- Better Call Saul (2015–2022)
- Boardwalk Empire (2010–2014)
- Breaking Bad (2008–2013)
- Chernobyl (2019) — mini-série
- Criminal Minds (2005–)
- Curb Your Enthusiasm (2000–2024)
- Deadwood (2004–2006)
- Dexter (2006–2013)
- Dirk Gently's Holistic Detective Agency (2016–2017)
- Evil (2019–2024) — +frisson
- Extraordinary (2023–2024)
- Friends (1994–2004)
- From (2022–) — +frisson
- Game of Thrones (2011–2019)
- Genie, Make a Wish (2025) — Corée du Sud
- Grey's Anatomy (2005–)
- House (2004–2012) — VO : House M.D.
- How I Met Your Mother (2005–2014)
- L'Effondrement (2019) — France · Les Parasites · épisodes de 15 à 20 min
- Lucifer (2016–2021)
- Modern Family (2009–2020)
- Modern Love (2019–2021)
- My Name Is Earl (2005–2009)
- Newtopia (2025) — Corée du Sud
- Off Campus (2026–)
- Orange Is the New Black (2013–2019)
- Oz (1997–2003)
- Ozark (2017–2022)
- Parks and Recreation (2009–2015)
- Peaky Blinders (2013–2022)
- Prison Break (2005–2017)
- SAS: Rogue Heroes (2022–)
- Shameless (2011–2021) — version US
- Sherlock (2010–2017)
- Six Feet Under (2001–2005)
- Sons of Anarchy (2008–2014)
- Stranger Things (2016–2025) — +frisson
- Succession (2018–2023)
- Supernatural (2005–2020) — +frisson
- The 100 (2014–2020)
- The Big Bang Theory (2007–2019)
- The Good Lord Bird (2020) — mini-série
- The Last Dance (2020) — série documentaire
- The Leftovers (2014–2017)
- The Mandalorian (2019–)
- The Nevers (2021–2023)
- The Office (2005–2013) — version US
- The Orville (2017–)
- The Queen's Gambit (2020) — mini-série
- The Sopranos (1999–2007)
- The Walking Dead (2010–2022) — +frisson
- The Wire (2002–2008)
- Toussaint Louverture (2012) — France · mini-série
- True Detective (2014–)
- Veep (2012–2019)
- Watchmen (2019) — mini-série
- Z Nation (2014–2018) — +frisson

### 13.4 Grands classiques — 33 titres

#### Classiques anglophones · `classiques` · `film` — 33

- The General (1926) — réal. Buster Keaton
- Modern Times (1936) — réal. Charlie Chaplin
- The Wizard of Oz (1939) — réal. Victor Fleming
- Gone with the Wind (1939)
- The Great Dictator (1940) — réal. Charlie Chaplin
- Citizen Kane (1941) — réal. Orson Welles
- It's a Wonderful Life (1946) — réal. Frank Capra
- The Third Man (1949) — Royaume-Uni · réal. Carol Reed
- Sunset Boulevard (1950) — réal. Billy Wilder
- Singin' in the Rain (1952)
- Rear Window (1954) — réal. Alfred Hitchcock
- Vertigo (1958) — réal. Alfred Hitchcock
- Some Like It Hot (1959) — réal. Billy Wilder
- North by Northwest (1959) — réal. Alfred Hitchcock
- To Kill a Mockingbird (1962)
- Dr. Strangelove (1964) — réal. Stanley Kubrick
- The Graduate (1967)
- Kes (1969) — Royaume-Uni · réal. Ken Loach
- The Godfather Part II (1974)
- Chinatown (1974) — réal. Roman Polanski
- Barry Lyndon (1975) — réal. Stanley Kubrick
- Annie Hall (1977)
- Star Wars (1977) — VO : Star Wars: Episode IV – A New Hope
- The Deer Hunter (1978)
- Alien (1979) — réal. Ridley Scott
- Apocalypse Now (1979)
- Raging Bull (1980)
- E.T. the Extra-Terrestrial (1982)
- Back to the Future (1985)
- Brazil (1985) — Royaume-Uni · réal. Terry Gilliam
- Goodfellas (1990)
- Mulholland Drive (2001) — réal. David Lynch
- There Will Be Blood (2007)

### 13.5 Cinéma du monde — 243 titres

#### France · `monde` · `film` — 21

- La Grande Illusion (1937) — réal. Jean Renoir
- La Règle du jeu (1939) — réal. Jean Renoir
- Les Enfants du paradis (1945) — réal. Marcel Carné
- Le Salaire de la peur (1953) — réal. Henri-Georges Clouzot
- Les 400 Coups (1959) — réal. François Truffaut
- À bout de souffle (1960) — réal. Jean-Luc Godard
- Cléo de 5 à 7 (1962) — réal. Agnès Varda
- Les Parapluies de Cherbourg (1964) — réal. Jacques Demy
- Playtime (1967) — réal. Jacques Tati
- Le Samouraï (1967) — réal. Jean-Pierre Melville
- L'Armée des ombres (1969) — réal. Jean-Pierre Melville
- Au revoir les enfants (1987) — réal. Louis Malle
- La Cité de la peur (1994)
- La Haine (1995) — réal. Mathieu Kassovitz
- Le Dîner de cons (1998)
- Le Fabuleux Destin d'Amélie Poulain (2001)
- Un prophète (2009) — réal. Jacques Audiard
- Intouchables (2011)
- Portrait de la jeune fille en feu (2019) — réal. Céline Sciamma
- Les Misérables (2019) — réal. Ladj Ly
- Anatomie d'une chute (2023) — réal. Justine Triet

#### Italie · `monde` · `film` — 11

- Rome, ville ouverte (1945) — réal. Roberto Rossellini
- Le Voleur de bicyclette (1948) — réal. Vittorio De Sica
- La Strada (1954) — réal. Federico Fellini
- La Dolce Vita (1960) — réal. Federico Fellini
- 8½ (1963) — réal. Federico Fellini
- Le Guépard (1963) — réal. Luchino Visconti
- Le Bon, la Brute et le Truand (1966) — réal. Sergio Leone
- Il était une fois dans l'Ouest (1968) — réal. Sergio Leone
- Suspiria (1977) — réal. Dario Argento
- Cinema Paradiso (1988) — réal. Giuseppe Tornatore
- La grande bellezza (2013) — réal. Paolo Sorrentino

#### Espagne et Portugal · `monde` · `film` — 10

- Viridiana (1961) — Espagne · réal. Luis Buñuel
- L'Esprit de la ruche (1973) — Espagne · réal. Víctor Erice
- Tout sur ma mère (1999) — Espagne · réal. Pedro Almodóvar
- Parle avec elle (2002) — Espagne · réal. Pedro Almodóvar
- Mar adentro (2004) — Espagne · réal. Alejandro Amenábar
- L'Orphelinat (2007) — Espagne · réal. J. A. Bayona
- [REC] (2007) — Espagne
- Los cronocrímenes (2007) — Espagne · VO : Timecrimes
- La Plateforme (2019) — Espagne · VO : El hoyo
- Tabou (2012) — Portugal · réal. Miguel Gomes

#### Europe du Nord et centrale · `monde` · `film` — 23

- Nosferatu (1922) — Allemagne · réal. F. W. Murnau
- Metropolis (1927) — Allemagne · réal. Fritz Lang
- M le maudit (1931) — Allemagne · réal. Fritz Lang
- Das Boot (1981) — Allemagne · réal. Wolfgang Petersen
- Les Ailes du désir (1987) — Allemagne · réal. Wim Wenders
- Cours, Lola, cours (1998) — Allemagne
- Good Bye Lenin! (2003) — Allemagne
- La Chute (2004) — Allemagne · VO : Der Untergang
- La Vie des autres (2006) — Allemagne
- Le Septième Sceau (1957) — Suède · réal. Ingmar Bergman
- Les Fraises sauvages (1957) — Suède · réal. Ingmar Bergman
- Persona (1966) — Suède · réal. Ingmar Bergman
- Fanny et Alexandre (1982) — Suède · réal. Ingmar Bergman
- Morse (2008) — Suède · réal. Tomas Alfredson · VO : Let the Right One In
- Festen (1998) — Danemark · réal. Thomas Vinterberg
- La Chasse (2012) — Danemark · réal. Thomas Vinterberg
- Drunk (2020) — Danemark · réal. Thomas Vinterberg
- L'Homme qui voulait savoir (1988) — Pays-Bas · réal. George Sluizer · VO : Spoorloos / The Vanishing
- C'est arrivé près de chez vous (1992) — Belgique
- Rosetta (1999) — Belgique · réal. Luc et Jean-Pierre Dardenne
- Funny Games (1997) — Autriche · réal. Michael Haneke
- Le Ruban blanc (2009) — Autriche · réal. Michael Haneke
- Canine (2009) — Grèce · réal. Yórgos Lánthimos · VO : Dogtooth

#### Europe de l'Est et ex-URSS · `monde` · `film` — 23

- Le Cuirassé Potemkine (1925) — URSS · réal. Sergueï Eisenstein
- Quand passent les cigognes (1957) — URSS · réal. Mikhaïl Kalatozov
- Les Chevaux de feu (1965) — Ukraine (URSS) · réal. Sergueï Paradjanov
- Andreï Roublev (1966) — URSS · réal. Andreï Tarkovski
- La Couleur de la grenade (1969) — Arménie (URSS) · réal. Sergueï Paradjanov
- Solaris (1972) — URSS · réal. Andreï Tarkovski
- Le Miroir (1975) — URSS · réal. Andreï Tarkovski
- Stalker (1979) — URSS · réal. Andreï Tarkovski
- Moscou ne croit pas aux larmes (1980) — URSS
- Le Repentir (1984) — Géorgie (URSS) · réal. Tenguiz Abouladze
- Frère (1997) — Russie · réal. Alekseï Balabanov · VO : Brat
- Le Retour (2003) — Russie · réal. Andreï Zviaguintsev
- Leviathan (2014) — Russie · réal. Andreï Zviaguintsev
- Faute d'amour (2017) — Russie · réal. Andreï Zviaguintsev
- Cendres et Diamant (1958) — Pologne · réal. Andrzej Wajda
- Ida (2013) — Pologne · réal. Paweł Pawlikowski
- Cold War (2018) — Pologne · réal. Paweł Pawlikowski
- Les Petites Marguerites (1966) — Tchécoslovaquie · réal. Věra Chytilová
- Trains étroitement surveillés (1966) — Tchécoslovaquie · réal. Jiří Menzel
- Le Tango de Satan (1994) — Hongrie · réal. Béla Tarr · VO : Sátántangó
- Le Fils de Saul (2015) — Hongrie · réal. László Nemes
- 4 mois, 3 semaines, 2 jours (2007) — Roumanie · réal. Cristian Mungiu
- Underground (1995) — Yougoslavie · réal. Emir Kusturica

#### Monde arabe · `monde` · `film` — 21

- Gare centrale (1958) — Égypte · réal. Youssef Chahine · VO : Bab el hadid / Cairo Station
- La Momie (1969) — Égypte · réal. Chadi Abdel Salam · VO : Al-Mummia / The Night of Counting the Years
- Le Destin (1997) — Égypte · réal. Youssef Chahine · VO : Al Massir
- La Bataille d'Alger (1966) — Algérie/Italie · réal. Gillo Pontecorvo
- Chronique des années de braise (1975) — Algérie · réal. Mohammed Lakhdar-Hamina
- Omar Gatlato (1976) — Algérie · réal. Merzak Allouache
- Papicha (2019) — Algérie · réal. Mounia Meddour
- Ali Zaoua (2000) — Maroc · réal. Nabil Ayouch
- Adam (2019) — Maroc · réal. Maryam Touzani
- Les Meutes (2023) — Maroc · réal. Kamal Lazraq
- Les Silences du palais (1994) — Tunisie · réal. Moufida Tlatli
- L'Homme qui a vendu sa peau (2020) — Tunisie · réal. Kaouther Ben Hania
- Caramel (2007) — Liban · réal. Nadine Labaki
- L'Insulte (2017) — Liban · réal. Ziad Doueiri
- Capharnaüm (2018) — Liban · réal. Nadine Labaki
- Intervention divine (2002) — Palestine · réal. Elia Suleiman · VO : Divine Intervention
- Paradise Now (2005) — Palestine · réal. Hany Abu-Assad
- Omar (2013) — Palestine · réal. Hany Abu-Assad
- Wadjda (2012) — Arabie saoudite · réal. Haifaa al-Mansour
- Theeb (2014) — Jordanie · réal. Naji Abu Nowar
- Goodbye Julia (2023) — Soudan · réal. Mohamed Kordofani

#### Iran · `monde` · `film` — 10

- Où est la maison de mon ami ? (1987) — réal. Abbas Kiarostami
- Close-Up (1990) — réal. Abbas Kiarostami
- Le Ballon blanc (1995) — réal. Jafar Panahi
- Le Goût de la cerise (1997) — réal. Abbas Kiarostami
- Les Enfants du ciel (1997) — réal. Majid Majidi
- Persepolis (2007) — France/Iran · animation · réal. Marjane Satrapi
- Une séparation (2011) — réal. Asghar Farhadi
- Taxi Téhéran (2015) — réal. Jafar Panahi
- Le Client (2016) — réal. Asghar Farhadi
- Aucun ours (2022) — réal. Jafar Panahi

#### Turquie · `monde` · `film` — 5

- Yol (1982) — réal. Şerif Gören et Yılmaz Güney
- Il était une fois en Anatolie (2011) — réal. Nuri Bilge Ceylan
- Winter Sleep (2014) — réal. Nuri Bilge Ceylan
- Mustang (2015) — France/Turquie · réal. Deniz Gamze Ergüven
- Les Herbes sèches (2023) — réal. Nuri Bilge Ceylan

#### Afrique subsaharienne · `monde` · `film` — 15

- La Noire de… (1966) — Sénégal · réal. Ousmane Sembène
- Touki Bouki (1973) — Sénégal · réal. Djibril Diop Mambéty
- Hyènes (1992) — Sénégal · réal. Djibril Diop Mambéty
- Moolaadé (2004) — Sénégal · réal. Ousmane Sembène
- Atlantique (2019) — Sénégal · réal. Mati Diop
- Yeelen (1987) — Mali · réal. Souleymane Cissé
- Tilaï (1990) — Burkina Faso · réal. Idrissa Ouédraogo
- Timbuktu (2014) — Mauritanie · réal. Abderrahmane Sissako
- Tsotsi (2005) — Afrique du Sud · réal. Gavin Hood
- Félicité (2017) — RDC/Sénégal · réal. Alain Gomis
- I Am Not a Witch (2017) — Zambie · réal. Rungano Nyoni
- Rafiki (2018) — Kenya · réal. Wanuri Kahiu
- Lionheart (2018) — Nigeria · réal. Genevieve Nnaji
- Mami Wata (2023) — Nigeria · réal. C.J. Obasi
- The Burial of Kojo (2018) — Ghana · réal. Blitz Bazawule

#### Inde et Pakistan · `monde` · `film` — 12

- Pather Panchali (1955) — Inde · réal. Satyajit Ray
- Mother India (1957) — Inde · réal. Mehboob Khan
- Charulata (1964) — Inde · réal. Satyajit Ray
- Sholay (1975) — Inde · réal. Ramesh Sippy
- Dilwale Dulhania Le Jayenge (1995) — Inde
- Lagaan (2001) — Inde
- Taare Zameen Par (2007) — Inde · réal. Aamir Khan
- 3 Idiots (2009) — Inde
- Gangs of Wasseypur (2012) — Inde · réal. Anurag Kashyap
- The Lunchbox (2013) — Inde · réal. Ritesh Batra
- RRR (2022) — Inde · réal. S. S. Rajamouli
- Joyland (2022) — Pakistan · réal. Saim Sadiq

#### Japon · `monde` · `film` — 23

- Rashōmon (1950) — réal. Akira Kurosawa
- Vivre (1952) — réal. Akira Kurosawa · VO : Ikiru
- Voyage à Tokyo (1953) — réal. Yasujirō Ozu
- Les Contes de la lune vague après la pluie (1953) — réal. Kenji Mizoguchi · VO : Ugetsu
- Les Sept Samouraïs (1954) — réal. Akira Kurosawa
- Harakiri (1962) — réal. Masaki Kobayashi
- La Femme des sables (1964) — réal. Hiroshi Teshigahara
- Kwaïdan (1964) — réal. Masaki Kobayashi
- Ran (1985) — réal. Akira Kurosawa
- Akira (1988) — animation · réal. Katsuhiro Ōtomo
- Le Tombeau des lucioles (1988) — animation · réal. Isao Takahata
- Mon voisin Totoro (1988) — animation · réal. Hayao Miyazaki
- Ghost in the Shell (1995) — animation · réal. Mamoru Oshii
- Princesse Mononoké (1997) — animation · réal. Hayao Miyazaki
- Hana-bi (1997) — réal. Takeshi Kitano
- Perfect Blue (1997) — animation · réal. Satoshi Kon
- Ring (1998) — réal. Hideo Nakata
- Audition (1999) — réal. Takashi Miike
- Battle Royale (2000) — réal. Kinji Fukasaku
- Departures (2008) — VO : Okuribito
- Your Name (2016) — animation · réal. Makoto Shinkai
- Une affaire de famille (2018) — réal. Hirokazu Kore-eda
- Drive My Car (2021) — réal. Ryūsuke Hamaguchi

#### Corée du Sud · `monde` · `film` — 14

- La Servante (1960) — réal. Kim Ki-young · VO : The Housemaid (Hanyeo)
- Old Boy (2003) — réal. Park Chan-wook
- Memories of Murder (2003) — réal. Bong Joon-ho
- The Host (2006) — réal. Bong Joon-ho
- The Chaser (2008) — réal. Na Hong-jin
- Mother (2009) — réal. Bong Joon-ho
- J'ai rencontré le diable (2010) — réal. Kim Jee-woon · VO : I Saw the Devil
- Poetry (2010) — réal. Lee Chang-dong
- Mademoiselle (2016) — réal. Park Chan-wook · VO : The Handmaiden
- Dernier train pour Busan (2016) — réal. Yeon Sang-ho · VO : Train to Busan
- The Wailing (2016) — réal. Na Hong-jin · VO : Goksung
- Burning (2018) — réal. Lee Chang-dong
- Parasite (2019) — réal. Bong Joon-ho
- Decision to Leave (2022) — réal. Park Chan-wook

#### Chine, Hong Kong, Taïwan · `monde` · `film` — 13

- Épouses et concubines (1991) — Chine · réal. Zhang Yimou · VO : Raise the Red Lantern
- Adieu ma concubine (1993) — Chine · réal. Chen Kaige
- Vivre ! (1994) — Chine · réal. Zhang Yimou · VO : To Live
- Hero (2002) — Chine · réal. Zhang Yimou
- Still Life (2006) — Chine · réal. Jia Zhangke
- A Touch of Sin (2013) — Chine · réal. Jia Zhangke
- The Killer (1989) — Hong Kong · réal. John Woo
- Chungking Express (1994) — Hong Kong · réal. Wong Kar-wai
- In the Mood for Love (2000) — Hong Kong · réal. Wong Kar-wai
- Infernal Affairs (2002) — Hong Kong
- Crazy Kung-Fu (2004) — Hong Kong · réal. Stephen Chow · VO : Kung Fu Hustle
- A Brighter Summer Day (1991) — Taïwan · réal. Edward Yang
- Yi Yi (2000) — Taïwan · réal. Edward Yang

#### Asie du Sud-Est · `monde` · `film` — 6

- L'Odeur de la papaye verte (1993) — Vietnam · réal. Trần Anh Hùng
- Ong-Bak (2003) — Thaïlande
- Tropical Malady (2004) — Thaïlande · réal. Apichatpong Weerasethakul
- Oncle Boonmee (2010) — Thaïlande · réal. Apichatpong Weerasethakul · VO : Uncle Boonmee Who Can Recall His Past Lives
- The Raid (2011) — Indonésie · réal. Gareth Evans
- L'Image manquante (2013) — Cambodge · réal. Rithy Panh

#### Amérique latine · `monde` · `film` — 22

- Los Olvidados (1950) — Mexique · réal. Luis Buñuel
- Amours chiennes (2000) — Mexique · réal. Alejandro G. Iñárritu · VO : Amores perros
- Y tu mamá también (2001) — Mexique · réal. Alfonso Cuarón
- Le Labyrinthe de Pan (2006) — Mexique/Espagne · réal. Guillermo del Toro
- Roma (2018) — Mexique · réal. Alfonso Cuarón
- Neuf reines (2000) — Argentine · VO : Nueve reinas
- La Ciénaga (2001) — Argentine · réal. Lucrecia Martel
- Dans ses yeux (2009) — Argentine · VO : El secreto de sus ojos
- Les Nouveaux Sauvages (2014) — Argentine · VO : Relatos salvajes
- Argentina, 1985 (2022) — Argentine
- Le Dieu noir et le Diable blond (1964) — Brésil · réal. Glauber Rocha · VO : Deus e o Diabo na Terra do Sol
- Central do Brasil (1998) — Brésil · réal. Walter Salles
- Troupe d'élite (2007) — Brésil · VO : Tropa de Elite
- Bacurau (2019) — Brésil · réal. Kleber Mendonça Filho
- Je suis toujours là (2024) — Brésil · réal. Walter Salles · VO : Ainda Estou Aqui
- Mémoires du sous-développement (1968) — Cuba · VO : Memorias del subdesarrollo
- Fraise et Chocolat (1993) — Cuba · VO : Fresa y chocolate
- No (2012) — Chili · réal. Pablo Larraín
- Une femme fantastique (2017) — Chili · VO : Una mujer fantástica
- L'Étreinte du serpent (2015) — Colombie · VO : El abrazo de la serpiente
- Les Oiseaux de passage (2018) — Colombie · VO : Pájaros de verano
- Fausta (2009) — Pérou · VO : La teta asustada

#### Canada et peuples autochtones · `monde` · `film` — 5

- Atanarjuat (2001) — Canada (inuktitut) · VO : Atanarjuat: The Fast Runner
- Les Invasions barbares (2003) — Québec · réal. Denys Arcand
- C.R.A.Z.Y. (2005) — Québec · réal. Jean-Marc Vallée
- Incendies (2010) — Québec · réal. Denis Villeneuve
- Mommy (2014) — Québec · réal. Xavier Dolan

#### Océanie · `monde` · `film` — 9

- Walkabout (1971) — Australie · réal. Nicolas Roeg
- Wake in Fright (1971) — Australie · réal. Ted Kotcheff
- Picnic at Hanging Rock (1975) — Australie · réal. Peter Weir
- Mad Max (1979) — Australie · réal. George Miller
- Rabbit-Proof Fence (2002) — Australie
- Samson and Delilah (2009) — Australie · réal. Warwick Thornton
- The Babadook (2014) — Australie · réal. Jennifer Kent
- Once Were Warriors (1994) — Nouvelle-Zélande · réal. Lee Tamahori
- Boy (2010) — Nouvelle-Zélande · réal. Taika Waititi

### 13.6 Pépites niches et films cultes — 25 titres

#### Pépites niches · `niches` · `film` — 25

- Carnival of Souls (1962)
- Night of the Living Dead (1968) — réal. George A. Romero
- El Topo (1970) — Mexique · réal. Alejandro Jodorowsky
- La Montagne sacrée (1973) — Mexique · réal. Alejandro Jodorowsky · VO : The Holy Mountain
- La Planète sauvage (1973) — France/Tchécoslovaquie · animation · réal. René Laloux
- Belladonna (1973) — Japon · animation · réal. Eiichi Yamamoto · VO : Belladonna of Sadness
- Hausu (1977) — Japon · réal. Nobuhiko Ōbayashi
- Eraserhead (1977) — réal. David Lynch
- Possession (1981) — réal. Andrzej Żuławski
- Koyaanisqatsi (1982) — réal. Godfrey Reggio · sans dialogue
- Angel's Egg (1985) — Japon · animation · réal. Mamoru Oshii
- Tetsuo (1989) — Japon · réal. Shin'ya Tsukamoto
- Baraka (1992) — réal. Ron Fricke · sans dialogue
- Pi (1998) — réal. Darren Aronofsky
- Donnie Darko (2001)
- Primer (2004) — réal. Shane Carruth
- Paprika (2006) — Japon · animation · réal. Satoshi Kon
- The Man from Earth (2007)
- Synecdoche, New York (2008) — réal. Charlie Kaufman
- Enter the Void (2009) — réal. Gaspar Noé
- Kill List (2011) — réal. Ben Wheatley
- Coherence (2013) — réal. James Ward Byrkit
- Under the Skin (2013) — réal. Jonathan Glazer
- The Lobster (2015) — réal. Yórgos Lánthimos
- Mandy (2018) — réal. Panos Cosmatos

### 13.7 Courts métrages — 51 titres

#### Les Parasites (France, YouTube) · `courts` · `film` — 10

- Amour artificiel (2014) — `court` `web` · Les Parasites
- Le Figurant (2014) — `court` `web` · Les Parasites
- Symptômes d'amour (2014) — `court` `web` · Les Parasites
- Crise d'empathie (2015) — `court` `web` · Les Parasites
- Papier prout (2015) — `court` `web` · Les Parasites
- Jeu de société (2016) — `court` `web` · Les Parasites
- Lanceur d'alerte (2016) — `court` `web` · Les Parasites
- La Boucherie éthique (2017) — `court` `web` · Les Parasites
- Clown tueur, chèvres et apocalypse (2017) — `court` `web` · Les Parasites
- À bas les riches (2024) — `court` `web` · Les Parasites

#### Horreur · `courts` · `film` — 9

- Mamá (2008) — `court` · Espagne · réal. Andy Muschietti
- Lights Out (2013) — `court` · Suède · réal. David F. Sandberg
- Alexia (2013) — `court` · Argentine · réal. Andrés Borghi
- Cargo (2013) — `court` · Australie · réal. Ben Howling et Yolanda Ramke
- Tuck Me In (2014) — `court` · Espagne · réal. Ignacio F. Rodó · 1 min
- The Smiling Man (2015) — `court` · réal. A.J. Briones
- Curve (2016) — `court` · Australie · réal. Tim Egan
- Larry (2017) — `court` · réal. Jacob Chase
- Other Side of the Box (2018) — `court` · réal. Caleb J. Phillips

#### Incontournables hors horreur · `courts` · `film` — 9

- Le Ballon rouge (1956) — `court` · France · réal. Albert Lamorisse
- La Jetée (1962) — `court` · France · réal. Chris Marker
- Logorama (2009) — `court` · France · collectif H5
- Avant que de tout perdre (2013) — `court` · France · réal. Xavier Legrand
- The Present (2014) — `court` · Allemagne · réal. Jacob Frey
- Bear Story (2014) — `court` · Chili · animation · VO : Historia de un oso
- World of Tomorrow (2015) — `court` · animation · réal. Don Hertzfeldt
- Skin (2018) — `court` · réal. Guy Nattiv · 20 min (pas le long-métrage homonyme)
- Two Distant Strangers (2020) — `court`

#### Pépites du court métrage · `courts` · `film` — 19

- Le Voyage dans la Lune (1902) — `court` · France · réal. Georges Méliès
- Un chien andalou (1929) — `court` · France · réal. Luis Buñuel
- Meshes of the Afternoon (1943) — `court` · réal. Maya Deren
- Neighbours (1952) — `court` · Canada · réal. Norman McLaren
- La maison est noire (1962) — `court` · Iran · réal. Forough Farrokhzad
- Le Hérisson dans le brouillard (1975) — `court` · URSS · animation · réal. Iouri Norstein
- Powers of Ten (1977) — `court` · réal. Charles et Ray Eames
- Le Conte des contes (1979) — `court` · URSS · animation · réal. Iouri Norstein
- Dimensions du dialogue (1982) — `court` · Tchécoslovaquie · animation · réal. Jan Švankmajer
- L'Homme qui plantait des arbres (1987) — `court` · Canada · animation · réal. Frédéric Back
- Father and Daughter (2000) — `court` · Pays-Bas · animation · réal. Michaël Dudok de Wit
- Rejected (2000) — `court` · animation · réal. Don Hertzfeldt
- Validation (2007) — `court` · réal. Kurt Kuenne
- The Lost Thing (2010) — `court` · Australie · animation · réal. Shaun Tan et Andrew Ruhemann
- Paperman (2012) — `court` · animation · Disney
- Borrowed Time (2015) — `court` · animation
- Hair Love (2019) — `court` · animation · réal. Matthew A. Cherry
- Kitbull (2019) — `court` · animation · Pixar
- The Neighbors' Window (2019) — `court` · réal. Marshall Curry

#### Web-séries à épisodes courts · `courts` · `série` — 4

- The Backrooms (2022–) — `court` `web` · Kane Pixels (YouTube) · à voir dans l'ordre, commencer par « The Backrooms (Found Footage) » · +frisson
- Local 58 (2015–) — `court` `web` · Kris Straub (YouTube) · +frisson
- Gemini Home Entertainment (2019–) — `court` `web` · YouTube · +frisson
- The Mandela Catalogue (2021–) — `court` `web` · Alex Kister (YouTube) · +frisson

### 13.8 Culture générale — 65 titres

#### Documentaires · `culture` · `film` — 32

- Nuit et Brouillard (1956) — `court` · France · réal. Alain Resnais
- Le Chagrin et la Pitié (1969) — France · réal. Marcel Ophuls
- Sans soleil (1983) — France · réal. Chris Marker
- Shoah (1985) — France · réal. Claude Lanzmann · 9 h 30
- Paris Is Burning (1990) — réal. Jennie Livingston
- Hoop Dreams (1994) — réal. Steve James
- Microcosmos (1996) — France
- Les Glaneurs et la Glaneuse (2000) — France · réal. Agnès Varda
- Être et avoir (2002) — France · réal. Nicolas Philibert
- Bowling for Columbine (2002) — réal. Michael Moore
- The Fog of War (2003) — réal. Errol Morris
- S21, la machine de mort khmère rouge (2003) — Cambodge · réal. Rithy Panh
- La Marche de l'empereur (2005) — France · réal. Luc Jacquet
- Grizzly Man (2005) — réal. Werner Herzog
- An Inconvenient Truth (2006) — réal. Davis Guggenheim
- Man on Wire (2008) — réal. James Marsh
- Valse avec Bachir (2008) — Israël · animation · réal. Ari Folman
- Home (2009) — France · réal. Yann Arthus-Bertrand
- Inside Job (2010) — réal. Charles Ferguson
- La Nostalgie de la lumière (2010) — Chili · réal. Patricio Guzmán
- Senna (2010) — réal. Asif Kapadia
- 5 caméras brisées (2011) — Palestine · VO : 5 Broken Cameras
- The Act of Killing (2012) — Indonésie · réal. Joshua Oppenheimer
- Searching for Sugar Man (2012) — réal. Malik Bendjelloul
- Citizenfour (2014) — réal. Laura Poitras
- Amy (2015) — réal. Asif Kapadia
- 13th (2016) — réal. Ava DuVernay
- I Am Not Your Negro (2016) — réal. Raoul Peck
- Free Solo (2018)
- Honeyland (2019) — Macédoine du Nord
- For Sama (2019) — Syrie · réal. Waad al-Kateab et Edward Watts
- Dahomey (2024) — Bénin/Sénégal · réal. Mati Diop

#### Films historiques · `culture` · `film` — 17

- All the President's Men (1976)
- Gandhi (1982) — réal. Richard Attenborough
- The Killing Fields (1984) — VO fr : La Déchirure
- JFK (1991) — réal. Oliver Stone
- Malcolm X (1992) — réal. Spike Lee
- The Pianist (2002) — réal. Roman Polanski
- Hotel Rwanda (2004)
- Katyń (2007) — Pologne · réal. Andrzej Wajda
- Milk (2008) — réal. Gus Van Sant
- The Social Network (2010)
- Lincoln (2012) — réal. Steven Spielberg
- 12 Years a Slave (2013)
- Selma (2014)
- The Imitation Game (2014)
- Spotlight (2015)
- The Big Short (2015)
- Hidden Figures (2016)

#### Séries documentaires · `culture` · `série` — 16

- Civilisation (1969) — Royaume-Uni · Kenneth Clark
- Ways of Seeing (1972) — Royaume-Uni · John Berger
- The Ascent of Man (1973) — Royaume-Uni · Jacob Bronowski
- The World at War (1973–1974) — Royaume-Uni
- Connections (1978) — Royaume-Uni · James Burke
- Il était une fois… l'Homme (1978) — France · animation
- Cosmos (1980) — Carl Sagan · VO : Cosmos: A Personal Voyage
- Il était une fois… la Vie (1987) — France · animation
- Planet Earth (2006) — Royaume-Uni · BBC
- Apocalypse, la 2e Guerre mondiale (2009) — France
- Cosmos: A Spacetime Odyssey (2014)
- Making a Murderer (2015–2018)
- The Vietnam War (2017) — Ken Burns et Lynn Novick
- Blue Planet II (2017) — Royaume-Uni · BBC
- Wild Wild Country (2018)
- Our Planet (2019)

### 13.9 Séries du monde et niches — 39 titres

#### Séries · `series` · `série` — 39

- The Twilight Zone (1959–1964)
- Le Décalogue (1989) — Pologne · réal. Krzysztof Kieślowski · 10 épisodes
- Twin Peaks (1990–2017) — réal. David Lynch
- Neon Genesis Evangelion (1995–1996) — Japon · animation
- Cowboy Bebop (1998–1999) — Japon · animation (pas la version 2021)
- The Office (2001–2003) — version UK · Ricky Gervais
- Monster (2004–2005) — Japon · animation · Naoki Urasawa
- Engrenages (2005–2020) — France
- Kaamelott (2005–2009) — France · Alexandre Astier
- Mushishi (2005–2014) — Japon · animation
- Forbrydelsen (2007–2012) — Danemark · VO : The Killing
- Borgen (2010–2022) — Danemark
- Bron (2011–2018) — Suède/Danemark · VO : Broen / The Bridge
- Black Mirror (2011–) — Royaume-Uni
- Top Boy (2011–2023) — Royaume-Uni
- Les Revenants (2012–2015) — France · +frisson
- Shtisel (2013–2021) — Israël
- Utopia (2013–2014) — Royaume-Uni (pas le remake 2020)
- Gomorra (2014–2021) — Italie · la série
- Le Bureau des légendes (2015–2020) — France
- Fauda (2015–) — Israël
- Mr. Robot (2015–2019)
- Reply 1988 (2015–2016) — Corée du Sud
- Fleabag (2016–2019) — Royaume-Uni
- Atlanta (2016–2022)
- Dark (2017–2020) — Allemagne
- Babylon Berlin (2017–) — Allemagne
- La casa de papel (2017–2021) — Espagne
- L'Amie prodigieuse (2018–2024) — Italie · VO : L'amica geniale
- My Mister (2018) — Corée du Sud
- Sacred Games (2018–2019) — Inde
- Kingdom (2019–2020) — Corée du Sud · +frisson
- Delhi Crime (2019–) — Inde
- I May Destroy You (2020) — Royaume-Uni
- Squid Game (2021–2025) — Corée du Sud
- Severance (2022–)
- The Bear (2022–)
- Pachinko (2022–2024) — Corée/États-Unis
- Shōgun (2024–) — pas la version 1980

---

*Fin du fichier.*
