import { createFileRoute } from '@tanstack/react-router'
import { NavBar } from '../components/NavBar'
import { mayors, getCouncilorById, getMayorById, lists } from '../data/candidates'
import { useEffect, useState } from 'react'

const ADMIN_PW = 'Fanta26.invenzione'

interface Team {
  id: number
  userId: string
  userName: string
  teamName: string
  mayorId: string
  councilors: string[]
  mayorPercentages: Record<string, number>
  createdAt: string
}

interface ElectionResult {
  candidateId: string
  candidateType: string
  elected: boolean
  electedBallot: boolean
  percentage: number | null
  listAboveThreshold: boolean
}

interface LiveData {
  mayorId: string
  percentage: number | null
  sezioniContate: number
  sezioniTotali: number
}

function calcScore(team: Team, results: ElectionResult[]): number {
  let score = 0
  const resultMap: Record<string, ElectionResult> = {}
  for (const r of results) resultMap[r.candidateId] = r

  const mayorResult = resultMap[team.mayorId]
  if (mayorResult) {
    
    if (mayorResult.elected && !mayorResult.electedBallot) {
  // eletto al primo turno
  score += 75

} else if (mayorResult.electedBallot) {
  // arrivato al ballottaggio
  score += 35

  // bonus finale ballottaggio
  if (mayorResult.elected) {
    // ha vinto il ballottaggio
    score += 40
  } else {
    // ha perso il ballottaggio
    score += 20
  }

} else if (mayorResult.percentage != null && mayorResult.percentage < 10) {
  score -= 10
}

    const allNonElected = results.filter(r => r.candidateType === 'mayor' && !r.elected && r.percentage != null)
    if (!mayorResult.elected && mayorResult.percentage != null && allNonElected.length > 0) {
      const maxPct = Math.max(...allNonElected.map(r => r.percentage!))
      if (mayorResult.percentage === maxPct) score += 25
    }

    const predicted = team.mayorPercentages?.[team.mayorId]
    if (predicted != null && mayorResult.percentage != null) {
      score += Math.max(0, 25 - Math.floor(Math.abs(predicted - mayorResult.percentage)))
    }
  }

  for (const cId of team.councilors) {
    const cr = resultMap[cId]
    if (!cr) continue
    if (cr.elected) score += 30
    else if (cr.listAboveThreshold) score += 10
  }

  return score
}

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [tab, setTab] = useState<'overview' | 'live' | 'results' | 'teams'>('overview')
  const [data, setData] = useState<{ teams: Team[]; results: ElectionResult[]; live: LiveData[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Live update form
  const [liveForm, setLiveForm] = useState<Record<string, { percentage: string; sezioniContate: string; sezioniTotali: string }>>({})

  // Results form
  const [resultsForm, setResultsForm] = useState<Record<string, {
    elected: boolean; electedBallot: boolean; percentage: string; listAboveThreshold: boolean
  }>>({})

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PW },
      body: JSON.stringify({ action: 'get_all' }),
    })
    const d = await res.json()
    setData(d)
    setLoading(false)

    // Initialize forms
    const lf: typeof liveForm = {}
    for (const m of mayors) {
      const ld = d.live?.find((l: LiveData) => l.mayorId === m.id)
      lf[m.id] = {
        percentage: ld?.percentage?.toString() ?? '',
        sezioniContate: ld?.sezioniContate?.toString() ?? '0',
        sezioniTotali: ld?.sezioniTotali?.toString() ?? '0',
      }
    }
    setLiveForm(lf)

    const rf: typeof resultsForm = {}
    for (const m of mayors) {
      const rd = d.results?.find((r: ElectionResult) => r.candidateId === m.id)
      rf[m.id] = {
        elected: rd?.elected ?? false,
        electedBallot: rd?.electedBallot ?? false,
        percentage: rd?.percentage?.toString() ?? '',
        listAboveThreshold: false,
      }
    }
    for (const l of lists) {
      for (const c of l.councilors) {
        const rd = d.results?.find((r: ElectionResult) => r.candidateId === c.id)
        rf[c.id] = {
          elected: rd?.elected ?? false,
          electedBallot: false,
          percentage: '',
          listAboveThreshold: rd?.listAboveThreshold ?? false,
        }
      }
    }
    setResultsForm(rf)
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_PW) {
      setAuthed(true)
      fetchData()
    } else {
      setPwError('Password errata.')
    }
  }

  const adminCall = async (body: object) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PW },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  const saveLive = async (mayorId: string) => {
    const f = liveForm[mayorId]
    await adminCall({
      action: 'update_live',
      mayorId,
      percentage: parseFloat(f.percentage) || 0,
      sezioniContate: parseInt(f.sezioniContate) || 0,
      sezioniTotali: parseInt(f.sezioniTotali) || 0,
    })
    setMsg('Live aggiornato!')
    setTimeout(() => setMsg(''), 2000)
    fetchData()
  }

  const saveMayorResult = async (mayorId: string) => {
    const f = resultsForm[mayorId]
    await adminCall({
      action: 'update_result',
      candidateId: mayorId,
      candidateType: 'mayor',
      elected: f.elected,
      electedBallot: f.electedBallot,
      percentage: parseFloat(f.percentage) || 0,
      listAboveThreshold: false,
      listId: '',
    })
    setMsg('Risultato salvato!')
    setTimeout(() => setMsg(''), 2000)
    fetchData()
  }

  const saveCouncilorResult = async (cId: string, listId: string) => {
    const f = resultsForm[cId]
    await adminCall({
      action: 'update_result',
      candidateId: cId,
      candidateType: 'councilor',
      elected: f.elected,
      electedBallot: false,
      percentage: 0,
      listAboveThreshold: f.listAboveThreshold,
      listId,
    })
    setMsg('Consigliere aggiornato!')
    setTimeout(() => setMsg(''), 2000)
    fetchData()
  }

  const deleteTeam = async (teamId: number) => {
    if (!confirm('Eliminare questa squadra?')) return
    await adminCall({ action: 'delete_team', teamId })
    fetchData()
  }

  if (!authed) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <span className="text-4xl">🔐</span>
              <h1 className="text-2xl font-black text-white mt-2">Admin Panel</h1>
            </div>
            <form onSubmit={handleAuth} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Password admin</label>
                <input
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                />
              </div>
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-lg">
                Accedi
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const ranked = data
    ? [...data.teams]
        .map(t => ({ ...t, score: calcScore(t, data.results) }))
        .sort((a, b) => b.score - a.score || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : []

  const mayorStats: Record<string, number> = {}
  if (data) {
    for (const t of data.teams) {
      mayorStats[t.mayorId] = (mayorStats[t.mayorId] || 0) + 1
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white">🔐 Admin Panel</h1>
          <button onClick={fetchData} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            🔄 Aggiorna
          </button>
        </div>

        {msg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-4">
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['overview', 'live', 'results', 'teams'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                tab === t ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {{ overview: '📊 Panoramica', live: '🔴 Live', results: '🏆 Risultati', teams: '👥 Squadre' }[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-10">Caricamento...</div>
        ) : tab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center">
                <div className="text-3xl font-black text-amber-400">{data?.teams.length ?? 0}</div>
                <div className="text-slate-400 text-sm mt-1">Squadre iscritte</div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 col-span-2">
                <div className="text-slate-400 text-sm mb-3">Distribuzione sindaci scelti</div>
                <div className="space-y-2">
                  {mayors.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="text-slate-300 text-sm flex-1">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: data?.teams.length ? `${((mayorStats[m.id] || 0) / data.teams.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-amber-400 font-bold text-sm w-6 text-right">{mayorStats[m.id] || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3">📋 Classifica attuale</h3>
              <div className="space-y-2">
                {ranked.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500 w-6">{i + 1}</span>
                    <span className="text-white font-medium flex-1">{t.teamName}</span>
                    <span className="text-slate-400">{t.userName}</span>
                    <span className="text-slate-400 text-xs hidden sm:block">{getMayorById(t.mayorId)?.name}</span>
                    <span className="text-amber-400 font-black w-12 text-right">{t.score} pt</span>
                  </div>
                ))}
                {ranked.length === 0 && <p className="text-slate-500 text-sm">Nessuna squadra ancora.</p>}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3">📧 Utenti registrati</h3>
              <div className="space-y-1">
                {data?.teams.map(t => (
                  <div key={t.id} className="flex items-center gap-3 text-sm py-1 border-b border-slate-700 last:border-0">
                    <span className="text-white">{t.userName}</span>
                    <span className="text-slate-500">—</span>
                    <span className="text-slate-400">{t.teamName}</span>
                    <span className="text-slate-600 ml-auto text-xs">{new Date(t.createdAt).toLocaleDateString('it-IT')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : tab === 'live' ? (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Aggiorna le percentuali in tempo reale durante lo spoglio.</p>
            {mayors.map(mayor => (
              <div key={mayor.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3">{mayor.name}</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">% voti</label>
                    <input
                      type="number" step="0.1" min="0" max="100"
                      value={liveForm[mayor.id]?.percentage ?? ''}
                      onChange={e => setLiveForm(p => ({ ...p, [mayor.id]: { ...p[mayor.id], percentage: e.target.value } }))}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Sezioni contate</label>
                    <input
                      type="number" min="0"
                      value={liveForm[mayor.id]?.sezioniContate ?? ''}
                      onChange={e => setLiveForm(p => ({ ...p, [mayor.id]: { ...p[mayor.id], sezioniContate: e.target.value } }))}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Sezioni totali</label>
                    <input
                      type="number" min="0"
                      value={liveForm[mayor.id]?.sezioniTotali ?? ''}
                      onChange={e => setLiveForm(p => ({ ...p, [mayor.id]: { ...p[mayor.id], sezioniTotali: e.target.value } }))}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => saveLive(mayor.id)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Salva live
                </button>
              </div>
            ))}
          </div>
        ) : tab === 'results' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-3">🏛️ Risultati Sindaci</h3>
              <div className="space-y-3">
                {mayors.map(mayor => (
                  <div key={mayor.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                    <h4 className="font-bold text-white mb-3">{mayor.name}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">% risultato reale</label>
                        <input
                          type="number" step="0.01" min="0" max="100"
                          value={resultsForm[mayor.id]?.percentage ?? ''}
                          onChange={e => setResultsForm(p => ({ ...p, [mayor.id]: { ...p[mayor.id], percentage: e.target.value } }))}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={resultsForm[mayor.id]?.elected ?? false}
                            onChange={e => setResultsForm(p => ({ ...p, [mayor.id]: { ...p[mayor.id], elected: e.target.checked } }))}
                            className="w-4 h-4"
                          />
                          <span className="text-slate-300 text-sm">Eletto</span>
                        </label>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={resultsForm[mayor.id]?.electedBallot ?? false}
                            onChange={e => setResultsForm(p => ({ ...p, [mayor.id]: { ...p[mayor.id], electedBallot: e.target.checked } }))}
                            className="w-4 h-4"
                          />
                          <span className="text-slate-300 text-sm">Al ballottaggio</span>
                        </label>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => saveMayorResult(mayor.id)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm w-full transition-colors"
                        >
                          Salva
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-3">🧑‍💼 Risultati Consiglieri</h3>
              <div className="space-y-4">
                {lists.map(list => (
                  <div key={list.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{list.name}</span>
                      <span className="text-slate-500 text-xs">{getMayorById(list.mayorId)?.name}</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {list.councilors.map(c => (
                        <div key={c.id} className="flex items-center gap-3">
                          <span className="text-slate-300 text-sm flex-1">{c.name}</span>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={resultsForm[c.id]?.elected ?? false}
                              onChange={e => setResultsForm(p => ({ ...p, [c.id]: { ...p[c.id], elected: e.target.checked } }))}
                              className="w-3.5 h-3.5"
                            />
                            <span className="text-slate-400 text-xs">Eletto</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={resultsForm[c.id]?.listAboveThreshold ?? false}
                              onChange={e => setResultsForm(p => ({ ...p, [c.id]: { ...p[c.id], listAboveThreshold: e.target.checked } }))}
                              className="w-3.5 h-3.5"
                            />
                            <span className="text-slate-400 text-xs">Lista soglia</span>
                          </label>
                          <button
                            onClick={() => saveCouncilorResult(c.id, list.id)}
                            className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-2 py-1 rounded transition-colors"
                          >
                            Salva
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Teams tab */
          <div className="space-y-3">
            {data?.teams.map(team => (
              <div key={team.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-white">{team.teamName}</div>
                    <div className="text-slate-400 text-sm">{team.userName}</div>
                    <div className="text-slate-500 text-xs">Creata: {new Date(team.createdAt).toLocaleString('it-IT')}</div>
                  </div>
                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Elimina
                  </button>
                </div>
                <div className="text-slate-400 text-xs mb-2">
                  Sindaco: <strong className="text-amber-400">{getMayorById(team.mayorId)?.name}</strong>
                  {team.mayorPercentages[team.mayorId] != null && (
                    <span className="ml-2">Prev: {team.mayorPercentages[team.mayorId]}%</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {team.councilors.map(cId => {
                    const c = getCouncilorById(cId)
                    return c ? (
                      <span key={cId} className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">
                        {c.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
