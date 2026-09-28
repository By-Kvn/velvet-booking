import { useEffect } from 'react'

/** Chaque page a un titre d'onglet distinct : c'est la première chose annoncée par un lecteur d'écran. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Velvet`
  }, [title])
}
