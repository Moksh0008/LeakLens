import { BrowserRouter, NavLink, Navigate, Route, Routes, Link } from 'react-router-dom'
import Upload from './pages/Upload'
import './App.css'

const navLinkClassName = ({ isActive }) =>
  `app-nav__link${isActive ? ' app-nav__link--active' : ''}`

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__inner">
            <Link to="/upload" className="app-brand">
              <span className="app-brand__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
                  <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="app-brand__text">
                <span className="app-brand__name">LeakLens</span>
                <span className="app-brand__tagline">Procurement Spend Analysis</span>
              </span>
            </Link>
            <nav className="app-nav" aria-label="Primary">
              <NavLink to="/upload" className={navLinkClassName}>
                Upload
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/upload" element={<Upload />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>LeakLens &middot; FINATHON 2026 &middot; FIN-04 Procurement Spend Leakage</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
