import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ButtonLink, PageTitle } from '../components/ui'
import styles from './Page.module.css'

export function NotFoundPage() {
  useDocumentTitle('Page introuvable')
  return (
    <div className={styles.stack}>
      <PageTitle>Cette page n'existe pas</PageTitle>
      <p>Le lien est peut-être incomplet ou la page a été déplacée.</p>
      <div>
        <ButtonLink to="/">Rechercher un trajet</ButtonLink>
      </div>
    </div>
  )
}
