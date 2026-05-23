import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { NavBar } from '../components/NavBar'
import { useIdentity } from '../lib/identity-context'
import { mayors, lists, allCouncilors, getMayorById, getCouncilorById } from '../data/candidates'
import { useEffect, useState } from 'react'

interface Team {
  id: number
  teamName: string
  mayorId: string
  councilors: string[]
  mayorPercentages: Record<string, number>
}

export const Route = createFileRoute('/squadra')({
  component: SquadraPage,
})

function SquadraPage() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(false)

  // Form state
  const [teamName, setTeamName] = useState('')
  const [selectedMayor, setSelectedMayor] = useState('')
  const [selectedCouncilors, setSelectedCouncilors] = useState<Set<string>>(new Set())
  const [percentages, setPercentages] = useState<Record<string, number>>({})
  const [filterMayor, setFilterMayor] = useState<string>('all')
  const [searchCouncilor, setSearchCouncilor] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!user) { navigate({ to: '/login' }); return }

    fetch('/api/teams')
      .then(r => r.json())
      .then(data => {
        setTeam(data)
        if (data) {
          setTeamName(data.teamName)
          setSelectedMayor(data.mayorId)
          setSelectedCouncilors(new Set(data.councilors))
          setPercentages(data.mayorPercentages || {})
        } else {
          const metaName = (user as any).metadata?.team_name
          if (metaName) setTeamName(metaName)
          setEditing(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [ready, user])

  const toggleCouncilor = (id: string) => {
    setSelectedCouncilors(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 10) next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    setError('')
    if (!teamName.trim()) { setError('Inserisci il nome della squadra.'); return }
    if (!selectedMayor) { setError('Scegli un candidato sindaco.'); return }
    if (selectedCouncilors.size < 5) { setError('Seleziona almeno 5 consiglieri.'); return }

    const pct = percentages[selectedMayor]
    if (pct == null || pct < 0 || pct > 100) {
      setError('Inserisci la previsione percentuale per il tuo sindaco (0-100).')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          mayorId: selectedMayor,
          councilors: [...selectedCouncilors],
          mayorPercentages: percentages,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Errore nel salvataggio'); return }
      setTeam(data)
      setEditing(false)
      setSuccess('Squadra salvata con successo! ✅')
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-64 text-slate-400">Caricamento...</div>
      </div>
    )
  }

  const filteredCouncilors = allCouncilors.filter(c => {
    if (filterMayor !== 'all' && c.mayorId !== filterMayor) return false
    if (searchCouncilor && !c.name.toLowerCase().includes(searchCouncilor.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">⚽ La mia squadra</h1>
            <p className="text-slate-400 mt-1">Crea e gestisci la tua squadra fantasy</p>
          </div>
          {team && !editing && (
            <button
              onClick={() => { setEditing(true); setError(''); setSuccess('') }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ✏️ Modifica
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-6">
            {success}
          </div>
        )}

        {team && !editing ? (
          /* View mode */
          <div className="space-y-6">
            <div className="bg-slate-800 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-900">
                  ⚽
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{team.teamName}</h2>
                  <p className="text-slate-400 text-sm">{user?.name || user?.email}</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 mb-4">
                <div className="text-slate-400 text-sm mb-1">🏛️ Sindaco scelto</div>
                <div className="text-xl font-bold text-amber-400">{getMayorById(team.mayorId)?.name}</div>
                {team.mayorPercentages[team.mayorId] != null && (
                  <div className="text-slate-300 text-sm mt-1">
                    Previsione: <strong className="text-amber-400">{team.mayorPercentages[team.mayorId]}%</strong>
                  </div>
                )}
              </div>

              <div>
                <div className="text-slate-400 text-sm mb-3">🧑‍💼 Consiglieri ({team.councilors.length})</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {team.councilors.map(cId => {
                    const c = getCouncilorById(cId)
                    if (!c) return null
                    return (
                      <div key={cId} className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2">
                        <span className="text-slate-300 text-sm flex-1">{c.name}</span>
                        <span className="text-slate-500 text-xs">{c.listName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* All percentages */}
              {Object.keys(team.mayorPercentages).length > 0 && (
                <div className="mt-4 bg-slate-900 rounded-xl p-4">
                  <div className="text-slate-400 text-sm mb-3">📊 Previsioni percentuali (tutti i sindaci)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {mayors.map(m => (
                      <div key={m.id} className="flex justify-between text-sm">
                        <span className="text-slate-400 truncate">{m.name}</span>
                        <span className="text-amber-400 font-bold ml-2">
                          {team.mayorPercentages[m.id] != null ? `${team.mayorPercentages[m.id]}%` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit mode */
          <div className="space-y-8">
            {/* Team name */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-3">📛 Nome squadra</h2>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="es. I Florografi"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Mayor selection */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">🏛️ Scegli il tuo sindaco</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mayors.map(mayor => (
                  <button
                    key={mayor.id}
                    onClick={() => setSelectedMayor(mayor.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      selectedMayor === mayor.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-600 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                      selectedMayor === mayor.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {mayor.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{mayor.name}</div>
                      <div className="text-xs text-slate-500">Candidato sindaco</div>
                    </div>
                    {selectedMayor === mayor.id && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Percentage predictions */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">📊 Previsioni percentuali</h2>
              <p className="text-slate-400 text-sm mb-4">
                Inserisci le tue previsioni per tutti i candidati. Le percentuali non devono necessariamente sommare a 100.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mayors.map(mayor => (
                  <div key={mayor.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                    selectedMayor === mayor.id ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-700'
                  }`}>
                    <div className="flex-1 text-sm font-medium text-slate-300">
                      {mayor.name}
                      {selectedMayor === mayor.id && <span className="text-amber-400 ml-1">★</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={percentages[mayor.id] ?? ''}
                        onChange={e => setPercentages(prev => ({ ...prev, [mayor.id]: parseFloat(e.target.value) || 0 }))}
                        className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-amber-500"
                        placeholder="0"
                      />
                      <span className="text-slate-400 text-sm">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Councilor selection */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">🧑‍💼 Scegli i consiglieri</h2>
                  <p className="text-slate-400 text-sm">Da 5 a 10 consiglieri, da qualsiasi coalizione</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  selectedCouncilors.size < 5 ? 'bg-red-500/20 text-red-400' :
                  selectedCouncilors.size === 10 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {selectedCouncilors.size}/10
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={searchCouncilor}
                  onChange={e => setSearchCouncilor(e.target.value)}
                  placeholder="🔍 Cerca un consigliere..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                />
                <select
                  value={filterMayor}
                  onChange={e => setFilterMayor(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="all">Tutte le coalizioni</option>
                  {mayors.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Lists */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {lists
                  .filter(l => filterMayor === 'all' || l.mayorId === filterMayor)
                  .filter(l => l.councilors.some(c =>
                    !searchCouncilor || c.name.toLowerCase().includes(searchCouncilor.toLowerCase())
                  ))
                  .map(list => (
                    <div key={list.id} className="border border-slate-700 rounded-xl overflow-hidden">
                      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                        <span className="font-bold text-white text-sm">📋 {list.name}</span>
                        <span className="text-slate-500 text-xs">{getMayorById(list.mayorId)?.name}</span>
                      </div>
                      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {list.councilors
                          .filter(c => !searchCouncilor || c.name.toLowerCase().includes(searchCouncilor.toLowerCase()))
                          .map(councilor => {
                            const selected = selectedCouncilors.has(councilor.id)
                            const disabled = !selected && selectedCouncilors.size >= 10
                            return (
                              <button
                                key={councilor.id}
                                onClick={() => !disabled && toggleCouncilor(councilor.id)}
                                disabled={disabled}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                                  selected ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400' :
                                  disabled ? 'opacity-40 cursor-not-allowed text-slate-500' :
                                  'hover:bg-slate-700 text-slate-300'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                  selected ? 'bg-amber-500 border-amber-500' : 'border-slate-600'
                                }`}>
                                  {selected && <span className="text-slate-900 text-xs font-black">✓</span>}
                                </span>
                                {councilor.name}
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Selected summary */}
              {selectedCouncilors.size > 0 && (
                <div className="mt-4 bg-slate-900 rounded-xl p-3">
                  <div className="text-slate-400 text-xs mb-2">Consiglieri selezionati:</div>
                  <div className="flex flex-wrap gap-1">
                    {[...selectedCouncilors].map(id => {
                      const c = getCouncilorById(id)
                      return c ? (
                        <button
                          key={id}
                          onClick={() => toggleCouncilor(id)}
                          className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          {c.name} ×
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-black py-4 rounded-xl transition-colors text-lg"
              >
                {saving ? '💾 Salvataggio...' : '💾 Salva squadra'}
              </button>
              {team && (
                <button
                  onClick={() => { setEditing(false); setError('') }}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 rounded-xl transition-colors font-medium"
                >
                  Annulla
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
