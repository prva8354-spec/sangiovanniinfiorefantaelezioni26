import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { login, signup, AuthError } from '@netlify/identity'
import { useIdentity } from '../lib/identity-context'
import { useState, useEffect } from 'react'
import { NavBar } from '../components/NavBar'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (ready && user) navigate({ to: '/squadra' })
  }, [ready, user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate({ to: '/squadra' })
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.status === 401 ? 'Email o password non corretti.' : err.message)
      } else {
        setError('Errore di accesso. Riprova.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Inserisci il tuo nome.'); return }
    if (!teamName.trim()) { setError('Inserisci il nome della tua squadra.'); return }
    if (password.length < 8) { setError('La password deve essere di almeno 8 caratteri.'); return }
    setLoading(true)
    try {
      await signup(email, password, { full_name: name, team_name: teamName })
      setSuccess(`Email di conferma inviata a ${email}. Clicca il link per attivare l'account.`)
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.status === 422 ? 'Email non valida o password troppo corta.' : err.message)
      } else {
        setError('Errore di registrazione. Riprova.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!ready) return null

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl">🗳️</span>
            <h1 className="text-3xl font-black text-white mt-3">FantaElezioni</h1>
            <p className="text-slate-400 mt-1">San Giovanni in Fiore 2026</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            {/* Mode toggle */}
            <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'login' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                Accedi
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                Registrati
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">📧</div>
                <p className="text-green-400 font-medium">{success}</p>
                <button onClick={() => setSuccess('')} className="mt-4 text-slate-400 text-sm underline">Torna al login</button>
              </div>
            ) : (
              <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Nome completo *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mario Rossi"
                        required
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Nome squadra *</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="es. I Florografi"
                        required
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@email.it"
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Minimo 8 caratteri' : '••••••••'}
                    required
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-black py-3 rounded-lg transition-colors"
                >
                  {loading ? '...' : mode === 'login' ? 'Accedi' : 'Crea account'}
                </button>

                {mode === 'signup' && (
                  <p className="text-slate-500 text-xs text-center">
                    La tua email sarà visibile solo all'amministratore.
                  </p>
                )}
              </form>
            )}
          </div>

          <p className="text-center mt-4 text-slate-500 text-sm">
            <Link to="/" className="text-slate-400 hover:text-white">← Torna alla home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
