import { createFileRoute } from '@tanstack/react-router'
import { NavBar } from '../components/NavBar'
import { useEffect, useState } from 'react'

interface BallottaggioData {
  candidateId: string
  name: string
  percentage: number | null
}

export const Route = createFileRoute('/ballottaggio')({
  component: BallottaggioPage,
})

function BallottaggioPage() {
  const [data, setData] = useState<BallottaggioData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchData = () => {
    fetch('/api/ballottaggio')
      .then(r => r.json())
      .then(d => {
        setData(d ?? [])
        setLastUpdate(new Date().toLocaleTimeString('it-IT'))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 py-12">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
            🔵 LIVE BALLOTTAGGIO
          </div>

          <h1 className="text-4xl font-black text-white mb-2">
            🗳️ Ballottaggio
          </h1>

          <p className="text-slate-400">
            Aggiornamenti in tempo reale
          </p>

          {lastUpdate && (
            <p className="text-slate-500 text-sm mt-2">
              Ultimo aggiornamento: {lastUpdate}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">
            Caricamento...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {data.map(candidate => (
              <div
                key={candidate.candidateId}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
              >
                <div className="text-center">

                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-2xl font-black text-slate-900 mx-auto mb-4">
                    {candidate.name.charAt(0)}
                  </div>

                  <div className="text-2xl font-black text-white mb-3">
                    {candidate.name}
                  </div>

                  <div className="text-5xl font-black text-amber-400 mb-4">
                    {candidate.percentage != null
                      ? `${candidate.percentage.toFixed(1)}%`
                      : '—'}
                  </div>

                  {candidate.percentage != null && (
                    <div className="w-full bg-slate-700 rounded-full h-4">
                      <div
                        className="bg-amber-500 h-4 rounded-full transition-all"
                        style={{
                          width: `${candidate.percentage}%`
                        }}
                      />
                    </div>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  )
}
