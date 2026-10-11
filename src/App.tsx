import { lazy, Suspense, useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { PageLoading } from './components/layout/PageLoading'
import { Toast } from './components/layout/Toast'
import { AppErrorBoundary } from './components/layout/AppErrorBoundary'
import TodayPage from './features/today/TodayPage'
import { navItems, type Page } from './app/navigation'
import type { Decision } from './engine/types'

const SimulatorPage = lazy(() => import('./features/simulator/SimulatorPage'))
const ForecastPage = lazy(() => import('./features/forecast/ForecastPage'))
const PlansPage = lazy(() => import('./features/plans/PlansPage'))

export function App() {
  const [page, setPage] = useState<Page>('today')
  const [simDecision, setSimDecision] = useState<Decision>()

  const goSim = (decision: Decision) => {
    setSimDecision(decision)
    setPage('simulator')
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true }))
  }, [page])

  return <div className="app">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Header page={page} setPage={setPage} />
    <main id="main-content" tabIndex={-1}>
      <AppErrorBoundary><Suspense fallback={<PageLoading />}>
          {page === 'today' && <TodayPage setPage={setPage} />}
          {page === 'simulator' && <SimulatorPage initial={simDecision} />}
          {page === 'forecast' && <ForecastPage />}
          {page === 'plans' && <PlansPage goSim={goSim} />}
        </Suspense></AppErrorBoundary>
    </main>
    <Footer />
    <Toast />
    <nav className="bottom-nav" aria-label="Mobile navigation">{navItems.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}><item.icon aria-hidden="true" /><span>{item.short}</span></button>)}</nav>
  </div>
}
