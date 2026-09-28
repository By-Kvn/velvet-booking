# CLAUDE.md · Projet démo Velvet (candidature Front-end Engineer)

Ce fichier donne tout le contexte du projet. Lis-le en entier au début de chaque session, puis lis `NOTES.md`.

## 1. Pourquoi ce projet existe

Je m'appelle Kevin, développeur front-end à Paris. Je postule chez **Velvet**, premier opérateur indépendant de trains à grande vitesse en France (lancement commercial en 2028, lignes Paris ↔ Bordeaux, Nantes, Angers, Rennes, trajets directs de 2 h en moyenne). Poste visé : **Front-end Engineer React / TypeScript**, rattaché au Responsable des développements.

L'annonce demande 5 ans d'expérience. Je ne les ai pas encore, donc je ne peux pas me démarquer sur le CV seul. Ce projet est ma réponse : **une mini application de réservation de billets Velvet qui prouve concrètement que je sais faire ce que le poste demande.** Elle sera envoyée avec ma candidature (lien de démo + repo GitHub) et je devrai la défendre en entretien technique.

### Ce que l'annonce valorise (chaque point doit se voir dans le projet)

- Parcours voyageurs en React + TypeScript : recherche, achat de billets, gestion de compte, information voyageur
- Logique métier, appels API, validations, gestion des erreurs
- **Usages web en mobilité : indisponibilités réseau** (point explicitement cité)
- Évolution d'un design system, intégration d'API
- **Intérêt fort pour l'accessibilité**
- Tests unitaires, composants et end-to-end
- Qualité, sécurité, **cas limites et risques de régression**
- Sens de l'utilisateur, pragmatisme, approche hands-on
- Bonus : AWS, mobile, nouveaux usages de l'IA
- Valeurs Velvet : orientation client, innovation, simplification, plaisir de coopération

### Mon profil (pour calibrer le niveau et les arguments)

- Alternance chez Colorz (agence Shopify Platinum Partner) : thèmes Shopify/Liquid pour marques premium, motion (GSAP)
- Avant : Neocity (SaaS pour collectivités) en Angular / Ionic / TypeScript, en équipe agile, avec des tests Jest
- Certifications AWS Cloud Practitioner et PSM I, audit d'accessibilité réalisé en agence, mémoire sur l'IA générative en production front-end
- Point à renforcer, selon un retour d'entretien récent : fondamentaux JavaScript et debugging en live. **Ce projet doit aussi me faire progresser là-dessus.**

## 2. Comment tu travailles avec moi (important)

Je dois pouvoir expliquer chaque ligne en entretien. Donc :

1. **Avant chaque ticket** : propose un plan court (fichiers touchés, approche, alternatives écartées) et attends ma validation.
2. **Petits pas** : un ticket = un commit. Propose le message au format Conventional Commits en anglais (`feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`).
3. **Après chaque changement**, explique en 3 à 5 lignes le *pourquoi* des choix, et donne **la question qu'un recruteur technique pourrait me poser dessus**, avec les éléments de réponse.
4. **Mode guidé** : quand j'écris « mode guidé », tu ne codes pas. Tu me donnes le ticket (objectif, critères d'acceptation, indices progressifs), je code, puis tu fais une code review exigeante comme le ferait un lead.
5. Avant de dire qu'un ticket est terminé : `npm run typecheck` et `npm test` passent, sans warning.
6. Tu mets à jour `NOTES.md` (journal de décisions) à chaque décision technique notable.
7. Tu n'ajoutes aucune dépendance sans justifier pourquoi, et pourquoi pas une solution native.
8. Si tu repères un bug ou une dette dans le code existant, signale-le au lieu de le corriger en silence.

## 3. Stack et conventions

