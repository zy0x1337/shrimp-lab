/**
 * App.tsx — Shrimp Lab shell
 *
 * Fixes applied (whitescreen):
 *  1. Removed `display: contents` from motion.div — Framer Motion cannot
 *     apply transforms on a contents-box; replaced with a full-width block wrapper.
 *  2. Removed <ScrollRestoration> — only works with RouterProvider (RR v7
 *     data API), not BrowserRouter. Replaced with a useEffect-based scroll
 *     reset inside AnimatedOutlet.
 *  3. Kept lazy() + named-export pattern — this was already correct.
 */
import {
  lazy,
  Suspense,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { DataProvider, useData } from './lib/DataContext'
import { ThemeProvider } from './lib/ThemeContext'
import { Sidebar } from './components/layout/Sidebar'
import { MobileHeader } from './components/layout/MobileHeader'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { PageSkeleton } from './components/ui/PageSkeleton'

// ─── Lazy page imports ────────────────────────────────────────────────────────
const Dashboard               = lazy(() => import('./pages/Dashboard').then(m               => ({ default: m.Dashboard })))
const Reference               = lazy(() => import('./pages/Reference').then(m               => ({ default: m.Reference })))
const ParameterChecker        = lazy(() => import('./pages/ParameterChecker').then(m        => ({ default: m.ParameterChecker })))
const TdsCalculator           = lazy(() => import('./pages/TdsCalculator').then(m           => ({ default: m.TdsCalculator })))
const RemineralizationPlanner = lazy(() => import('./pages/RemineralizationPlanner').then(m => ({ default: m.RemineralizationPlanner })))
const BreedingTimeline        = lazy(() => import('./pages/BreedingTimeline').then(m        => ({ default: m.BreedingTimeline })))
const BreedingPairs           = lazy(() => import('./pages/BreedingPairs').then(m           => ({ default: m.BreedingPairs })))
const Logbook                 = lazy(() => import('./pages/Logbook').then(m                 => ({ default: m.Logbook })))
const ParameterCharts         = lazy(() => import('./pages/ParameterCharts').then(m         => ({ default: m.ParameterCharts })))
const TdsCreepAnalyzer        = lazy(() => import('./pages/TdsCreepAnalyzer').then(m        => ({ default: m.TdsCreepAnalyzer })))
const MoltTracker             = lazy(() => import('./pages/MoltTracker').then(m             => ({ default: m.MoltTracker })))
const GradeLog                = lazy(() => import('./pages/GradeLog').then(m                => ({ default: m.GradeLog })))
const ColonyEstimator         = lazy(() => import('./pages/ColonyEstimator').then(m         => ({ default: m.ColonyEstimator })))
const SettingsPage            = lazy(() => import('./pages/Settings').then(m                => ({ default: m.SettingsPage })))

// ─── Page transition config ────────────────────────────────────────────────────
// 120ms opacity fade + subtle 6px upward slide on enter, -4px on exit.
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
}

const pageTransition = {
  duration: 0.12,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
}

// ─── AnimatedOutlet ───────────────────────────────────────────────────────────
function AnimatedOutlet() {
  const location = useLocation()

  // Scroll reset — BrowserRouter-compatible replacement for <ScrollRestoration>.
  // Runs after every pathname change, after the new page has painted.
  useEffect(() => {
    const el = document.getElementById('main-content')
    if (el) el.scrollTop = 0
    // Also reset window scroll for pages that overflow the viewport
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/*
        FIX: do NOT use display:contents here.
        Framer Motion needs a real box to apply opacity/transform on.
        width:100% + minHeight:0 keeps layout neutral.
      */}
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ width: '100%', minHeight: 0 }}
      >
        <Suspense fallback={<PageSkeleton />}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────────
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSidebar  = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <MobileHeader isOpen={sidebarOpen} onToggle={openSidebar} />

      {sidebarOpen && (
        <div className="sidebar-overlay" aria-hidden="true" onClick={closeSidebar} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main id="main-content" className="main-content">
        <AnimatedOutlet />
      </main>
    </div>
  )
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
// Bridges DataProvider → ThemeProvider: reads stored theme from IndexedDB
// state and passes it as initial value so ThemeProvider sets the correct
// data-mode on first paint without flicker.
function AppShell({ children }: { children: ReactNode }) {
  const { data } = useData()
  return (
    <ThemeProvider storedTheme={data.settings.theme}>
      {children}
    </ThemeProvider>
  )
}

// ─── App (root export) ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AppShell>
          <Routes>
            <Route element={<Layout />}>
              <Route index                 element={<Dashboard />} />
              <Route path="reference"      element={<Reference />} />
              <Route path="parameters"     element={<ParameterChecker />} />
              <Route path="calculator"     element={<TdsCalculator />} />
              <Route path="remineralize"   element={<RemineralizationPlanner />} />
              <Route path="breeding"       element={<BreedingTimeline />} />
              <Route path="breeding-pairs" element={<BreedingPairs />} />
              <Route path="logbook"        element={<Logbook />} />
              <Route path="charts"         element={<ParameterCharts />} />
              <Route path="tds-creep"      element={<TdsCreepAnalyzer />} />
              <Route path="molt"           element={<MoltTracker />} />
              <Route path="grades"         element={<GradeLog />} />
              <Route path="colony"         element={<ColonyEstimator />} />
              <Route path="settings"       element={<SettingsPage />} />
            </Route>
          </Routes>
        </AppShell>
      </DataProvider>
    </BrowserRouter>
  )
}
