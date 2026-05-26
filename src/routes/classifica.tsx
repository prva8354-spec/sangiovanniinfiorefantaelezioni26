import { createFileRoute } from '@tanstack/react-router'
import { NavBar } from '../components/NavBar'
import { getMayorById } from '../data/candidates'
import { useEffect, useState } from 'react'

interface TeamRow {
  id: number
  teamName: string
  userName: string
  mayorId: string
  councilors: string[]
  mayorPercentages: Record<string, number>
  createdAt: string
}

interface Result {
  candidateId: string
  candidateType: string
  elected: boolean
  electedBallot: boolean
  percentage: number | null
  listAboveThreshold: boolean
}

function calcScore(team: TeamRow, results: Result[]): number {
  let score = 0
  const resultMap: Record<string, Result> = {}
  for (const r of results) resultMap[r.candidateId] = r

  // Mayor score
  const mayorResult = resultMap[team.mayorId]
  console.log ('MAYOR RESULT:', mayorResult) 
  if (mayorResult) {
    if (mayorResult.elected && !mayorResult.electedBallot) score += 75
    else if (mayorResult.elected && mayorResult.electedBallot) score += 35
    else if (mayorResult.percentage != null && mayorResult.percentage < 10) score -= 10

    // Check second place: highest percentage among non-elected
    const allMayorResults = results.filter(r => r.candidateType === 'mayor' && !r.elected)
    if (!mayorResult.elected && mayorResult.percentage != null) {
      const maxNonElected = Math.max(...allMayorResults.map(r => r.percentage ?? 0))
      if (mayorResult.percentage === maxNonElected) score += 25
    }

    // Percentage bonus
    const predicted = team.mayorPercentages?.[team.mayorId]
    if (predicted != null && mayorResult.percentage != null) {
      console.log ('PREDICTED:', predicted, 'REAL:', mayorResult.percentage)
      const diff = Math.abs(predicted - mayorResult.percentage)
      const bonus = Math.max(0, 25 - diff) 
      score += bonus
    }
  }

  // Councilor score
  for (const cId of team.councilors) {
    const cr = resultMap[cId]
    if (!cr) continue
    if (cr.elected) score += 30
    else if (cr.listAboveThreshold) score += 10
  }
console.log ('TOTAL SCORE:', score)
  return Number(score.toFixed(2))
}

export const Route = createFileRoute('/classifica')({
  component: ClassificaPage,
})

function ClassificaPage() {
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/results')
      .then(r => r.json())
      .then(data => setResults(data.results ?? []))

    fetch('/api/classifica-data')
      .then(r => r.json())
      .then(data => {
        setTeams(data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const ranked = [...teams]
    .map(t => ({ ...t, score: calcScore(t, results) }))
    .sort((a, b) => b.score - a.score || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const hasResults = results.some(r => r.percentage != null)

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2">🏆 Classifica</h1>
          <p className="text-slate-400">FantaElezioni San Giovanni in Fiore 2026</p>
          {!hasResults && (
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-600 text-slate-400 px-4 py-2 rounded-full text-sm mt-4">
              ⏳ I punteggi verranno calcolati dopo le elezioni
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Caricamento...</div>
        ) : ranked.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗳️</div>
            <p className="text-slate-400 text-lg">Ancora nessuna squadra iscritta.</p>
            <p className="text-slate-500 mt-2">Sii il primo a partecipare!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranked.map((team, idx) => {
              const mayor = getMayorById(team.mayorId)
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-4 bg-slate-800/60 border rounded-2xl p-4 transition-colors ${
                    idx === 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700'
                  }`}
                >
                  <div className="w-10 text-center">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span className="text-slate-400 font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{team.teamName}</div>
                    <div className="text-slate-400 text-sm truncate">{team.userName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-xs">Sindaco</div>
                    <div className="text-slate-300 text-sm font-medium">{mayor?.name ?? team.mayorId}</div>
                  </div>
                  <div className="text-right ml-4 min-w-[60px]">
                    <div className="text-amber-400 font-black text-2xl">{team.score}</div>
                    <div className="text-slate-500 text-xs">punti</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
