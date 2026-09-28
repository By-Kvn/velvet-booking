import { useSearchParams } from 'react-router-dom'
import { PageTitle } from '../components/ui'
import { readSearchDefaults } from '../features/search/searchCriteria'
import { SearchForm } from '../features/search/SearchForm'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './SearchPage.module.css'

export function SearchPage() {
  useDocumentTitle('Rechercher un trajet')
  const [params] = useSearchParams()

  return (
    <div className={styles.page}>
      {/* Le moment « signature » de l'interface : le reste reste sobre. */}
      <section className={styles.hero} aria-labelledby="search-title">
        <PageTitle className={styles.title}>
          <span id="search-title">Où allez-vous ?</span>
        </PageTitle>
        <p className={styles.tagline}>
          Paris, Bordeaux, Nantes, Angers et Rennes en trains directs. 2 h de trajet en moyenne.
        </p>
      </section>
      <div className={styles.card}>
        <SearchForm defaultValues={readSearchDefaults(params)} />
      </div>
    </div>
  )
}
