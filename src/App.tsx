import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { DataProvider } from './lib/DataContext'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Reference } from './pages/Reference'
import { ParameterChecker } from './pages/ParameterChecker'
import { TdsCalculator } from './pages/TdsCalculator'
import { RemineralizationPlanner } from './pages/RemineralizationPlanner'
import { BreedingTimeline } from './pages/BreedingTimeline'
import { Logbook } from './pages/Logbook'
import { SettingsPage } from './pages/Settings'
import { ParameterCharts } from './pages/ParameterCharts'
import { TdsCreepAnalyzer } from './pages/TdsCreepAnalyzer'
import { BreedingPairs } from './pages/BreedingPairs'
import { MoltTracker } from './pages/MoltTracker'
import { GradeLog } from './pages/GradeLog'
import { ColonyEstimator } from './pages/ColonyEstimator'

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="reference"    element={<Reference />} />
            <Route path="parameters"   element={<ParameterChecker />} />
            <Route path="calculator"   element={<TdsCalculator />} />
            <Route path="remineralize" element={<RemineralizationPlanner />} />
            <Route path="breeding"     element={<BreedingTimeline />} />
            <Route path="breeding-pairs" element={<BreedingPairs />} />
            <Route path="logbook"      element={<Logbook />} />
            <Route path="charts"       element={<ParameterCharts />} />
            <Route path="tds-creep"    element={<TdsCreepAnalyzer />} />
            <Route path="molt"         element={<MoltTracker />} />
            <Route path="grades"       element={<GradeLog />} />
            <Route path="colony"       element={<ColonyEstimator />} />
            <Route path="settings"     element={<SettingsPage />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  )
}
