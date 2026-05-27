import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import CoffeesPage  from './pages/CoffeesPage'
import ShotsPage    from './pages/ShotsPage'
import RecipesPage  from './pages/RecipesPage'
import ProfilePage  from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"         element={<Navigate to="/coffees" replace />} />
        <Route path="/coffees"  element={<CoffeesPage />} />
        <Route path="/shots"    element={<ShotsPage />} />
        <Route path="/recipes"  element={<RecipesPage />} />
        <Route path="/profile"  element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}
