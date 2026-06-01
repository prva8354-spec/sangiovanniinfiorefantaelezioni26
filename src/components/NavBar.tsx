import { Link, useRouter } from '@tanstack/react-router'
import { useIdentity } from '../lib/identity-context'
import { useState } from 'react'
export function NavBar() {
  const { user, ready, logout } = useIdentity()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const handleLogout = async () => {
    await logout()
    router.navigate({ to: '/' })
  }
  return (
    <nav className="bg-slate-900/90 backdrop-blur-sm border-b border-amber-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🗳️</span>
            <div>
              <div className="font-black text-amber-400 text-sm sm:text-base leading-tight">
                FANTAELEZIONI
              </div>
              <div className="text-slate-400 text-xs leading-tight">
                SGF 2026
              </div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/regolamento"
              className="text-slate-300 hover:text-amber-400 transition-colors text-sm font-medium"
            >
              Regolamento
            </Link>
            <Link
              to="/classifica"
              className="text-slate-300 hover:text-amber-400 transition-colors text-sm font-medium"
            >
              Classifica
            </Link>
            <Link
              to="/live"
              className="text-slate-300 hover:text-amber-400 transition-colors text-sm font-medium"
            >
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </Link>
            <Link
              to="/ballottaggio"
              className="text-slate-300 hover:text-amber-400 transition-colors text-sm font-medium"
            >
              Ballottaggio
            </Link>
            {ready && user ? (
              <>
                <Link
                  to="/squadra"
                  className="text-slate-300 hover:text-amber-400 transition-colors text-sm font-medium"
                >
                  La mia squadra
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Esci
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Accedi / Registrati
              </Link>
            )}
          </div>
          <button
            className="md:hidden text-slate-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700 space-y-3">
            <Link
              to="/regolamento"
              className="block text-slate-300 hover:text-amber-400 py-1"
              onClick={() => setMenuOpen(false)}
            >
              Regolamento
            </Link>
            <Link
              to="/classifica"
              className="block text-slate-300 hover:text-amber-400 py-1"
              onClick={() => setMenuOpen(false)}
            >
              Classifica
            </Link>
            <Link
              to="/live"
              className="block text-slate-300 hover:text-amber-400 py-1"
              onClick={() => setMenuOpen(false)}
            >
              🔴 Live
            </Link>
            <Link
              to="/ballottaggio"
              className="block text-slate-300 hover:text-amber-400 py-1"
              onClick={() => setMenuOpen(false)}
            >
              Ballottaggio
            </Link>
            {ready && user ? (
              <>
                <Link
                  to="/squadra"
                  className="block text-slate-300 hover:text-amber-400 py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  La mia squadra
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-slate-300 hover:text-red-400 py-1"
                >
                  Esci
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-amber-400 font-bold py-1"
                onClick={() => setMenuOpen(false)}
              >
                Accedi / Registrati
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
