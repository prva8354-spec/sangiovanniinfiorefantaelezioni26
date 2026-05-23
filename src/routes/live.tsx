import { createFileRoute } from '@tanstack/react-router'
import { NavBar } from '../components/NavBar'
import { mayors } from '../data/candidates'
import { useEffect, useState } from 'react'

interface LiveData {
  mayorId: string
  percentage: number | null
  sezioniContate: number
  sezioniTotali: number
  updatedAt: string
}

interface ElectionResult {
  candidateId: string
  candidateType: string
  elected: boolean
  electedBallot: boolean
  percentage: number | null
}

export const Route = createFileRoute('/live')({
  component: LivePage,
})

function LivePage() {
  const [live, setLive] = useState<LiveData[]>([])
  const [results, setResults] = useState<ElectionResult[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    fetch('/api/results')
      .then(r => r.json())
      .then(data => {
        setLive(data.live ?? [])
        setResults(data.results ?? [])
        setLastUpdate(new Date().toLocaleTimeString('it-IT'))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  const liveMap: Record<string, LiveData> = {}
  for (const l of live) liveMap[l.mayorId] = l

  const resultMap: Record<string, ElectionResult> = {}
  for (const r of results) resultMap[r.candidateId] = r

  const hasData = live.length > 0 || results.some(r => r.percentage != null)

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE — Aggiornamento ogni 30 secondi
          </div>
          <h1 className="text-4xl font-black text-white mb-2">📡 Risultati Live</h1>
          <p className="text-slate-400">Elezioni Comunali San Giovanni in Fiore 2026</p>
          {lastUpdate && (
            <p className="text-slate-500 text-sm mt-2">Ultimo aggiornamento: {lastUpdate}</p>
          )}
        </div>
        <div className="mt-4">
  <button
    onClick={fetchData}
    className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm"
  >
    🔄 Aggiorna
  </button>
</div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Caricamento...</div>
        ) : !hasData ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🕐</div>
            <h2 className="text-2xl font-bold text-white mb-3">In attesa dei risultati</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              I dati live verranno pubblicati dall'amministratore durante lo spoglio delle elezioni.
              Torna qui il giorno delle elezioni!
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mayors.map(m => (
                <div key={m.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-lg font-black text-amber-400 mx-auto mb-2">
                    {m.name.charAt(0)}
                  </div>
                  <div className="text-white text-xs font-medium">{m.name}</div>
                  <div className="text-slate-500 text-xl font-black mt-1">— %</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sezioni contate */}
            {live[0] && live[0].sezioniTotali > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center">
                <div className="text-slate-400 text-sm">Sezioni scrutinate</div>
                <div className="text-3xl font-black text-white mt-1">
                  {live[0].sezioniContate} / {live[0].sezioniTotali}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${(live[0].sezioniContate / live[0].sezioniTotali) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Mayor results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mayors.map(mayor => {
                const ld = liveMap[mayor.id]
                const rd = resultMap[mayor.id]
                const pct = ld?.percentage ?? rd?.percentage ?? null
                const elected = rd?.elected
                const electedBallot = rd?.electedBallot

                return (
                  <div
                    key={mayor.id}
                    className={`bg-slate-800 border rounded-2xl p-5 ${
                      elected ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-xl font-black text-slate-900">
                        {mayor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{mayor.name}</div>
                        {elected && (
                          <div className={`text-sm font-bold ${electedBallot ? 'text-blue-400' : 'text-green-400'}`}>
                            {electedBallot ? '✓ Eletto al ballottaggio' : '✓ Eletto al 1° turno'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-4xl font-black text-center mb-3 text-amber-400">
                      {pct != null ? `${pct.toFixed(1)}%` : '—'}
                    </div>

                    {pct != null && (
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${elected ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
