# Journal de décisions

À transformer en section « Choix techniques » du README au jour 5.

## Jour 1

- **Vite plutôt que Next** : parcours interactif et authentifié, sans enjeu SEO. Le hors-ligne est plus simple sur une SPA.
- **Validation Zod des réponses API** : les types sont déduits des schémas (une seule source de vérité) et un contrat cassé côté backend est détecté tout de suite (`INVALID_RESPONSE`) au lieu de corrompre l'UI.
- **Erreurs typées (`ApiError` + code)** : l'UI affiche un message qui dit quoi faire, et React Query ne réessaie que les erreurs passagères (réseau, timeout, 5xx).
- **`NOT_FOUND` neutre par défaut** : le client HTTP ne sait pas quelle ressource manque. `getErrorMessage` dit « Cette information est introuvable. » L'écran qui connaît le contexte passe `{ notFound: "…" }` (ex. un trajet). On n'affiche pas `error.message` : la copie d'interface reste en français et orientée action, indépendante du texte technique du serveur.
- **Aucune relance automatique sur l'achat** : risque de double réservation.
- **Timeout sur chaque requête** (8 s, 15 s pour l'achat) : en TGV, une requête peut rester pendue sans jamais échouer.
- **Scénarios MSW via `?scenario=`** : chaque cas limite est testable par n'importe qui, sans toucher au code.
- **Design system** : tokens CSS uniquement, cibles tactiles 44 px, focus visible, erreurs non portées que par la couleur, bouton en chargement qui garde le focus (`aria-busy` plutôt que `disabled`).
- **Charte Velvet (ticket 0)** : palette reprise de velvet.fr (vert `#003E40`, rose `#EFAAFE`). Le rose ne sert qu'en fond, avec du texte vert (6.7:1) : en texte sur blanc il n'atteint que 1.8:1. RocGrotesk est propriétaire, donc Archivo élargi le remplace pour les titres, et Work Sans (déjà la police du site) sert au texte. Fontsource plutôt que Google Fonts : polices auto-hébergées, pas de requête vers un tiers (RGPD), et disponibles hors ligne pour la PWA.
- **Node 24 figé** (`.nvmrc` + `engines`) : jsdom 30 et vitest 5 ne démarrent pas sous Node 20.

## Jour 2

- **L'URL est la source de vérité de la recherche** : `/trajets?from=PMO&to=NTE&date=…&passengers=2`. Lien partageable, bouton retour fiable, pas d'état global à synchroniser. L'URL est validée par Zod comme n'importe quelle donnée externe, avec un cas « date passée » distinct pour les vieux liens partagés.
- **Focus déplacé sur le `<h1>` à chaque navigation** + `document.title` par page : une SPA ne recharge pas la page, sans ça le lecteur d'écran n'annonce rien.
- **Règle métier hors des composants** (`getFareAvailability`) : complet, pas assez de places pour le groupe, peu de places. Testée seule, sans rendu.
- **Classe complète : un texte, pas un bouton désactivé.** Un bouton `disabled` n'est pas focusable et n'explique rien ; « Complet » est lu dans l'ordre naturel.
- **Liens stylés en bouton (`ButtonLink`)** : choisir un tarif est une navigation, donc un lien (clic molette, ouvrir dans un onglet).
- **Formats à l'heure de Paris** (`Intl`, fuseau `Europe/Paris`) : un voyageur à l'étranger voit l'heure du quai, pas celle de son téléphone.
- **Sélecteur de scénario dans le footer** : un recruteur teste pannes et cas limites en deux clics, sans connaître `?scenario=`.
- **Tests sur l'application complète** (`renderRoute`) : mêmes routes et même layout qu'en production, API simulée par MSW. On teste ce que voit l'utilisateur, pas l'implémentation.
- **Bannière « Mode démo »** dès qu'un scénario de panne est actif : mémorisé en session, il pourrait passer pour un vrai bug. Un bouton ramène au fonctionnement normal.
- **Chargement qui parle** : après un premier échec, « Le réseau est lent. Nouvelle tentative en cours. » Avec un timeout de 8 s et 2 relances, un spinner muet pourrait tourner 30 s, exactement le cas d'un voyageur en tunnel.

## Jour 3

- **Double réservation impossible** : bouton en `loading` (reste focusable, `aria-busy`), garde `isPending` dans `onSubmit`, aucune relance automatique de la mutation. Testé avec un double clic + Entrée sur réponse lente : une seule requête POST.
- **Timeout à l'achat ≠ échec** : la réservation a pu être enregistrée côté serveur. Le message invite à vérifier ses e-mails avant de réessayer, au lieu d'un « Réessayer » qui risquerait un doublon. En production : clé d'idempotence envoyée avec la requête.
- **409 `SOLD_OUT`** : message clair + lien vers les résultats reconstruit depuis le trajet (gares, date à Paris, voyageurs). La recherche n'est pas perdue.
- **`navigate(..., { replace: true })` après l'achat** : le retour arrière ne ramène pas sur un formulaire déjà soumis.
- **Billets en `localStorage`, revalidés par Zod à la lecture, billet par billet** : un billet corrompu ou d'une ancienne version est écarté sans faire disparaître les autres. Clé versionnée (`velvet:tickets:v1`). `useSyncExternalStore` + événement `storage` : un achat dans un autre onglet apparaît partout.
- **Classe : radios natifs dans un `fieldset`** plutôt que des cartes cliquables custom : groupe annoncé, flèches clavier gratuites. La classe demandée est présélectionnée, sinon la première disponible.
- **Paramètres d'URL de réservation bricolés** (`?passengers=99`) : repli sûr avec `.catch()` de Zod plutôt qu'une page d'erreur.

## Jour 4

- **API simulée dans la page plutôt que par le service worker de MSW** : un seul service worker peut contrôler `/`, et il faut celui de la PWA (cache hors ligne). `fetch` est intercepté et résolu avec `getResponse(handlers)` de MSW : mêmes handlers que les tests. Bonus : plus de piège Cmd + Shift + R, et le mode « Offline » des DevTools se comporte comme une vraie API injoignable.
- **L'interception respecte l'annulation** (`AbortSignal`) : sans ça, le timeout de 8 s du client ne couperait pas une réponse simulée lente.
- **Réseau : une seule source de vérité, `onlineManager` de React Query**, initialisé avec `navigator.onLine` au démarrage (une PWA peut s'ouvrir sans réseau). L'interface et les requêtes en pause ne peuvent pas se contredire.
- **Requête en pause hors ligne ⇒ message explicite** (`fetchStatus === 'paused'`) au lieu d'un squelette infini ; elle reprend seule au retour du réseau.
- **Achat bloqué hors ligne dans `onSubmit`** : sinon React Query mettrait la mutation en pause et l'enverrait au retour du réseau, à l'insu du voyageur. Bouton `aria-disabled` + explication reliée par `aria-describedby`, saisie conservée.
- **Bannière réseau dans une région live toujours présente** : annonce fiable de la perte et du retour (« Connexion rétablie. »).
- **PWA (vite-plugin-pwa / Workbox)** : coque et polices précachées, `navigateFallback` pour que n'importe quelle URL (`/billets`) s'ouvre sans réseau. Dépendance justifiée : écrire et versionner un service worker de precache à la main est une source classique de bugs de cache. Icônes PNG générées par script, sans dépendance d'image.