- Vite + React 19 + TypeScript **strict** (`noUncheckedIndexedAccess` activé). Aucun `any`, aucun `as` non justifié.
- **Pas de Next.js** : parcours interactif sans enjeu SEO, et le hors-ligne est plus simple sur une SPA (choix documenté dans `NOTES.md`).
- React Router, TanStack Query, React Hook Form + Zod, MSW, Vitest + Testing Library, Playwright + axe (jours 4-5), vite-plugin-pwa (jour 4).
- Styles : CSS Modules + tokens dans `src/styles/tokens.css`. **Aucune valeur en dur** dans les composants.
- Textes de l'interface en français, clairs et orientés action : un bouton dit ce qu'il fait (« Réserver ce trajet », pas « Valider »). Les erreurs expliquent quoi faire, sans s'excuser.
- Pas de tiret long (—) dans les textes produits (UI, README, docs) : utiliser une autre ponctuation.
- Formats : prix avec `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`, heures avec `Intl.DateTimeFormat` en fuseau `Europe/Paris`, durées au format « 2 h 10 ».
- Composants : un composant par fichier, props typées, pas de logique métier dans les composants UI de `components/ui`.

### Règles d'accessibilité (non négociables)

- Navigation 100 % clavier, focus toujours visible, ordre logique
- Labels reliés, erreurs annoncées (`aria-describedby`, `aria-invalid`), jamais portées par la couleur seule
- Contrastes WCAG AA minimum, cibles tactiles de 44 px
- Un `<h1>` par page, `document.title` mis à jour à chaque route, focus déplacé sur le titre au changement de page
- Contenus dynamiques annoncés (`role="status"` / `role="alert"`), `prefers-reduced-motion` respecté
- Composants natifs d'abord (`<select>`, `<button>`, `<input type="date">`) avant tout composant custom

## 4. État actuel (jour 1 terminé)

```
src/
  api/            schemas.ts (contrat Zod), types.ts (types déduits), client.ts (request, ApiError, getErrorMessage),
                  trips.ts, bookings.ts, client.test.ts
  mocks/          handlers.ts, scenario.ts, browser.ts, node.ts, data/stations.ts, data/trips.ts
  components/ui/  Button, TextField, Select, Alert, Spinner (+ Button.test.tsx)
  styles/         tokens.css, global.css
  queryClient.ts  retry uniquement sur erreurs passagères, jamais sur les mutations
  App.tsx         page bac à sable temporaire (à remplacer au jour 2)
  test/setup.ts   MSW node + jest-dom
NOTES.md          journal de décisions
```

Points clés déjà en place :
- Réponses API validées à l'exécution par Zod : un contrat cassé lève `INVALID_RESPONSE`
- `ApiError` avec un code (`NETWORK`, `TIMEOUT`, `NOT_FOUND`, `SOLD_OUT`, `VALIDATION`, `SERVER`, `INVALID_RESPONSE`) et `isRetryable`
- Timeout sur chaque requête (8 s, 15 s pour l'achat), annulation via `AbortSignal`
- API simulée : 5 gares, lignes depuis Paris dans les deux sens, liaisons non desservies renvoient `[]`, le train de 08h15 est complet en Standard
- Scénarios activables via `?scenario=` : `slow`, `timeout`, `error`, `network`, `sold-out`, `invalid-contract`
- 11 tests verts

Piège connu : un rechargement forcé (Cmd + Shift + R) contourne le service worker MSW. Recharger normalement.

## 5. Direction artistique : rester dans l'univers Velvet

Référence : https://www.velvet.fr/

**Ticket 0, à faire en premier** : analyse le site (HTML, CSS, variables, polices chargées, couleurs calculées) et propose-moi une mise à jour de `tokens.css` qui reprend l'identité Velvet : palette, typographies (si la police de marque est propriétaire, propose l'alternative libre la plus proche via Fontsource), rayons, rythme d'espacement. Montre-moi le tableau « valeur actuelle → valeur Velvet » avant de modifier. Vérifie chaque couple texte/fond en contraste AA et ajuste si nécessaire, en le signalant.

