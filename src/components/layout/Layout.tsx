import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { DemoBanner } from './DemoBanner'
import { DemoScenarioSelect } from './DemoScenarioSelect'
import { NetworkBanner } from './NetworkBanner'
import styles from './Layout.module.css'

export function Layout() {
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)

  // Une SPA ne recharge pas la page : sans ça, le lecteur d'écran n'annonce rien
  // et le focus reste sur le lien cliqué. Au premier affichage, le navigateur gère déjà.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    document.querySelector<HTMLElement>('main h1')?.focus()
  }, [pathname])

  return (
    <div className={styles.shell}>
      <a href="#contenu" className={styles.skipLink}>
        Aller au contenu
      </a>
      <header className={styles.header}>
        <div className={`${styles.inner} ${styles.headerInner}`}>
          <Link to="/" className={styles.wordmark}>
            Velvet<span className="sr-only">, accueil</span>
          </Link>
          <nav aria-label="Principale">
            <NavLink to="/billets" className={styles.navLink}>
              Mes billets
            </NavLink>
          </nav>
        </div>
      </header>
      <NetworkBanner />

      <main id="contenu" className={styles.main}>
        <div className={styles.banner}>
          <DemoBanner />
        </div>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.inner} ${styles.footerInner}`}>
          <p>Projet de démonstration non officiel, réalisé dans le cadre d'une candidature.</p>
          <DemoScenarioSelect />
        </div>
      </footer>
    </div>
  )
}
