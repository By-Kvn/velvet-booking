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
