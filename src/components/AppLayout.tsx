import { Outlet } from 'react-router-dom'
import AppNavbar from './AppNavbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-cream text-text">
      <AppNavbar />
      <Outlet />
    </div>
  )
}
