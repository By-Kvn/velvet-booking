import { Alert, ButtonLink } from './ui'

/** Remplace un chargement qui ne pourra pas aboutir : jamais de squelette infini ni d'écran blanc hors ligne. */
export function OfflineNotice({ title }: { title: string }) {
  return (
    <Alert
      tone="info"
      title={title}
      action={
        <ButtonLink to="/billets" variant="secondary">
          Voir mes billets
        </ButtonLink>
      }
    >
      Le chargement reprendra automatiquement au retour du réseau. Vos billets restent consultables hors ligne.
    </Alert>
  )
}