Ce que dit déjà le site sur l'identité de marque :
- Promesse : **« plaisir & simplicité »**, « innover c'est avant tout simplifier », le voyage à grande vitesse réinventé
- Ambiance photo : lumière douce et rosée sur fond sombre, sensation de confort (d'où le nom Velvet, le velours)
- Chiffres clés : 10 millions de places supplémentaires par an, 2 h de trajet en moyenne, 12 trains Alstom Avelia Horizon à deux étages
- Ton : chaleureux, humain, direct, centré sur le voyageur

Garde-fous :
- **Ne pas utiliser le logo officiel ni les photos du site** (propriété de Velvet). Utiliser un wordmark texte « Velvet ».
- Ajouter dans le footer et le README : « Projet de démonstration non officiel, réalisé dans le cadre d'une candidature. »
- L'identité de marque habille l'interface, elle ne passe jamais avant l'utilisabilité et l'accessibilité. Une appli de réservation doit rester sobre, lisible et rapide.
- Un seul moment « signature » visuel (par exemple l'en-tête de recherche), le reste reste calme et discipliné.

## 6. Backlog

### Ticket 1 · Message d'erreur trompeur (bug connu)
`getErrorMessage` renvoie « Ce trajet n'existe plus » pour toute 404, y compris le chargement des gares. Le message doit rester juste quel que soit l'appel. Deux pistes : message générique, ou message personnalisable par l'appelant. **À faire en mode guidé.** Ajouter un test.

### Jour 2 · Routing, recherche, résultats
- Routes : `/` (recherche), `/trajets` (résultats), `/reservation/:tripId`, `/confirmation/:bookingId`, `/billets`, page 404
- Layout commun : en-tête avec wordmark, lien d'évitement « Aller au contenu », footer avec la mention non officielle
- Formulaire de recherche (React Hook Form + Zod) : départ ≠ arrivée, date ≥ aujourd'hui, 1 à 9 passagers, bouton d'inversion départ/arrivée accessible
- **L'URL est la source de vérité** des paramètres de recherche (`/trajets?from=PMO&to=NTE&date=...&passengers=2`) : partageable, et le bouton retour fonctionne
- Résultats : états chargement (squelette), vide (liaison non desservie, avec suggestion), erreur (message + Réessayer), succès
- Carte trajet : horaires, durée, numéro de train, prix par classe, places restantes quand il en reste peu, classe complète désactivée avec explication textuelle
- Tests composants sur le formulaire et sur chaque état des résultats

### Jour 3 · Réservation et billets
- Page réservation : récapitulatif du trajet, choix de classe, un bloc par passager (`useFieldArray`), e-mail
- Mutation `createBooking` : bouton en `loading`, aucune double soumission, pas de retry automatique
- Gestion du 409 `SOLD_OUT` : message clair et retour aux résultats sans perdre la recherche
- Page confirmation : référence de réservation mise en avant, récapitulatif
- Page « Mes billets » : billets sauvegardés en localStorage, **revalidés avec Zod à la lecture** (données locales = données non fiables)
- Tests : parcours de réservation, cas complet, erreur serveur

### Jour 4 · Mobilité et accessibilité
- Hook `useOnlineStatus` (événements `online` / `offline`) + bannière réseau annoncée
- PWA (vite-plugin-pwa) : app installable, shell en cache, **billets consultables sans réseau**
- Hors ligne : recherche et achat désactivés avec explication, jamais d'écran blanc
- Passe accessibilité complète : clavier, VoiceOver, zoom 200 %, `prefers-reduced-motion`, audit axe sans violation
- Responsive mobile d'abord (cible : un voyageur sur quai ou dans le train)

### Jour 5 · Qualité et livraison
- Playwright : parcours complet recherche → confirmation → billets, cas complet, cas hors ligne, audit axe sur chaque page
- GitHub Actions : typecheck, lint, tests unitaires, build, e2e à chaque push
- Déploiement Vercel (réécriture SPA, MSW actif en production pour la démo)
- README : pitch en 3 lignes, lien de démo, captures, tableau des scénarios `?scenario=`, choix techniques (depuis `NOTES.md`), limites connues, ce que je ferais ensuite (vraie authentification OIDC, i18n, monitoring, app agent de bord)

### Bonus (seulement si tout le reste est fini et solide)
Écran « Agent de bord » : liste des passagers d'un train avec contrôle de billet par référence, pensé pour fonctionner hors ligne. Il répond directement aux « applications métier pour les agents de bord » de l'annonce.

## 7. Définition de « terminé » pour chaque ticket

- Critères d'acceptation remplis, cas limites traités
- Typecheck et tests verts, nouveaux tests ajoutés
- Utilisable au clavier, rien d'annoncé de travers au lecteur d'écran
- `NOTES.md` à jour si une décision a été prise
- Message de commit proposé
- Explication + question d'entretien probable fournies