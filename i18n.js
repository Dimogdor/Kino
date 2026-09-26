// Textes de l'interface en anglais, français et russe (simple dictionnaire, sans librairie).
export const LANGS = ['en', 'fr', 'ru'];

const langs = { en: 'English', fr: 'Français', ru: 'Русский' };

const dict = {
  en: {
    langs,
    onboard: { lang: 'Choose your language', go: 'Start' },
    tab: { tonight: 'Tonight', catalogue: 'Catalogue', history: 'History', group: 'Group' },
    all: 'all', allOption: 'All', any: 'Any length', back: 'Back', cancel: 'Cancel', close: 'Close', save: 'Save', saved: 'Saved', loading: 'Loading…',
    offline: 'Offline — retrying automatically',
    turn: "Tonight it's {name}'s turn to choose",
    fmt: { hm: '{h}h {m}', h: '{h}h', m: '{m} min', decade: '{d}s' },
    badge: { serie: 'Series', short: 'Short', soon: 'Soon' },
    types: { film: 'Films', serie: 'Series', court: 'Short films' },
    mode: {
      swipe: 'Swipe', duel: 'Duel', roulette: 'Roulette',
      swipeHelp: 'Everyone swipes a deck: a title liked by all is a match.',
      duelHelp: 'Knockout tournament, face-offs until one title remains.',
      rouletteHelp: 'Pure luck, with a boost for the titles you want.',
    },
    moods: { rire: 'Laugh', frisson: 'Chills', tension: 'Suspense', emotion: 'Emotion', amour: 'Love', evasion: 'Escape', action: 'Action', apprendre: 'Learn', animation: 'Animation', famille: 'Family' },
    collections: { trouvailles: 'Our finds', classiques: 'Great classics', monde: 'World cinema', niches: 'Niche gems', courts: 'Short films', culture: 'General culture', series: 'World series', ajouts: 'Group additions' },
    regions: { france: 'France', 'europe-ouest': 'Western Europe', 'europe-nord': 'Northern Europe', 'europe-est': 'Eastern Europe & ex-USSR', 'amerique-nord': 'North America', 'amerique-latine': 'Latin America', 'monde-arabe': 'Arab world', 'moyen-orient': 'Iran, Turkey, Israel', afrique: 'Sub-Saharan Africa', 'asie-sud': 'South Asia', 'asie-est': 'East Asia', 'asie-sud-est': 'Southeast Asia', oceanie: 'Oceania', autres: 'Other' },
    countries: { SU: 'USSR', XC: 'Czechoslovakia', YU: 'Yugoslavia', XG: 'East Germany', ZR: 'Zaire' },
    genres: { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science fiction', 10770: 'TV movie', 53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics' },
    chips: { all: 'All', trouvailles: 'Our finds', classiques: 'Classics', monde: 'World cinema', niches: 'Niche gems', courts: 'Short films', culture: 'General culture', series: 'Series', ajouts: 'Group additions', soon: 'Coming soon', wants: 'Our wishlist' },
    cat: { search: 'Search a title', filters: 'Filters', dice: 'Random title', count: '{n} titles', empty: 'No title matches.', reset: 'Reset', sort: 'Sort', show: 'Show {n} titles' },
    filters: { type: 'Type', collection: 'Collection', moods: 'Moods', region: 'Region', decade: 'Decade', maxRuntime: 'Maximum length', status: 'Status', collections: 'Collections', regions: 'Regions', decades: 'Decades' },
    status: { all: 'All', unseen: 'Not seen by me', seen: 'Seen by me', hidden: 'Hidden' },
    sort: { random: 'Random', year: 'Year', rating: 'TMDB rating', recent: 'Recently added' },
    fiche: { seasons: 'Seasons: {n}', episode: '{d} per episode', want: 'Want', seen: 'Seen', hide: 'Hide for the group', unhide: 'Show again', editMoods: 'Moods', moodsHelp: 'Moods for our group:', moodsAuto: 'Automatic' },
    providers: { title: 'Where to watch ({country})', stream: 'Streaming', buy: 'Rent or buy', none: 'Not available on a platform right now.', credit: 'Source: JustWatch. For information only.' },
    add: { title: 'Add a title', search: 'Search TMDB (film or series)', noKey: 'TMDB search needs a key in config.js. Manual entry still works.', noResult: 'No result.', already: 'already in catalogue', exists: 'Already in the catalogue', added: 'Added and marked as wanted ❤️', manual: 'Manual entry', manualHelp: 'For what is not on TMDB (YouTube shorts…).', name: 'Title', year: 'Year', type: 'Type', submit: 'Add' },
    welcome: { tagline: 'Pick what to watch together in 5 minutes.', create: 'Create a group', haveLink: 'I have an invitation link' },
    setup: { firebase: 'Groups and movie nights need Firebase (see README, step 2). The catalogue can already be browsed.', connecting: 'Connecting…', error: 'Cannot connect. Retrying automatically…', browse: 'Browse the catalogue' },
    form: { yourName: 'Your first name' },
    create: { groupName: 'Group name', placeholder: 'Couple, Friends…', submit: 'Create' },
    link: { label: 'Paste the invitation link', submit: 'Continue' },
    join: { title: 'Join “{name}”', itsMe: "It's me: {name}", new: "I'm new", submit: 'Join', invalid: 'This invitation link does not work.' },
    launch: {
      open: 'Start a movie night', participants: 'Who is watching?', mode: 'Mode', filters: 'Filters', cards: '{n} cards', titles: '{n} titles',
      includeSeen: 'Include titles already seen by a participant', includeWatched: 'Include titles already watched together', onlyWants: 'Only our wishlist',
      count: '{n} matching titles', notEnough: 'Not enough titles, widen the filters ({n} found)', go: 'Start', replace: 'A movie night is already running. Cancel it and start a new one?',
    },
    session: { live: 'Movie night in progress', join: 'Join', watch: 'Watch', by: 'started by {name}', chooser: "{name}'s turn", cancel: 'Cancel the movie night', cancelConfirm: 'Cancel this movie night for everyone?', spectator: 'You are not taking part in this movie night.' },
    swipe: {
      progress: '{n}/{total} swiped', done: '{n}/{total} finished', yes: 'Yes', no: 'No', info: 'Details', finished: 'Done! Waiting for the others…', force: 'Show the result now',
      matches: '{n} matches', youDecide: "It's your call: tap a title, or…", decides: '{name} decides…', duel: 'Settle it with a Duel', random: 'At random',
      pickConfirm: 'Choose “{name}”?', noMatch: 'No match', roulette: 'Roulette among them ({n})', newDeck: 'New deck',
    },
    duel: { final: 'Final', semi: 'Semi-finals', quarter: 'Quarter-finals', eighth: 'Round of 16', round: 'Round', voted: '{n}/{total} voted', force: 'Close this round now' },
    result: {
      tonight: 'Tonight we watch', watch: "Let's watch this!", joker: 'Play my Joker', reroll: 'Spin again', rejected: 'Rejected by Joker:', none: 'No title left. Start a new movie night.',
      jokerConfirm: 'Play your Joker? This result will be rejected and you will not have another Joker until next month.', jokerPlayed: 'Joker played 🃏', changed: 'The result has already changed.', enjoy: 'Enjoy the show! 🍿',
    },
    tonight: { picked: 'Tonight:' },
    history: {
      noGroup: 'Create or join a group to keep a history.', empty: 'No movie night yet.', chosenBy: 'chosen by {name}', ongoing: 'Watching', seriesDone: 'Series finished',
      notRated: 'not rated', average: 'Average', yourRating: 'Your rating:', comment: 'A comment…', delete: 'Delete', deleteConfirm: 'Delete this entry? (we did not watch it after all)',
    },
    stats: { title: 'Group statistics', watched: 'Titles watched together:', average: 'Average rating:', moods: 'Favourite moods:', regions: 'Favourite regions:', choosers: 'Who picks the best-rated titles:' },
    group: {
      select: 'Current group', you: 'you', jokerYes: 'Joker available', jokerNo: 'Joker used this month', up: 'Move up', down: 'Move down', remove: 'Remove',
      orderHelp: 'The order sets whose turn it is to choose.', invite: 'Invite', inviteText: 'Join our group “{name}” on Kino', copied: 'Link copied', copyThis: 'Copy this link:',
      settings: 'Group settings', name: 'Group name', profile: 'My profile', mine: 'My groups', leave: 'Leave this group on this device',
      leaveConfirm: 'Leave “{name}” on this device? You can come back with the invitation link.', removeConfirm: 'Remove {name} from the group?', removed: 'You are no longer part of this group.',
    },
    settings: { title: 'Settings', lang: 'Language', country: 'Country for “Where to watch”' },
    backup: { title: 'Backup', help: 'Export the group data as a JSON file, or restore a file into this group.', export: 'Export', import: 'Import', invalid: 'This file is not a Kino backup.', confirm: 'Restore this file into “{name}”? Matching data will be replaced.', done: 'Backup restored' },
    about: { title: 'About', text: 'Kino helps you choose what to watch. No streaming, no links.', justwatch: '“Where to watch” data provided by JustWatch.' },
    error: { generic: 'Something went wrong, try again.', network: 'Network problem, retrying…' },
  },

  fr: {
    langs,
    onboard: { lang: 'Choisis ta langue', go: "C'est parti" },
    tab: { tonight: 'Ce soir', catalogue: 'Catalogue', history: 'Historique', group: 'Groupe' },
    all: 'toutes', allOption: 'Tout', any: 'Peu importe', back: 'Retour', cancel: 'Annuler', close: 'Fermer', save: 'Enregistrer', saved: 'Enregistré', loading: 'Chargement…',
    offline: 'Hors connexion — nouvelle tentative automatique',
    turn: "Ce soir, c'est à {name} de choisir",
    fmt: { hm: '{h} h {m}', h: '{h} h', m: '{m} min', decade: 'Années {d}' },
    badge: { serie: 'Série', short: 'Court', soon: 'Bientôt' },
    types: { film: 'Films', serie: 'Séries', court: 'Courts métrages' },
    mode: {
      swipe: 'Swipe', duel: 'Duel', roulette: 'Roulette',
      swipeHelp: 'Chacun fait défiler un paquet : un titre aimé par tous, c’est un match.',
      duelHelp: 'Tournoi à élimination directe, face-à-face jusqu’au vainqueur.',
      rouletteHelp: 'Le hasard décide, avec un coup de pouce pour vos envies.',
    },
    moods: { rire: 'Rire', frisson: 'Frisson', tension: 'Tension', emotion: 'Émotion', amour: 'Amour', evasion: 'Évasion', action: 'Action', apprendre: 'Apprendre', animation: 'Animation', famille: 'Famille' },
    collections: { trouvailles: 'Nos trouvailles', classiques: 'Grands classiques', monde: 'Cinéma du monde', niches: 'Pépites niches', courts: 'Courts métrages', culture: 'Culture générale', series: 'Séries du monde', ajouts: 'Ajouts du groupe' },
    regions: { france: 'France', 'europe-ouest': "Europe de l'Ouest", 'europe-nord': 'Europe du Nord', 'europe-est': "Europe de l'Est et ex-URSS", 'amerique-nord': 'Amérique du Nord', 'amerique-latine': 'Amérique latine', 'monde-arabe': 'Monde arabe', 'moyen-orient': 'Iran, Turquie, Israël', afrique: 'Afrique subsaharienne', 'asie-sud': 'Asie du Sud', 'asie-est': "Asie de l'Est", 'asie-sud-est': 'Asie du Sud-Est', oceanie: 'Océanie', autres: 'Autres' },
    countries: { SU: 'URSS', XC: 'Tchécoslovaquie', YU: 'Yougoslavie', XG: 'RDA', ZR: 'Zaïre' },
    genres: { 28: 'Action', 12: 'Aventure', 16: 'Animation', 35: 'Comédie', 80: 'Crime', 99: 'Documentaire', 18: 'Drame', 10751: 'Familial', 14: 'Fantastique', 36: 'Histoire', 27: 'Horreur', 10402: 'Musique', 9648: 'Mystère', 10749: 'Romance', 878: 'Science-fiction', 10770: 'Téléfilm', 53: 'Thriller', 10752: 'Guerre', 37: 'Western', 10759: 'Action & Aventure', 10762: 'Enfants', 10763: 'Actualités', 10764: 'Téléréalité', 10765: 'SF & Fantastique', 10766: 'Feuilleton', 10767: 'Talk-show', 10768: 'Guerre & Politique' },
    chips: { all: 'Tout', trouvailles: 'Nos trouvailles', classiques: 'Classiques', monde: 'Cinéma du monde', niches: 'Pépites niches', courts: 'Courts métrages', culture: 'Culture générale', series: 'Séries', ajouts: 'Ajouts du groupe', soon: 'Bientôt', wants: 'Nos envies' },
    cat: { search: 'Rechercher un titre', filters: 'Filtres', dice: 'Un titre au hasard', count: '{n} titres', empty: 'Aucun titre ne correspond.', reset: 'Réinitialiser', sort: 'Tri', show: 'Voir {n} titres' },
    filters: { type: 'Type', collection: 'Collection', moods: 'Humeurs', region: 'Région', decade: 'Décennie', maxRuntime: 'Durée maximale', status: 'Statut', collections: 'Collections', regions: 'Régions', decades: 'Décennies' },
    status: { all: 'Tout', unseen: 'Pas vu par moi', seen: 'Déjà vu par moi', hidden: 'Masqués' },
    sort: { random: 'Au hasard', year: 'Année', rating: 'Note TMDB', recent: 'Ajout récent' },
    fiche: { seasons: 'Saisons : {n}', episode: 'épisode de {d}', want: 'Envie', seen: 'Déjà vu', hide: 'Masquer pour le groupe', unhide: 'Réafficher', editMoods: 'Humeurs', moodsHelp: 'Humeurs pour notre groupe :', moodsAuto: 'Automatique' },
    providers: { title: 'Où le voir ({country})', stream: 'En streaming', buy: 'Location ou achat', none: 'Disponible sur aucune plateforme pour le moment.', credit: 'Source : JustWatch. À titre indicatif.' },
    add: { title: 'Ajouter un titre', search: 'Rechercher sur TMDB (film ou série)', noKey: 'La recherche TMDB demande une clé dans config.js. L’ajout manuel fonctionne quand même.', noResult: 'Aucun résultat.', already: 'déjà au catalogue', exists: 'Déjà dans le catalogue', added: 'Ajouté et mis en envie ❤️', manual: 'Ajout manuel', manualHelp: 'Pour ce qui n’existe pas sur TMDB (courts YouTube…).', name: 'Titre', year: 'Année', type: 'Type', submit: 'Ajouter' },
    welcome: { tagline: 'Choisir quoi regarder à plusieurs, en 5 minutes.', create: 'Créer un groupe', haveLink: "J'ai un lien d'invitation" },
    setup: { firebase: 'Les groupes et les soirées demandent Firebase (voir README, étape 2). Le catalogue est déjà consultable.', connecting: 'Connexion…', error: 'Connexion impossible. Nouvelle tentative automatique…', browse: 'Parcourir le catalogue' },
    form: { yourName: 'Ton prénom' },
    create: { groupName: 'Nom du groupe', placeholder: 'Couple, Potes…', submit: 'Créer' },
    link: { label: "Colle le lien d'invitation", submit: 'Continuer' },
    join: { title: 'Rejoindre « {name} »', itsMe: "C'est moi : {name}", new: 'Je suis nouveau', submit: 'Rejoindre', invalid: "Ce lien d'invitation ne fonctionne pas." },
    launch: {
      open: 'Lancer une soirée', participants: 'Qui regarde ?', mode: 'Mode', filters: 'Filtres', cards: '{n} cartes', titles: '{n} titres',
      includeSeen: 'Inclure les titres déjà vus par un participant', includeWatched: 'Inclure les titres déjà regardés ensemble', onlyWants: 'Seulement nos envies',
      count: '{n} titres correspondent', notEnough: 'Pas assez de titres, élargis les filtres ({n} trouvés)', go: 'Lancer', replace: 'Une soirée est déjà en cours. L’annuler et en lancer une nouvelle ?',
    },
    session: { live: 'Soirée en cours', join: 'Rejoindre', watch: 'Suivre', by: 'lancée par {name}', chooser: 'Tour de {name}', cancel: 'Annuler la soirée', cancelConfirm: 'Annuler cette soirée pour tout le monde ?', spectator: 'Tu ne participes pas à cette soirée.' },
    swipe: {
      progress: '{n}/{total} vus', done: '{n}/{total} ont terminé', yes: 'Oui', no: 'Non', info: 'Fiche', finished: 'Terminé ! On attend les autres…', force: 'Voir le résultat maintenant',
      matches: '{n} matchs', youDecide: 'À toi de trancher : touche un titre, ou…', decides: '{name} tranche…', duel: 'Départager en Duel', random: 'Au hasard',
      pickConfirm: 'Choisir « {name} » ?', noMatch: 'Aucun match', roulette: 'Roulette parmi eux ({n})', newDeck: 'Nouveau paquet',
    },
    duel: { final: 'Finale', semi: 'Demi-finales', quarter: 'Quarts de finale', eighth: 'Huitièmes de finale', round: 'Tour', voted: '{n}/{total} ont voté', force: 'Fermer ce tour maintenant' },
    result: {
      tonight: 'Ce soir, on regarde', watch: 'On regarde ça !', joker: 'Jouer mon Joker', reroll: 'Relancer', rejected: 'Rejetés par Joker :', none: 'Plus aucun titre. Lance une nouvelle soirée.',
      jokerConfirm: 'Jouer ton Joker ? Ce résultat sera rejeté et tu n’auras plus de Joker avant le mois prochain.', jokerPlayed: 'Joker joué 🃏', changed: 'Le résultat a déjà changé.', enjoy: 'Bonne séance ! 🍿',
    },
    tonight: { picked: 'Ce soir :' },
    history: {
      noGroup: 'Crée ou rejoins un groupe pour garder un historique.', empty: 'Aucune soirée pour l’instant.', chosenBy: 'choisi par {name}', ongoing: 'En cours', seriesDone: 'Série terminée',
      notRated: 'pas encore noté', average: 'Moyenne', yourRating: 'Ta note :', comment: 'Un commentaire…', delete: 'Supprimer', deleteConfirm: 'Supprimer cette entrée ? (finalement on ne l’a pas regardé)',
    },
    stats: { title: 'Statistiques du groupe', watched: 'Titres vus ensemble :', average: 'Moyenne des notes :', moods: 'Humeurs préférées :', regions: 'Régions préférées :', choosers: 'Qui choisit les titres les mieux notés :' },
    group: {
      select: 'Groupe actuel', you: 'toi', jokerYes: 'Joker disponible', jokerNo: 'Joker utilisé ce mois-ci', up: 'Monter', down: 'Descendre', remove: 'Retirer',
      orderHelp: "L'ordre décide à qui c'est le tour de choisir.", invite: 'Inviter', inviteText: 'Rejoins notre groupe « {name} » sur Kino', copied: 'Lien copié', copyThis: 'Copie ce lien :',
      settings: 'Réglages du groupe', name: 'Nom du groupe', profile: 'Mon profil', mine: 'Mes groupes', leave: 'Quitter ce groupe sur cet appareil',
      leaveConfirm: 'Quitter « {name} » sur cet appareil ? Tu pourras revenir avec le lien d’invitation.', removeConfirm: 'Retirer {name} du groupe ?', removed: 'Tu ne fais plus partie de ce groupe.',
    },
    settings: { title: 'Réglages', lang: 'Langue', country: 'Pays pour « Où le voir »' },
    backup: { title: 'Sauvegarde', help: 'Exporte les données du groupe dans un fichier JSON, ou restaure un fichier dans ce groupe.', export: 'Exporter', import: 'Importer', invalid: 'Ce fichier n’est pas une sauvegarde Kino.', confirm: 'Restaurer ce fichier dans « {name} » ? Les données correspondantes seront remplacées.', done: 'Sauvegarde restaurée' },
    about: { title: 'À propos', text: 'Kino aide à choisir quoi regarder. Pas de streaming, pas de liens.', justwatch: 'Données « Où le voir » fournies par JustWatch.' },
    error: { generic: 'Un problème est survenu, réessaie.', network: 'Problème de réseau, nouvelle tentative…' },
  },

  ru: {
    langs,
    onboard: { lang: 'Выбери язык', go: 'Поехали' },
    tab: { tonight: 'Сегодня', catalogue: 'Каталог', history: 'История', group: 'Группа' },
    all: 'все', allOption: 'Все', any: 'Не важно', back: 'Назад', cancel: 'Отмена', close: 'Закрыть', save: 'Сохранить', saved: 'Сохранено', loading: 'Загрузка…',
    offline: 'Нет соединения — повторная попытка автоматически',
    turn: 'Сегодня выбирает {name}',
    fmt: { hm: '{h} ч {m} мин', h: '{h} ч', m: '{m} мин', decade: '{d}-е' },
    badge: { serie: 'Сериал', short: 'Короткий', soon: 'Скоро' },
    types: { film: 'Фильмы', serie: 'Сериалы', court: 'Короткометражки' },
    mode: {
      swipe: 'Свайп', duel: 'Дуэль', roulette: 'Рулетка',
      swipeHelp: 'Каждый листает колоду: фильм, который понравился всем, — это совпадение.',
      duelHelp: 'Турнир на выбывание: пары, пока не останется победитель.',
      rouletteHelp: 'Решает случай, с бонусом для ваших желаний.',
    },
    moods: { rire: 'Посмеяться', frisson: 'Страшно', tension: 'Напряжение', emotion: 'Эмоции', amour: 'Любовь', evasion: 'Другие миры', action: 'Экшен', apprendre: 'Узнать новое', animation: 'Анимация', famille: 'Для семьи' },
    collections: { trouvailles: 'Наши находки', classiques: 'Великая классика', monde: 'Мировое кино', niches: 'Нишевые жемчужины', courts: 'Короткометражки', culture: 'Общая культура', series: 'Сериалы мира', ajouts: 'Добавлено группой' },
    regions: { france: 'Франция', 'europe-ouest': 'Западная Европа', 'europe-nord': 'Северная Европа', 'europe-est': 'Восточная Европа и бывший СССР', 'amerique-nord': 'Северная Америка', 'amerique-latine': 'Латинская Америка', 'monde-arabe': 'Арабский мир', 'moyen-orient': 'Иран, Турция, Израиль', afrique: 'Африка к югу от Сахары', 'asie-sud': 'Южная Азия', 'asie-est': 'Восточная Азия', 'asie-sud-est': 'Юго-Восточная Азия', oceanie: 'Океания', autres: 'Другое' },
    countries: { SU: 'СССР', XC: 'Чехословакия', YU: 'Югославия', XG: 'ГДР', ZR: 'Заир' },
    genres: { 28: 'боевик', 12: 'приключения', 16: 'мультфильм', 35: 'комедия', 80: 'криминал', 99: 'документальный', 18: 'драма', 10751: 'семейный', 14: 'фэнтези', 36: 'история', 27: 'ужасы', 10402: 'музыка', 9648: 'детектив', 10749: 'мелодрама', 878: 'фантастика', 10770: 'телефильм', 53: 'триллер', 10752: 'военный', 37: 'вестерн', 10759: 'боевик и приключения', 10762: 'детский', 10763: 'новости', 10764: 'реалити-шоу', 10765: 'фантастика и фэнтези', 10766: 'мыльная опера', 10767: 'ток-шоу', 10768: 'война и политика' },
    chips: { all: 'Все', trouvailles: 'Наши находки', classiques: 'Классика', monde: 'Мировое кино', niches: 'Нишевые жемчужины', courts: 'Короткометражки', culture: 'Общая культура', series: 'Сериалы', ajouts: 'Добавлено группой', soon: 'Скоро', wants: 'Наши желания' },
    cat: { search: 'Найти фильм', filters: 'Фильтры', dice: 'Случайный фильм', count: 'Найдено: {n}', empty: 'Ничего не найдено.', reset: 'Сбросить', sort: 'Сортировка', show: 'Показать ({n})' },
    filters: { type: 'Тип', collection: 'Коллекция', moods: 'Настроение', region: 'Регион', decade: 'Десятилетие', maxRuntime: 'Максимальная длительность', status: 'Статус', collections: 'Коллекции', regions: 'Регионы', decades: 'Десятилетия' },
    status: { all: 'Все', unseen: 'Я не видел(а)', seen: 'Я уже видел(а)', hidden: 'Скрытые' },
    sort: { random: 'Случайно', year: 'Год', rating: 'Рейтинг TMDB', recent: 'Недавно добавленные' },
    fiche: { seasons: 'Сезонов: {n}', episode: 'серия {d}', want: 'Хочу', seen: 'Видел(а)', hide: 'Скрыть для группы', unhide: 'Показать снова', editMoods: 'Настроение', moodsHelp: 'Настроение для нашей группы:', moodsAuto: 'Автоматически' },
    providers: { title: 'Где посмотреть ({country})', stream: 'Онлайн по подписке', buy: 'Аренда или покупка', none: 'Сейчас нет ни на одной платформе.', credit: 'Источник: JustWatch. Только для информации.' },
    add: { title: 'Добавить фильм', search: 'Поиск в TMDB (фильм или сериал)', noKey: 'Для поиска в TMDB нужен ключ в config.js. Ручное добавление работает.', noResult: 'Ничего не найдено.', already: 'уже в каталоге', exists: 'Уже в каталоге', added: 'Добавлено в «Хочу» ❤️', manual: 'Добавить вручную', manualHelp: 'Для того, чего нет в TMDB (ролики с YouTube…).', name: 'Название', year: 'Год', type: 'Тип', submit: 'Добавить' },
    welcome: { tagline: 'Выберите, что посмотреть вместе, за 5 минут.', create: 'Создать группу', haveLink: 'У меня есть ссылка-приглашение' },
    setup: { firebase: 'Для групп и киновечеров нужен Firebase (см. README, шаг 2). Каталог уже доступен.', connecting: 'Подключение…', error: 'Не удаётся подключиться. Повторная попытка…', browse: 'Открыть каталог' },
    form: { yourName: 'Твоё имя' },
    create: { groupName: 'Название группы', placeholder: 'Пара, Друзья…', submit: 'Создать' },
    link: { label: 'Вставь ссылку-приглашение', submit: 'Продолжить' },
    join: { title: 'Вступить в «{name}»', itsMe: 'Это я: {name}', new: 'Я новенький', submit: 'Вступить', invalid: 'Эта ссылка-приглашение не работает.' },
    launch: {
      open: 'Начать киновечер', participants: 'Кто смотрит?', mode: 'Режим', filters: 'Фильтры', cards: 'Карт: {n}', titles: 'Фильмов: {n}',
      includeSeen: 'Включить фильмы, которые кто-то уже видел', includeWatched: 'Включить фильмы, которые мы уже смотрели вместе', onlyWants: 'Только наши желания',
      count: 'Подходит: {n}', notEnough: 'Слишком мало фильмов, расширь фильтры (найдено: {n})', go: 'Начать', replace: 'Киновечер уже идёт. Отменить его и начать новый?',
    },
    session: { live: 'Идёт киновечер', join: 'Присоединиться', watch: 'Следить', by: 'начал(а) {name}', chooser: 'Выбирает {name}', cancel: 'Отменить киновечер', cancelConfirm: 'Отменить этот киновечер для всех?', spectator: 'Ты не участвуешь в этом киновечере.' },
    swipe: {
      progress: 'Просмотрено: {n}/{total}', done: 'Закончили: {n}/{total}', yes: 'Да', no: 'Нет', info: 'Подробнее', finished: 'Готово! Ждём остальных…', force: 'Показать результат сейчас',
      matches: 'Совпадений: {n}', youDecide: 'Решаешь ты: нажми на фильм или…', decides: 'Решает {name}…', duel: 'Устроить дуэль', random: 'Наугад',
      pickConfirm: 'Выбрать «{name}»?', noMatch: 'Совпадений нет', roulette: 'Рулетка среди них ({n})', newDeck: 'Новая колода',
    },
    duel: { final: 'Финал', semi: 'Полуфиналы', quarter: 'Четвертьфиналы', eighth: '1/8 финала', round: 'Раунд', voted: 'Проголосовали: {n}/{total}', force: 'Закрыть раунд сейчас' },
    result: {
      tonight: 'Сегодня смотрим', watch: 'Смотрим это!', joker: 'Сыграть Джокера', reroll: 'Крутить ещё раз', rejected: 'Отклонено Джокером:', none: 'Фильмов не осталось. Начни новый киновечер.',
      jokerConfirm: 'Сыграть Джокера? Этот результат будет отклонён, а новый Джокер появится только в следующем месяце.', jokerPlayed: 'Джокер сыгран 🃏', changed: 'Результат уже изменился.', enjoy: 'Приятного просмотра! 🍿',
    },
    tonight: { picked: 'Сегодня:' },
    history: {
      noGroup: 'Создай группу или вступи в неё, чтобы вести историю.', empty: 'Киновечеров пока не было.', chosenBy: 'выбор: {name}', ongoing: 'Смотрим', seriesDone: 'Сериал досмотрен',
      notRated: 'без оценки', average: 'Средняя', yourRating: 'Твоя оценка:', comment: 'Комментарий…', delete: 'Удалить', deleteConfirm: 'Удалить запись? (в итоге не посмотрели)',
    },
    stats: { title: 'Статистика группы', watched: 'Посмотрено вместе:', average: 'Средняя оценка:', moods: 'Любимые настроения:', regions: 'Любимые регионы:', choosers: 'Кто выбирает лучшие фильмы:' },
    group: {
      select: 'Текущая группа', you: 'ты', jokerYes: 'Джокер доступен', jokerNo: 'Джокер уже использован в этом месяце', up: 'Выше', down: 'Ниже', remove: 'Удалить',
      orderHelp: 'Порядок определяет, чья очередь выбирать.', invite: 'Пригласить', inviteText: 'Присоединяйся к нашей группе «{name}» в Kino', copied: 'Ссылка скопирована', copyThis: 'Скопируй ссылку:',
      settings: 'Настройки группы', name: 'Название группы', profile: 'Мой профиль', mine: 'Мои группы', leave: 'Выйти из группы на этом устройстве',
      leaveConfirm: 'Выйти из «{name}» на этом устройстве? Вернуться можно по ссылке-приглашению.', removeConfirm: 'Удалить {name} из группы?', removed: 'Ты больше не состоишь в этой группе.',
    },
    settings: { title: 'Настройки', lang: 'Язык', country: 'Страна для «Где посмотреть»' },
    backup: { title: 'Резервная копия', help: 'Экспортируй данные группы в файл JSON или восстанови файл в эту группу.', export: 'Экспорт', import: 'Импорт', invalid: 'Это не резервная копия Kino.', confirm: 'Восстановить файл в «{name}»? Совпадающие данные будут заменены.', done: 'Копия восстановлена' },
    about: { title: 'О приложении', text: 'Kino помогает выбрать, что посмотреть. Никакого стриминга и ссылок.', justwatch: 'Данные «Где посмотреть» предоставлены JustWatch.' },
    error: { generic: 'Что-то пошло не так, попробуй ещё раз.', network: 'Проблема с сетью, повторная попытка…' },
  },
};

// Langue : celle choisie dans les réglages, sinon celle du téléphone (fr, ru, sinon en)
const phone = (navigator.language || 'en').slice(0, 2);
export let lang = LANGS.includes(localStorage.getItem('kino.lang')) ? localStorage.getItem('kino.lang') : ['fr', 'ru'].includes(phone) ? phone : 'en';

export function setLang(l) {
  lang = l;
  localStorage.setItem('kino.lang', l);
}

const lookup = (l, key) => key.split('.').reduce((o, k) => o?.[k], dict[l]);

// t('cle.sous-cle', { variable }) : texte dans la langue courante, sinon en anglais
export function t(key, vars = {}) {
  // Clé inconnue (donnée corrompue) : on n'affiche que des caractères sûrs
  const value = lookup(lang, key) ?? lookup('en', key) ?? String(key).replace(/[^\w.-]/g, '');
  return typeof value === 'string' ? value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : value;
}
