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
            <Route path="reference" element={<Reference />} />
            <Route path="parameters" element={<ParameterChecker />} />
            <Route path="calculator" element={<TdsCalculator />} />
            <Route path="remineralize" element={<RemineralizationPlanner />} />
            <Route path="breeding" element={<BreedingTimeline />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  )
}
