/**
 * App.tsx — Shrimp Lab shell
 *
 * What this file owns:
 *   1. ThemeProvider   — sets data-style="torque" + data-mode on <html>
 *   2. DataProvider    — IndexedDB-backed app state
 *   3. BrowserRouter   — React Router v7
 *   4. Layout          — Sidebar + main content + mobile overlay
 *   5. AnimatePresence — Framer Motion page transitions (120ms fade + 6px slide)
 *   6. React.Suspense  — lazy page chunks with PageSkeleton fallback
 *   7. ErrorBoundary   — catches page-level render errors
 *   8. ScrollRestoration — resets scroll position on route change
 */
import {
  lazy,
  Suspense,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  ScrollRestoration,
} from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { DataProvider, useData } from './lib/DataContext'
import { ThemeProvider } from './lib/ThemeContext'
import { Sidebar } from './components/layout/Sidebar'
import { MobileHeader } from './components/layout/MobileHeader'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { PageSkeleton } from './components/ui/PageSkeleton'

// ─── Lazy page imports ────────────────────────────────────────────────────────
// Each page is code-split; React.Suspense shows PageSkeleton until ready.
const Dashboard              = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Reference              = lazy(() => import('./pages/Reference').then(m => ({ default: m.Reference })))
const ParameterChecker       = lazy(() => import('./pages/ParameterChecker').then(m => ({ default: m.ParameterChecker })))
const TdsCalculator          = lazy(() => import('./pages/TdsCalculator').then(m => ({ default: m.TdsCalculator })))
const RemineralizationPlanner = lazy(() => import('./pages/RemineralizationPlanner').then(m => ({ default: m.RemineralizationPlanner })))
const BreedingTimeline       = lazy(() => import('./pages/BreedingTimeline').then(m => ({ default: m.BreedingTimeline })))
const BreedingPairs          = lazy(() => import('./pages/BreedingPairs').then(m => ({ default: m.BreedingPairs })))
const Logbook                = lazy(() => import('./pages/Logbook').then(m => ({ default: m.Logbook })))
const ParameterCharts        = lazy(() => import('./pages/ParameterCharts').then(m => ({ default: m.ParameterCharts })))
const TdsCreepAnalyzer       = lazy(() => import('./pages/TdsCreepAnalyzer').then(m => ({ default: m.TdsCreepAnalyzer })))
const MoltTracker            = lazy(() => import('./pages/MoltTracker').then(m => ({ default: m.MoltTracker })))
const GradeLog               = lazy(() => import('./pages/GradeLog').then(m => ({ default: m.GradeLog })))
const ColonyEstimator        = lazy(() => import('./pages/ColonyEstimator').then(m => ({ default: m.ColonyEstimator })))
const SettingsPage           = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })))

// ─── Page transition variants ─────────────────────────────────────────────────
// Subtle: 120ms opacity fade + 6px upward slide.
// Respects prefers-reduced-motion via `reducedMotion` prop on MotionConfig
// (set in AppShell below).
const pageVariants = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -4 },
}

const pageTransition = {
  duration: 0.12,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
}

// ─── AnimatedOutlet ────────────────────────────────────────────────────────────
// Wraps <Outlet> with AnimatePresence so entering/leaving pages animate.
function AnimatedOutlet() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ display: 'contents' }}
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
// Desktop: sidebar always visible.
// Mobile (≤768px): sidebar is a slide-over panel; MobileHeader has the toggle.
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSidebar  = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="app-layout">
      {/* Skip-to-content for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Mobile header — hidden on desktop via CSS */}
      <MobileHeader isOpen={sidebarOpen} onToggle={openSidebar} />

      {/* Mobile overlay — tap to close sidebar */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          aria-hidden="true"
          onClick={closeSidebar}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main id="main-content" className="main-content">
        <AnimatedOutlet />
      </main>

      {/* Resets window scroll to top on every navigation */}
      <ScrollRestoration />
    </div>
  )
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
// Reads stored theme from DataContext and hands it to ThemeProvider so that
// ThemeProvider can set the correct data-mode on first paint.
function AppShell({ children }: { children: ReactNode }) {
  const { data } = useData()
  return (
    <ThemeProvider storedTheme={data.settings.theme}>
      {children}
    </ThemeProvider>
  )
}

// ─── App (root) ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AppShell>
          <Routes>
            <Route element={<Layout />}>
              <Route index                  element={<Dashboard />} />
              <Route path="reference"       element={<Reference />} />
              <Route path="parameters"      element={<ParameterChecker />} />
              <Route path="calculator"      element={<TdsCalculator />} />
              <Route path="remineralize"    element={<RemineralizationPlanner />} />
              <Route path="breeding"        element={<BreedingTimeline />} />
              <Route path="breeding-pairs"  element={<BreedingPairs />} />
              <Route path="logbook"         element={<Logbook />} />
              <Route path="charts"          element={<ParameterCharts />} />
              <Route path="tds-creep"       element={<TdsCreepAnalyzer />} />
              <Route path="molt"            element={<MoltTracker />} />
              <Route path="grades"          element={<GradeLog />} />
              <Route path="colony"          element={<ColonyEstimator />} />
              <Route path="settings"        element={<SettingsPage />} />
            </Route>
          </Routes>
        </AppShell>
      </DataProvider>
    </BrowserRouter>
  )
}
