import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { LoginPage } from './features/auth'
import { AiChat } from './features/ai/AiChat'
import { ListingsPage } from './features/listings'
import { Navbar } from './shared/components/Navbar'
import { NotFound } from './shared/components/NotFound'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { Spinner } from './shared/components/Spinner'

const ListingDetail = lazy(() =>
  import('./features/listings/pages/ListingDetail').then((m) => ({
    default: m.ListingDetail,
  })),
)

const DashboardPage = lazy(() =>
  import('./features/auth/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

export default function App() {
  const location = useLocation()

  useEffect(() => {
    NProgress.start()

    const id = window.setTimeout(() => {
      NProgress.done()
    }, 100)

    return () => window.clearTimeout(id)
  }, [location.pathname])

  return (
    <>
      <Navbar />

      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <AiChat />
    </>
  )
}