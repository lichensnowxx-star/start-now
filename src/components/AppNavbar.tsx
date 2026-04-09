import { NavLink, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo'

export default function AppNavbar() {
  const location = useLocation()
  const inStartFlow = location.pathname === '/' || location.pathname === '/goal'
  const inActionFlow = location.pathname === '/path-select' || location.pathname === '/progress'
  const inArchive = location.pathname === '/dashboard'

  const navClass = (isActive: boolean) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-primary/20 text-primary' : 'text-text/70 hover:bg-white hover:text-text'
    }`

  return (
    <header className="sticky top-0 z-20 border-b border-primary/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex-nowrap md:px-6">
        <NavLink to="/" className="shrink-0">
          <BrandLogo compact />
        </NavLink>

        <nav className="order-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/70 p-1 md:order-2 md:w-auto">
          <NavLink to="/" className={navClass(inStartFlow)}>
            灵感起点
          </NavLink>
          <NavLink to="/path-select" className={navClass(inActionFlow)}>
            行动地图
          </NavLink>
          <NavLink to="/dashboard" className={navClass(inArchive)}>
            成长档案
          </NavLink>
        </nav>

        <button
          type="button"
          className="order-2 rounded-xl border border-primary/30 bg-white px-3 py-2 text-sm font-semibold text-text transition hover:bg-primary/10 md:order-3"
          onClick={() => window.alert('登录功能即将开放，当前进度会先保存在本地。')}
        >
          登录
        </button>
      </div>
    </header>
  )
}
