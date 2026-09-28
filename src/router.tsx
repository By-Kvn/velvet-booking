import type { RouteObject } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { BookingPage } from './pages/BookingPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ResultsPage } from './pages/ResultsPage'
import { SearchPage } from './pages/SearchPage'
import { TicketsPage } from './pages/TicketsPage'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <SearchPage /> },
      { path: 'trajets', element: <ResultsPage /> },
      { path: 'reservation/:tripId', element: <BookingPage /> },
      { path: 'confirmation/:bookingId', element: <ConfirmationPage /> },
      { path: 'billets', element: <TicketsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
