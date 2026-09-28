import type { RouteObject } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { NotFoundPage } from './pages/NotFoundPage'
import { ResultsPage } from './pages/ResultsPage'
import { SearchPage } from './pages/SearchPage'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <SearchPage /> },
      { path: 'trajets', element: <ResultsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
